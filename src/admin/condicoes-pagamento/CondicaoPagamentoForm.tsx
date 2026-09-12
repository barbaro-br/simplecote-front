import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { condicaoPagamentoSchema, type CondicaoPagamentoFormValues } from './condicoes-pagamento.schema'
import { useCriarCondicaoPagamento } from './condicoes-pagamento.api'

type Props = {
  aoSalvar: () => void
}

export function CondicaoPagamentoForm({ aoSalvar }: Props) {
  const criar = useCriarCondicaoPagamento()
  const [genericError, setGenericError] = useState<string | null>(null)

  const form = useForm<CondicaoPagamentoFormValues>({
    resolver: zodResolver(condicaoPagamentoSchema),
    defaultValues: { descricao: '' },
  })

  async function salvar(valores: CondicaoPagamentoFormValues) {
    setGenericError(null)
    try {
      await criar.mutateAsync(valores)
      form.reset()
      aoSalvar()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setGenericError(e instanceof ApiError ? e.message : 'Erro ao salvar condição de pagamento')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(salvar)} className="space-y-6" noValidate>
      <div>
        <h2 className="text-lg font-semibold tracking-tight ui-uppercase">Nova Condição de Pagamento</h2>
        <p className="text-sm text-muted-foreground">Ex: 14/21/28.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="descricao" className="text-sm font-medium ui-uppercase">
          Descrição
        </label>
        <Input
          id="descricao"
          autoFocus
          {...form.register('descricao')}
          placeholder="Ex: 14/21/28"
          className={form.formState.errors.descricao ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {form.formState.errors.descricao && (
          <p className="text-[13px] text-destructive font-medium">{form.formState.errors.descricao.message}</p>
        )}
      </div>

      {genericError && (
        <div role="alert" className="text-[13px] text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
          {genericError}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="ghost" onClick={aoSalvar} disabled={criar.isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={criar.isPending}>
          {criar.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
