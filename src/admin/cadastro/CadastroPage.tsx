import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Check, Eye, EyeSlash, Warning } from '@phosphor-icons/react'
import { HeroFundo } from '@/site/HeroFundo'
import { BrandLogo } from '@/site/BrandLogo'
import { useDebounce } from '@/shared/hooks/useDebounce'
import {
  dominioDaLoja,
  nomeParaSlug,
  slugFormatoValido,
  slugReservado,
} from '@/shared/domain/slug'
import {
  cadastroSchema,
  SENHA_MIN_CADASTRO,
  type CadastroFormValues,
} from './cadastro.schema'
import { useCadastrar, useValidarSlug } from './cadastro.api'

type EstadoSlug = 'vazio' | 'invalido' | 'reservado' | 'verificando' | 'livre' | 'em_uso'

export function CadastroPage() {
  const cadastrar = useCadastrar()
  const [erro, setErro] = useState<string | null>(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [slugTocado, setSlugTocado] = useState(false)
  const [cadastrado, setCadastrado] = useState(false)
  const [emailCadastrado, setEmailCadastrado] = useState('')

  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nomeSupermercado: '', slug: '', email: '', senha: '' },
  })

  const slug = useWatch({ control: form.control, name: 'slug' }) ?? ''
  const slugDebounced = useDebounce(slug, 400)

  // Só verifica no back quando o slug já é válido e não reservado (a reserva é
  // checada localmente com a lista compartilhada — mesmo pré-check do back).
  const alvoVerificacao =
    slugDebounced && slugFormatoValido(slugDebounced) && !slugReservado(slugDebounced)
      ? slugDebounced
      : null
  const verificacao = useValidarSlug(alvoVerificacao)

  const estadoSlug: EstadoSlug = (() => {
    if (!slug) return 'vazio'
    if (!slugFormatoValido(slug)) return 'invalido'
    if (slugReservado(slug)) return 'reservado'
    if (slug !== slugDebounced || verificacao.isLoading) return 'verificando'
    if (verificacao.data === 'LIVRE') return 'livre'
    if (verificacao.data === 'EM_USO') return 'em_uso'
    if (verificacao.data === 'RESERVADO') return 'reservado'
    if (verificacao.data === 'INVALIDO') return 'invalido'
    return 'verificando'
  })()

  const slugLivre = estadoSlug === 'livre'
  const senha = useWatch({ control: form.control, name: 'senha' }) ?? ''
  const senhaValida = senha.length >= SENHA_MIN_CADASTRO

  async function aoEnviar(v: CadastroFormValues) {
    if (estadoSlug !== 'livre') return
    setErro(null)
    try {
      await cadastrar.mutateAsync(v)
      setEmailCadastrado(v.email)
      setCadastrado(true)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.')
    }
  }

  if (cadastrado) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <HeroFundo variant="simples" />
        <div className="relative z-10 w-full max-w-sm space-y-6 px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <BrandLogo variant="mark" size="lg" />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-white ui-uppercase">
                Confira seu e-mail
              </h1>
              <p className="text-sm text-white/70">
                Enviamos um link de verificação para <strong>{emailCadastrado}</strong>. Clique nele
                para ativar sua conta e acessar o painel.
              </p>
            </div>
          </div>
          <Card className="space-y-4 border-white/10 bg-card/85 p-8 text-center backdrop-blur-xl">
            <p className="text-sm text-muted-foreground">
              Se o e-mail não chegar em alguns minutos, confira a caixa de spam.
            </p>
            <Link
              to="/login"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Ir para o login
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <HeroFundo variant="simples" />
      <div className="relative z-10 w-full max-w-sm space-y-6 px-4 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo variant="mark" size="lg" />
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">SimpleCote</h1>
            <p className="text-sm text-white/70">Crie a conta do seu supermercado</p>
          </div>
        </div>

        <Card className="border-white/10 bg-card/85 p-8 backdrop-blur-xl">
          <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="space-y-5">
            <Campo
              id="cadastro-nome"
              label="Nome do supermercado"
              erro={form.formState.errors.nomeSupermercado?.message}
            >
              <Controller
                control={form.control}
                name="nomeSupermercado"
                render={({ field }) => (
                  <Input
                    id="cadastro-nome"
                    autoComplete="organization"
                    placeholder="Supermercado do Zé"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      if (!slugTocado) {
                        form.setValue('slug', nomeParaSlug(e.target.value), { shouldValidate: true })
                      }
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={cadastrar.isPending}
                  />
                )}
              />
            </Campo>

            <Campo
              id="cadastro-slug"
              label="Endereço da loja"
              erro={form.formState.errors.slug?.message}
            >
              <Controller
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <Input
                    id="cadastro-slug"
                    autoComplete="off"
                    placeholder="supermercado-do-ze"
                    value={field.value}
                    onChange={(e) => {
                      setSlugTocado(true)
                      field.onChange(nomeParaSlug(e.target.value))
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={cadastrar.isPending}
                  />
                )}
              />
              <FeedbackSlug estado={estadoSlug} slug={slug} />
            </Campo>

            <Campo id="cadastro-email" label="E-mail" erro={form.formState.errors.email?.message}>
              <Input
                id="cadastro-email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com.br"
                {...form.register('email')}
                disabled={cadastrar.isPending}
              />
            </Campo>

            <Campo id="cadastro-senha" label="Senha" erro={form.formState.errors.senha?.message}>
              <div className="relative">
                <Input
                  id="cadastro-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10"
                  {...form.register('senha')}
                  disabled={cadastrar.isPending}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  disabled={cadastrar.isPending}
                >
                  {mostrarSenha ? (
                    <EyeSlash className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
              <p
                className={`flex items-center gap-1.5 text-[13px] font-medium ${senhaValida ? 'text-success' : 'text-muted-foreground'}`}
              >
                {senhaValida && <Check className="size-3.5" aria-hidden />}
                8+ caracteres
              </p>
            </Campo>

            {erro && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
              >
                <Warning className="size-4 shrink-0" />
                {erro}
              </div>
            )}

            <Button
              type="submit"
              disabled={!slugLivre || cadastrar.isPending}
              className="w-full"
            >
              {cadastrar.isPending ? 'Criando conta…' : 'Criar conta'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}

function Campo({
  id,
  label,
  erro,
  children,
}: {
  id: string
  label: string
  erro?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground ui-uppercase">
        {label}
      </label>
      {children}
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </div>
  )
}

function FeedbackSlug({ estado, slug }: { estado: EstadoSlug; slug: string }) {
  const preview = slug ? (
    <p className="text-xs text-muted-foreground">{dominioDaLoja(slug)}</p>
  ) : null

  if (estado === 'vazio') return <>{preview}</>

  const mensagens: Record<Exclude<EstadoSlug, 'vazio'>, { texto: string; classe: string }> = {
    invalido: {
      texto: 'Endereço inválido. Use minúsculas, números e hífens (3–40 caracteres).',
      classe: 'text-destructive',
    },
    reservado: { texto: 'Este endereço não está disponível.', classe: 'text-destructive' },
    verificando: { texto: 'Verificando disponibilidade…', classe: 'text-muted-foreground' },
    livre: { texto: 'Disponível', classe: 'text-success' },
    em_uso: { texto: 'Este endereço já está em uso.', classe: 'text-destructive' },
  }
  const atual = mensagens[estado]

  return (
    <>
      {preview}
      <p className={`text-xs font-medium ${atual.classe}`}>{atual.texto}</p>
    </>
  )
}
