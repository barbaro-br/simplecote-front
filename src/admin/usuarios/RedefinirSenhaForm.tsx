import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { redefinirSenhaFormSchema, type RedefinirSenhaFormValues } from './usuarios.schema'
import { useRedefinirSenhaUsuario } from './usuarios.api'

type Props = {
  usuarioId: string
  usuarioNome: string
  aoSalvar: () => void
}

export function RedefinirSenhaForm({ usuarioId, usuarioNome, aoSalvar }: Props) {
  const redefinir = useRedefinirSenhaUsuario()
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<RedefinirSenhaFormValues>({
    resolver: zodResolver(redefinirSenhaFormSchema),
    defaultValues: { senha: '', confirmar: '' },
  })

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
          <Input
            id="nova-senha"
            type="password"
            {...form.register('senha')}
            placeholder="Mínimo 8 caracteres"
            disabled={redefinir.isPending}
          />
          {err.senha && (
            <p className="text-[13px] text-destructive font-medium">{err.senha.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmar-senha" className="text-sm font-medium">
            Confirmar senha
          </label>
          <Input
            id="confirmar-senha"
            type="password"
            {...form.register('confirmar')}
            disabled={redefinir.isPending}
          />
          {err.confirmar && (
            <p className="text-[13px] text-destructive font-medium">{err.confirmar.message}</p>
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
