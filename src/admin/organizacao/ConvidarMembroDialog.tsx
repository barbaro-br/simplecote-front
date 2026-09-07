import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { convidarSchema, type ConvidarValues } from './organizacao.schema'
import { useConvidar } from './organizacao.api'
import { ROTULO_PAPEL } from '@/shared/domain/papel'

const inputCls =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

export function ConvidarMembroDialog({ aoFechar }: { aoFechar: () => void }) {
  const convidar = useConvidar()
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<ConvidarValues>({
    resolver: zodResolver(convidarSchema),
    defaultValues: { email: '', papel: 'OPERADOR' },
  })

  async function aoEnviar(v: ConvidarValues) {
    setErro(null)
    try {
      await convidar.mutateAsync(v)
      aoFechar()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Erro inesperado ao convidar.')
    }
  }

  const err = form.formState.errors

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="convite-email" className="text-sm font-medium ui-uppercase">
          E-mail
        </label>
        <Input
          id="convite-email"
          type="email"
          autoComplete="email"
          placeholder="pessoa@empresa.com.br"
          {...form.register('email')}
          disabled={convidar.isPending}
        />
        {err.email && <p className="text-xs text-destructive">{err.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="convite-papel" className="text-sm font-medium ui-uppercase">
          Papel
        </label>
        <select id="convite-papel" {...form.register('papel')} className={inputCls} disabled={convidar.isPending}>
          <option value="ADMIN">{ROTULO_PAPEL.ADMIN}</option>
          <option value="OPERADOR">{ROTULO_PAPEL.OPERADOR}</option>
        </select>
        {err.papel && <p className="text-xs text-destructive">{err.papel.message}</p>}
      </div>

      {erro && (
        <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
          {erro}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t pt-3">
        <Button type="button" variant="ghost" onClick={aoFechar} disabled={convidar.isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={convidar.isPending}>
          {convidar.isPending ? 'Enviando…' : 'Convidar'}
        </Button>
      </div>
    </form>
  )
}
