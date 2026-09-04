import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Check, Eye, EyeOff } from 'lucide-react'
import {
  SENHA_MIN,
  redefinirSenhaFormSchema,
  type RedefinirSenhaFormValues,
} from './usuarios.schema'
import { useRedefinirSenhaUsuario } from './usuarios.api'

type Props = {
  usuarioId: string
  usuarioNome: string
  aoSalvar: () => void
}

export function RedefinirSenhaForm({ usuarioId, usuarioNome, aoSalvar }: Props) {
  const redefinir = useRedefinirSenhaUsuario()
  const [erro, setErro] = useState<string | null>(null)
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false)

  const form = useForm<RedefinirSenhaFormValues>({
    resolver: zodResolver(redefinirSenhaFormSchema),
    defaultValues: { senha: '', confirmar: '' },
  })

  const senha = form.watch('senha') ?? ''
  const confirmar = form.watch('confirmar') ?? ''
  const senhaValida = senha.length >= SENHA_MIN
  const coincidem = confirmar !== '' && confirmar === senha

  const err = form.formState.errors

  async function aoEnviar(v: RedefinirSenhaFormValues) {
    setErro(null)
    try {
      await redefinir.mutateAsync({ id: usuarioId, senha: v.senha })
      aoSalvar()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.problem.detail : 'Erro inesperado ao trocar a senha.')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Trocar senha</h2>
        <p className="text-sm text-muted-foreground">{usuarioNome}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="nova-senha" className="text-sm font-medium">
            Nova senha
          </label>
          <div className="relative">
            <Input
              id="nova-senha"
              type={mostrarNovaSenha ? 'text' : 'password'}
              {...form.register('senha')}
              placeholder="Mínimo 8 caracteres"
              className="pr-10"
              disabled={redefinir.isPending}
            />
            <button
              type="button"
              onClick={() => setMostrarNovaSenha((v) => !v)}
              aria-label={mostrarNovaSenha ? 'Ocultar nova senha' : 'Mostrar nova senha'}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              disabled={redefinir.isPending}
            >
              {mostrarNovaSenha ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {err.senha && (
            <p className="text-[13px] text-destructive font-medium">{err.senha.message}</p>
          )}
          <p
            className={`flex items-center gap-1.5 text-[13px] font-medium ${senhaValida ? 'text-success' : 'text-muted-foreground'}`}
          >
            {senhaValida && <Check className="size-3.5" aria-hidden />}
            8+ caracteres
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmar-senha" className="text-sm font-medium">
            Confirmar senha
          </label>
          <div className="relative">
            <Input
              id="confirmar-senha"
              type={mostrarConfirmarSenha ? 'text' : 'password'}
              {...form.register('confirmar')}
              className="pr-10"
              disabled={redefinir.isPending}
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmarSenha((v) => !v)}
              aria-label={mostrarConfirmarSenha ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              disabled={redefinir.isPending}
            >
              {mostrarConfirmarSenha ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          {err.confirmar && (
            <p className="text-[13px] text-destructive font-medium">{err.confirmar.message}</p>
          )}
          {confirmar !== '' && (
            <p
              className={`flex items-center gap-1.5 text-[13px] font-medium ${coincidem ? 'text-success' : 'text-muted-foreground'}`}
            >
              {coincidem && <Check className="size-3.5" aria-hidden />}
              {coincidem ? 'As senhas coincidem' : 'As senhas ainda não coincidem'}
            </p>
          )}
        </div>
      </div>

      {erro && (
        <div
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive"
        >
          {erro}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t pt-2">
        <Button type="button" variant="ghost" onClick={aoSalvar} disabled={redefinir.isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={redefinir.isPending}>
          {redefinir.isPending ? 'Salvando…' : 'Trocar senha'}
        </Button>
      </div>
    </form>
  )
}
