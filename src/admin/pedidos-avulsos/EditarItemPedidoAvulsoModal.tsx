import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { ConfirmarDialog } from '@/admin/cotacoes/ConfirmarDialog'
import { moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useEditarItemPedidoAvulso, useRemoverItemPedidoAvulso } from './pedidos-avulsos.api'
import {
  editarItemPedidoAvulsoSchema,
  type EditarItemPedidoAvulsoFormValues,
  type ItemPedidoAvulso,
  type PedidoAvulso,
} from './pedidos-avulsos.schema'

type Props = {
  pedidoId: string
  item: ItemPedidoAvulso | null
  onClose: () => void
  onPedidoAtualizado: (pedido: PedidoAvulso) => void
}

// Edição de um item já adicionado ao pedido avulso — aberto pela navegação
// por teclado/clique na tabela de itens da página. Mesmo par preço da
// embalagem + quantidade do "adicionar item", só que pré-preenchido, e com a
// opção de remover o item (com confirmação — remover é irreversível).
export function EditarItemPedidoAvulsoModal({ pedidoId, item, onClose, onPedidoAtualizado }: Props) {
  const editar = useEditarItemPedidoAvulso(pedidoId)
  const remover = useRemoverItemPedidoAvulso(pedidoId)
  const [erro, setErro] = useState<string | null>(null)
  const [confirmandoRemover, setConfirmandoRemover] = useState(false)

  const form = useForm<EditarItemPedidoAvulsoFormValues>({
    resolver: zodResolver(editarItemPedidoAvulsoSchema),
    defaultValues: { precoEmbalagem: item?.precoEmbalagem, quantidade: item?.quantidade },
  })

  // Reabrir (ou trocar de item) sempre parte dos valores atuais do item.
  useEffect(() => {
    if (item) {
      form.reset({ precoEmbalagem: item.precoEmbalagem, quantidade: item.quantidade })
      setErro(null)
      setConfirmandoRemover(false)
    }
  }, [item, form])

  const precoEmbalagemNum = Number(form.watch('precoEmbalagem'))
  const quantidadeNum = Number(form.watch('quantidade'))
  const precoUnitarioPreview =
    item && precoEmbalagemNum > 0 ? precoEmbalagemNum / item.quantidadePorEmbalagemSnapshot : null
  const totalLinhaPreview = precoEmbalagemNum > 0 && quantidadeNum > 0 ? precoEmbalagemNum * quantidadeNum : null

  function tratarErro(e: unknown): string {
    if (e instanceof SessaoExpiradaError) return ''
    return e instanceof ApiError ? e.message : 'Não foi possível completar a operação. Tente novamente.'
  }

  async function aoSalvar(valores: EditarItemPedidoAvulsoFormValues) {
    if (!item) return
    setErro(null)
    try {
      const pedido = await editar.mutateAsync({ itemId: item.id, ...valores })
      onPedidoAtualizado(pedido)
      onClose()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(tratarErro(e))
    }
  }

  async function aoRemover() {
    if (!item) return
    try {
      const pedido = await remover.mutateAsync(item.id)
      onPedidoAtualizado(pedido)
      onClose()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setConfirmandoRemover(false)
      setErro(tratarErro(e))
    }
  }

  return (
    <Dialog open={item != null} onClose={onClose} title={item ? `Editar item — ${item.nomeSnapshot}` : 'Editar item'}>
      {item && (
        <form onSubmit={form.handleSubmit(aoSalvar)} noValidate className="space-y-4">
          <div className="rounded-md border bg-muted/30 px-3 py-2">
            <div className="truncate text-sm font-medium ui-uppercase">{item.nomeSnapshot}</div>
            <div className="text-[11px] text-muted-foreground">
              {item.unidadeSnapshot} c/ {item.quantidadePorEmbalagemSnapshot}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit-precoEmbalagem" className="text-sm font-medium ui-uppercase">
                Preço da embalagem
              </label>
              <Input
                id="edit-precoEmbalagem"
                type="number"
                step="0.01"
                min={0}
                autoFocus
                autoComplete="off"
                {...form.register('precoEmbalagem', { valueAsNumber: true })}
                className={form.formState.errors.precoEmbalagem ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {form.formState.errors.precoEmbalagem && (
                <p className="text-[13px] font-medium text-destructive">{form.formState.errors.precoEmbalagem.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-quantidade" className="text-sm font-medium ui-uppercase">
                Quantidade de embalagens
              </label>
              <Input
                id="edit-quantidade"
                type="number"
                min={1}
                autoComplete="off"
                {...form.register('quantidade', { valueAsNumber: true })}
                className={form.formState.errors.quantidade ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {form.formState.errors.quantidade && (
                <p className="text-[13px] font-medium text-destructive">{form.formState.errors.quantidade.message}</p>
              )}
            </div>
          </div>

          {(precoUnitarioPreview != null || totalLinhaPreview != null) && (
            <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                Preço unitário:{' '}
                <strong className="text-foreground">{precoUnitarioPreview != null ? moeda(precoUnitarioPreview) : '—'}</strong>
              </span>
              <span className="text-muted-foreground">
                Total do item:{' '}
                <strong className="text-foreground">{totalLinhaPreview != null ? moeda(totalLinhaPreview) : '—'}</strong>
              </span>
            </div>
          )}

          {erro && (
            <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
              {erro}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => setConfirmandoRemover(true)}
              disabled={editar.isPending}
            >
              <Trash className="size-4" />
              Remover item
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={editar.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editar.isPending}>
                {editar.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {confirmandoRemover && item && (
        <ConfirmarDialog
          titulo="Remover item"
          descricao={`Remover "${item.nomeSnapshot}" do pedido? Essa ação não pode ser desfeita.`}
          rotuloConfirmar="Remover item"
          pendente={remover.isPending}
          onConfirmar={aoRemover}
          onCancelar={() => setConfirmandoRemover(false)}
        />
      )}
    </Dialog>
  )
}
