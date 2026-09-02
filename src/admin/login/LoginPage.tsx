import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/shared/auth/AuthContext'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { AlertTriangle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8 px-4">
        {/* Logo / título */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">SimpleCote</h1>
          <p className="text-sm text-muted-foreground">Painel administrativo</p>
        </div>

        {/* Card do formulário */}
        <Card className="p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-foreground">
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
              <label htmlFor="login-senha" className="text-sm font-medium text-foreground">
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
                <AlertTriangle className="size-4 shrink-0" />
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
        </Card>
      </div>
    </div>
  )
}
