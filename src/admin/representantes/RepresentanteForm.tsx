import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useEmpresas } from '@/admin/empresas/empresas.api'
import {
  representanteFormSchema,
  type RepresentanteFormValues,
  type Representante,
} from './representantes.schema'
import { useAtualizarRepresentante, useCriarRepresentante } from './representantes.api'

const inputCls =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

type Props = {
  aoSalvar: () => void
  representanteParaEditar?: Representante
  empresaNomeAtual?: string
}

export function RepresentanteForm({ aoSalvar, representanteParaEditar, empresaNomeAtual }: Props) {
  const isEdit = !!representanteParaEditar
  const { data: empresas } = useEmpresas()
  const criar = useCriarRepresentante()
  const atualizar = useAtualizarRepresentante()
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<RepresentanteFormValues>({
    resolver: zodResolver(representanteFormSchema),
    defaultValues: {
      empresaId: representanteParaEditar?.empresaId ?? '',
      nome: representanteParaEditar?.nome ?? '',
      email: representanteParaEditar?.email ?? '',
      whatsapp: representanteParaEditar?.whatsapp ?? '',
    },
  })

  const isPending = criar.isPending || atualizar.isPending

  async function aoEnviar(v: RepresentanteFormValues) {
    setErro(null)
    if (!isEdit && !v.empresaId) {
      form.setError('empresaId', { message: 'Escolha uma empresa' })
      return
    }
    const whatsapp = v.whatsapp?.trim() ? v.whatsapp.trim() : undefined
    try {
      if (isEdit) {
        await atualizar.mutateAsync({
          id: representanteParaEditar.id,
          body: { nome: v.nome, email: v.email, whatsapp },
        })
      } else {
        await criar.mutateAsync({ empresaId: v.empresaId, nome: v.nome, email: v.email, whatsapp })
      }
      aoSalvar()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.problem.detail : 'Erro inesperado ao salvar.')
    }
  }

  const err = form.formState.errors

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} noValidate className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {isEdit ? 'Editar representante' : 'Novo representante'}
        </h2>
      </div>

      <div className="space-y-4">
        {isEdit ? (
          <div className="rounded-md border bg-muted/20 p-3 text-sm">
            <p className="font-medium">Empresa: {empresaNomeAtual ?? '—'}</p>
            <p className="text-xs text-muted-foreground">Para mover de empresa, fale com o suporte.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="rep-empresa" className="text-sm font-medium">
              Empresa
            </label>
            <select
              id="rep-empresa"
              {...form.register('empresaId')}
              className={inputCls}
              disabled={isPending}
            >
              <option value="">Selecione uma empresa…</option>
              {(empresas ?? []).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
            {err.empresaId && (
              <p className="text-[13px] text-destructive font-medium">{err.empresaId.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="rep-nome" className="text-sm font-medium">
            Nome
          </label>
          <Input id="rep-nome" {...form.register('nome')} placeholder="Ex: João Silva" disabled={isPending} />
          {err.nome && <p className="text-[13px] text-destructive font-medium">{err.nome.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="rep-email" className="text-sm font-medium">
              E-mail
            </label>
            <Input
              id="rep-email"
              type="email"
              {...form.register('email')}
              placeholder="joao@empresa.com"
              disabled={isPending}
            />
            {err.email && <p className="text-[13px] text-destructive font-medium">{err.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="rep-whatsapp" className="text-sm font-medium">
              WhatsApp <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <Input
              id="rep-whatsapp"
              {...form.register('whatsapp')}
              placeholder="(11) 99999-9999"
              disabled={isPending}
            />
          </div>
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
        <Button type="button" variant="ghost" onClick={aoSalvar} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
