import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, CircleNotch, Eye, EyeSlash } from '@phosphor-icons/react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { urlLoginDaLoja } from '@/shared/domain/slug'
import { rotuloPapel } from './organizacao.schema'
import { aceitarConviteSchema, type AceitarConviteValues } from './organizacao.schema'
import { useAceitarConvite, useContextoConvite } from './organizacao.api'

const SENHA_MIN = 8

export function AceitarConvitePage() {
  const { token = '' } = useParams()
  const contexto = useContextoConvite(token)
  const aceitar = useAceitarConvite(token)

  const [slug, setSlug] = useState<string | null>(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<AceitarConviteValues>({
    resolver: zodResolver(aceitarConviteSchema),
    defaultValues: { senha: '' },
  })
  const senha = useWatch({ control: form.control, name: 'senha' }) ?? ''
  const senhaValida = senha.length >= SENHA_MIN

  async function aoEnviar(v: AceitarConviteValues) {
    setErro(null)
    try {
      const { slug: novoSlug } = await aceitar.mutateAsync(v.senha)
      setSlug(novoSlug)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.')
    }
  }

  if (contexto.isLoading) {
    return (
      <div data-painel="dark" className="min-h-screen flex items-center justify-center bg-background">
        <div role="status" aria-label="Carregando" className="flex flex-col items-center gap-3 text-muted-foreground">
          <CircleNotch className="size-8 animate-spin" />
          <p className="text-sm">Carregando convite…</p>
        </div>
      </div>
    )
  }

  if (contexto.isError || !contexto.data) {
    return (
      <div data-painel="dark" className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 px-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight ui-uppercase">Convite inválido</h1>
            <p className="text-sm text-muted-foreground">
              Este link de convite não é válido ou já expirou. Peça um novo convite a quem administra a loja.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (slug) {
    return (
      <div data-painel="dark" className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 px-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight ui-uppercase">Conta criada!</h1>
            <p className="text-sm text-muted-foreground">
              Sua conta foi criada. Agora você já pode entrar no painel da loja.
            </p>
          </div>
          <Card className="p-8 text-center space-y-4">
            <a
              href={urlLoginDaLoja(slug)}
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              Ir para o login da minha loja
            </a>
          </Card>
        </div>
      </div>
    )
  }

  const { nomeLoja, papel } = contexto.data
  const err = form.formState.errors

  return (
    <div data-painel="dark" className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight ui-uppercase">Você foi convidado</h1>
          <p className="text-sm text-muted-foreground">
            Para entrar no painel de <strong>{nomeLoja}</strong> como{' '}
            <strong>{rotuloPapel(papel)}</strong>, defina sua senha.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="convite-senha" className="text-sm font-medium ui-uppercase">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="convite-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10"
                  {...form.register('senha')}
                  disabled={aceitar.isPending}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  disabled={aceitar.isPending}
                >
                  {mostrarSenha ? (
                    <EyeSlash className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
              {err.senha && <p className="text-xs text-destructive">{err.senha.message}</p>}
              <p className={`flex items-center gap-1.5 text-[13px] font-medium ${senhaValida ? 'text-success' : 'text-muted-foreground'}`}>
                {senhaValida && <Check className="size-3.5" aria-hidden />}
                8+ caracteres
              </p>
            </div>

            {erro && (
              <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
                {erro}
              </div>
            )}

            <Button type="submit" disabled={aceitar.isPending} className="w-full">
              {aceitar.isPending ? 'Criando conta…' : 'Aceitar convite'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
