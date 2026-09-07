import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '@/shared/api/api-client'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { Warning } from '@phosphor-icons/react'
import { codigoSchema, esqueciSenhaSchema, type EsqueciSenhaFormValues } from './recuperar-senha.schema'
import { redefinirSenhaFormSchema, type RedefinirSenhaFormValues } from '../usuarios/usuarios.schema'
import { useSolicitarRecuperacao, useRedefinirSenha } from './recuperar-senha.api'

type Etapa = 'email' | 'codigo' | 'senha' | 'sucesso'

type Provedor = 'gmail' | 'outlook' | null

const COOLDOWN_REENVIO = 45

function detectarProvedor(email: string): Provedor {
  const dominio = email.split('@')[1]?.toLowerCase() ?? ''
  if (dominio === 'gmail.com' || dominio === 'googlemail.com') return 'gmail'
  if (
    dominio === 'outlook.com' ||
    dominio === 'hotmail.com' ||
    dominio === 'live.com' ||
    dominio === 'msn.com'
  ) {
    return 'outlook'
  }
  return null
}

export function EsqueciSenhaPage() {
  const solicitar = useSolicitarRecuperacao()
  const redefinir = useRedefinirSenha()
  const navigate = useNavigate()

  const [etapa, setEtapa] = useState<Etapa>('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [erro, setErro] = useState<string | null>(null)
  const [contador, setContador] = useState(3)

  const emailForm = useForm<EsqueciSenhaFormValues>({
    resolver: zodResolver(esqueciSenhaSchema),
  })

  const senhaForm = useForm<RedefinirSenhaFormValues>({
    resolver: zodResolver(redefinirSenhaFormSchema),
    defaultValues: { senha: '', confirmar: '' },
  })

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (etapa !== 'sucesso') return
    if (contador <= 0) {
      navigate('/login', { replace: true })
      return
    }
    const timer = setTimeout(() => setContador((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [etapa, contador, navigate])

  function mensagemDeErro(e: unknown): string {
    return e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.'
  }

  async function aoEnviarEmail(valores: EsqueciSenhaFormValues) {
    setErro(null)
    try {
      await solicitar.mutateAsync(valores.email)
      setEmail(valores.email)
      setCodigo('')
      setEtapa('codigo')
    } catch (e: unknown) {
      setErro(mensagemDeErro(e))
    }
  }

  async function reenviarCodigo() {
    setErro(null)
    try {
      await solicitar.mutateAsync(email)
      setCooldown(COOLDOWN_REENVIO)
    } catch (e: unknown) {
      setErro(mensagemDeErro(e))
    }
  }

  async function aoEnviarSenha(valores: RedefinirSenhaFormValues) {
    setErro(null)
    try {
      await redefinir.mutateAsync({ email, codigo, novaSenha: valores.senha })
      setEtapa('sucesso')
    } catch (e: unknown) {
      if (e instanceof ApiError && e.problem.status === 422) {
        setCodigo('')
        setEtapa('codigo')
        setErro(e.message)
      } else {
        setErro(mensagemDeErro(e))
      }
    }
  }

  function aoMudarCodigo(e: ChangeEvent<HTMLInputElement>) {
    setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))
  }

  function voltarParaEmail() {
    setErro(null)
    setCodigo('')
    setEtapa('email')
  }

  const provedor = detectarProvedor(email)
  const codigoValido = codigoSchema.safeParse(codigo).success

  if (etapa === 'sucesso') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 px-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight ui-uppercase">Senha redefinida</h1>
            <p className="text-sm text-muted-foreground">
              Sua senha foi alterada com sucesso. Agora você já pode entrar com a nova senha.
            </p>
          </div>
          <Card className="p-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">Redirecionando em {contador}…</p>
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight ui-uppercase">
            {etapa === 'senha' ? 'Redefinir senha' : 'Recuperar senha'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {etapa === 'email' && 'Informe seu e-mail para receber um código de redefinição.'}
            {etapa === 'codigo' && `Enviamos um código de 6 dígitos para ${email}.`}
            {etapa === 'senha' && 'Defina uma nova senha para a sua conta.'}
          </p>
        </div>

        <Card className="p-8">
          {etapa === 'email' && (
            <form onSubmit={emailForm.handleSubmit(aoEnviarEmail)} noValidate className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="esqueci-email" className="text-sm font-medium text-foreground ui-uppercase">
                  E-mail
                </label>
                <Input
                  id="esqueci-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com.br"
                  {...emailForm.register('email')}
                  disabled={solicitar.isPending}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              {erro && <AlertaErro mensagem={erro} />}

              <Button type="submit" disabled={solicitar.isPending} className="w-full">
                {solicitar.isPending ? 'Enviando…' : 'Enviar código'}
              </Button>

              <Link
                to="/login"
                className="block text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                Voltar para o login
              </Link>
            </form>
          )}

          {etapa === 'codigo' && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="esqueci-codigo" className="text-sm font-medium text-foreground ui-uppercase">
                  Código de 6 dígitos
                </label>
                <Input
                  id="esqueci-codigo"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={codigo}
                  onChange={aoMudarCodigo}
                  className="text-center text-lg tracking-[0.5em]"
                />
              </div>

              {erro && <AlertaErro mensagem={erro} />}

              <Button
                type="button"
                disabled={!codigoValido}
                onClick={() => {
                  setErro(null)
                  setEtapa('senha')
                }}
                className="w-full"
              >
                Continuar
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={reenviarCodigo}
                  disabled={cooldown > 0 || solicitar.isPending}
                  className="font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                >
                  {cooldown > 0 ? `Reenviar código (${cooldown}s)` : 'Reenviar código'}
                </button>
                <button
                  type="button"
                  onClick={voltarParaEmail}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  Trocar e-mail
                </button>
              </div>

              {provedor === 'gmail' && (
                <a
                  href="https://mail.google.com/mail/u/0/#search/in%3Ainbox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses({ className: 'w-full' })}
                >
                  Abrir Gmail
                </a>
              )}
              {provedor === 'outlook' && (
                <a
                  href="https://outlook.live.com/mail/0/inbox"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses({ className: 'w-full' })}
                >
                  Abrir Outlook
                </a>
              )}
            </div>
          )}

          {etapa === 'senha' && (
            <form onSubmit={senhaForm.handleSubmit(aoEnviarSenha)} noValidate className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="nova-senha" className="text-sm font-medium text-foreground ui-uppercase">
                  Nova senha
                </label>
                <Input
                  id="nova-senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  {...senhaForm.register('senha')}
                  disabled={redefinir.isPending}
                />
                {senhaForm.formState.errors.senha && (
                  <p className="text-xs text-destructive">{senhaForm.formState.errors.senha.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmar-senha" className="text-sm font-medium text-foreground ui-uppercase">
                  Confirmar senha
                </label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  autoComplete="new-password"
                  {...senhaForm.register('confirmar')}
                  disabled={redefinir.isPending}
                />
                {senhaForm.formState.errors.confirmar && (
                  <p className="text-xs text-destructive">{senhaForm.formState.errors.confirmar.message}</p>
                )}
              </div>

              {erro && <AlertaErro mensagem={erro} />}

              <Button type="submit" disabled={redefinir.isPending} className="w-full">
                {redefinir.isPending ? 'Salvando…' : 'Redefinir senha'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}

function AlertaErro({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
    >
      <Warning className="size-4 shrink-0" />
      {mensagem}
    </div>
  )
}
