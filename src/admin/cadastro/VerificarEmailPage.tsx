import { useSearchParams } from 'react-router-dom'
import { CircleNotch, Warning } from '@phosphor-icons/react'
import { Card } from '@/shared/components/ui/card'
import { urlLoginDaLoja } from '@/shared/domain/slug'
import { useVerificarEmail } from './cadastro.api'

export function VerificarEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const verificacao = useVerificarEmail(token)

  if (verificacao.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          role="status"
          aria-label="Verificando"
          className="flex flex-col items-center gap-3 text-muted-foreground"
        >
          <CircleNotch className="size-8 animate-spin" />
          <p className="text-sm">Verificando seu e-mail…</p>
        </div>
      </div>
    )
  }

  if (verificacao.isError || !verificacao.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 px-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight ui-uppercase">
              Este link é inválido ou expirou
            </h1>
            <p className="text-sm text-muted-foreground">
              A confirmação pode já ter sido feita, ou o link perdeu a validade. Acesse sua conta
              pelo login.
            </p>
          </div>
          <Card className="p-8 text-center space-y-4">
            <div
              role="alert"
              className="flex items-center justify-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
            >
              <Warning className="size-4 shrink-0" />
              Não foi possível verificar este link.
            </div>
            <a
              href="/login"
              className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              Ir para o login
            </a>
          </Card>
        </div>
      </div>
    )
  }

  const slug = verificacao.data.slug

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight ui-uppercase">Conta ativada!</h1>
          <p className="text-sm text-muted-foreground">
            Seu e-mail foi confirmado. Agora você já pode entrar no painel da sua loja.
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
