import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '@/shared/api/api-client'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { redefinirSenhaFormSchema, type RedefinirSenhaFormValues } from '../usuarios/usuarios.schema'
import { useRedefinirSenha } from './recuperar-senha.api'

type Estado = 'form' | 'sucesso' | 'invalido'

export function RedefinirSenhaPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const redefinir = useRedefinirSenha()
  const [estado, setEstado] = useState<Estado>('form')
  const [mensagemInvalida, setMensagemInvalida] = useState<string | null>(null)
  const [erroServidor, setErroServidor] = useState<string | null>(null)
  const [contador, setContador] = useState(3)

  useEffect(() => {
    if (estado !== 'sucesso') return
    if (contador <= 0) {
      navigate('/login', { replace: true })
      return
    }
    const timer = setTimeout(() => setContador((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [estado, contador, navigate])

  const form = useForm<RedefinirSenhaFormValues>({
    resolver: zodResolver(redefinirSenhaFormSchema),
    defaultValues: { senha: '', confirmar: '' },
  })

  const err = form.formState.errors

  async function aoEnviar(valores: RedefinirSenhaFormValues) {
    setErroServidor(null)
    try {
      await redefinir.mutateAsync({ token: token ?? '', novaSenha: valores.senha })
      setEstado('sucesso')
    } catch (e: unknown) {
      if (e instanceof ApiError && e.problem.status >= 400 && e.problem.status < 500) {
        setMensagemInvalida(e.message)
        setEstado('invalido')
      } else {
        setErroServidor(e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.')
      }
    }
  }

  if (estado === 'sucesso') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 px-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Senha redefinida</h1>
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

  if (estado === 'invalido') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-6 px-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Link inválido</h1>
            <p className="text-sm text-muted-foreground">
              {mensagemInvalida ?? 'O link de redefinição é inválido ou expirou.'}
            </p>
          </div>
          <Card className="p-8 text-center">
            <Link
              to="/esqueci-senha"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Solicitar novo link
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
          <h1 className="text-2xl font-bold tracking-tight">Redefinir senha</h1>
          <p className="text-sm text-muted-foreground">Defina uma nova senha para a sua conta.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="nova-senha" className="text-sm font-medium text-foreground">
                Nova senha
              </label>
              <Input
                id="nova-senha"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                {...form.register('senha')}
                disabled={redefinir.isPending}
              />
              {err.senha && <p className="text-xs text-destructive">{err.senha.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmar-senha" className="text-sm font-medium text-foreground">
                Confirmar senha
              </label>
              <Input
                id="confirmar-senha"
                type="password"
                autoComplete="new-password"
                {...form.register('confirmar')}
                disabled={redefinir.isPending}
              />
              {err.confirmar && <p className="text-xs text-destructive">{err.confirmar.message}</p>}
            </div>

            {erroServidor && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
              >
                <AlertTriangle className="size-4 shrink-0" />
                {erroServidor}
              </div>
            )}

            <Button type="submit" disabled={redefinir.isPending} className="w-full">
              {redefinir.isPending ? 'Salvando…' : 'Redefinir senha'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
