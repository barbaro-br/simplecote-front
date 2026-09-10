import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/shared/auth/useAuth'
import { useTenant } from '@/shared/tenant/useTenant'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Superficie } from '@/shared/ui'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { RouteLoadingFallback } from '@/shared/components/ui/route-loading'
import { CREDITO_DESENVOLVEDOR } from '@/shared/creditos-desenvolvedor'
import { Warning } from '@phosphor-icons/react'
import { HeroFundo } from '@/site/HeroFundo'
import { BrandLogo } from '@/site/BrandLogo'

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const { slug, existe, verificando } = useTenant()
  const navigate = useNavigate()
  const [erroServidor, setErroServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setErroServidor(null)
    try {
      await login(values.email, values.senha)
      navigate('/admin', { replace: true })
    } catch (err) {
      if (err instanceof SessaoExpiradaError) return
      if (err instanceof ApiError) {
        setErroServidor(err.message)
      } else {
        setErroServidor('Erro inesperado. Tente novamente.')
      }
    }
  }

  // Enquanto o slug do hostname está sendo validado, mostra o loading.
  if (verificando) {
    return <RouteLoadingFallback />
  }

  // Subdomínio de loja que não existe → mensagem clara (identidade SimpleCote),
  // sem um formulário de login que só falharia.
  if (slug !== null && existe === false) {
    return (
      <div data-painel="dark" className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <HeroFundo variant="simples" />
        <div className="relative z-10 w-full max-w-sm space-y-8 px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <BrandLogo variant="mark" size="lg" />
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-white">SimpleCote</h1>
              <p className="text-sm text-white/70">Cotações simplificadas</p>
            </div>
          </div>
          <Superficie className="space-y-4 p-8 text-center backdrop-blur-xl">
            <p className="text-sm text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">Esse endereço de loja não existe.</p>
            <a
              href="https://simplecote.com.br"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Ir para o site
            </a>
          </Superficie>
        </div>
      </div>
    )
  }

  return (
    <div data-painel="dark" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <HeroFundo variant="simples" />
      <div className="relative z-10 w-full max-w-sm space-y-8 px-4">
        {/* Logo / título — identidade do produto, igual para qualquer visitante */}
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo variant="mark" size="lg" />
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">SimpleCote</h1>
            <p className="text-sm text-white/70">Cotações simplificadas</p>
          </div>
        </div>

        {/* Card do formulário */}
        <Superficie className="space-y-6 p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-foreground ui-uppercase">
                E-mail
              </label>
              <Input
                id="login-email"
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

            {/* Senha */}
            <div className="space-y-1.5">
              <label htmlFor="login-senha" className="text-sm font-medium text-foreground ui-uppercase">
                Senha
              </label>
              <Input
                id="login-senha"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('senha')}
                disabled={isSubmitting}
              />
              {errors.senha && (
                <p className="text-xs text-destructive">{errors.senha.message}</p>
              )}
            </div>

            {/* Erro do servidor */}
            {erroServidor && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
              >
                <Warning className="size-4 shrink-0" />
                {erroServidor}
              </div>
            )}

            {/* Submit */}
            <Button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          {/* Recuperação de senha */}
          <Link
            to="/esqueci-senha"
            className="block text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Esqueci minha senha
          </Link>

          {/* Entrada para o cadastro público */}
          <Link
            to="/cadastro"
            className="block text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Criar conta
          </Link>

          {CREDITO_DESENVOLVEDOR.href ? (
            <a
              href={CREDITO_DESENVOLVEDOR.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-muted-foreground/70 mt-2 hover:text-foreground hover:underline"
            >
              {CREDITO_DESENVOLVEDOR.texto}
            </a>
          ) : (
            <p className="text-center text-xs text-muted-foreground/70 mt-2">
              {CREDITO_DESENVOLVEDOR.texto}
            </p>
          )}
        </Superficie>
      </div>
    </div>
  )
}
