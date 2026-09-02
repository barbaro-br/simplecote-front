import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Button, buttonClasses } from '@/shared/components/ui/button'
import { esqueciSenhaSchema, type EsqueciSenhaFormValues } from './recuperar-senha.schema'
import { useSolicitarRecuperacao } from './recuperar-senha.api'

const MENSAGEM_GENERICA =
  'Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.'

type Provedor = 'gmail' | 'outlook' | null

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
  const [enviado, setEnviado] = useState(false)
  const [emailEnviado, setEmailEnviado] = useState<string | null>(null)
  const [erroServidor, setErroServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EsqueciSenhaFormValues>({
    resolver: zodResolver(esqueciSenhaSchema),
  })

  async function aoEnviar(valores: EsqueciSenhaFormValues) {
    setErroServidor(null)
    try {
      await solicitar.mutateAsync(valores.email)
      setEmailEnviado(valores.email)
      setEnviado(true)
    } catch (e: unknown) {
      setErroServidor(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
    }
  }

  const provedor = emailEnviado ? detectarProvedor(emailEnviado) : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground">
            Informe seu e-mail para receber um link de redefinição.
          </p>
        </div>

        <Card className="p-8">
          {enviado ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">{MENSAGEM_GENERICA}</p>
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
              <Link
                to="/login"
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(aoEnviar)} noValidate className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="esqueci-email" className="text-sm font-medium text-foreground">
                  E-mail
                </label>
                <Input
                  id="esqueci-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com.br"
                  {...register('email')}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {erroServidor && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
                >
                  {erroServidor}
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Enviando…' : 'Enviar link'}
              </Button>

              <Link
                to="/login"
                className="block text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                Voltar para o login
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
