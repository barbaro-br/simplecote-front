import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CircleNotch, Package, Trash, X } from '@phosphor-icons/react'
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

export function EditarItemPedidoAvulsoModal({ pedidoId, item, onClose, onPedidoAtualizado }: Props) {
  const editar = useEditarItemPedidoAvulso(pedidoId)
  const remover = useRemoverItemPedidoAvulso(pedidoId)
  const [erro, setErro] = useState<string | null>(null)
  const [confirmandoRemover, setConfirmandoRemover] = useState(false)

  const form = useForm<EditarItemPedidoAvulsoFormValues>({
    resolver: zodResolver(editarItemPedidoAvulsoSchema),
    defaultValues: {
      precoEmbalagem: item?.precoEmbalagem,
      quantidade: item?.quantidade,
      unidade: item?.unidadeSnapshot ?? '',
      quantidadePorEmbalagem: item?.quantidadePorEmbalagemSnapshot,
    },
  })

  // Reabrir (ou trocar de item) sempre parte dos valores atuais do item.
  useEffect(() => {
    if (item) {
      form.reset({
        precoEmbalagem: item.precoEmbalagem,
        quantidade: item.quantidade,
        unidade: item.unidadeSnapshot,
        quantidadePorEmbalagem: item.quantidadePorEmbalagemSnapshot,
      })
      setErro(null)
      setConfirmandoRemover(false)
    }
  }, [item, form])

  const precoEmbalagemNum = Number(form.watch('precoEmbalagem'))
  const quantidadeNum = Number(form.watch('quantidade'))
  const unidadeWatch = form.watch('unidade')
  const fatorWatch = form.watch('quantidadePorEmbalagem')

  const unidadeAtiva = (unidadeWatch?.trim() ? unidadeWatch.trim() : item?.unidadeSnapshot) || 'UN'
  const fatorAtivo = Number(fatorWatch) > 0 ? Number(fatorWatch) : item?.quantidadePorEmbalagemSnapshot || 1

  const precoUnitarioPreview =
    item && precoEmbalagemNum > 0 ? precoEmbalagemNum / fatorAtivo : null
  const totalLinhaPreview =
    precoEmbalagemNum > 0 && quantidadeNum > 0 ? precoEmbalagemNum * quantidadeNum : null

  function tratarErro(e: unknown): string {
    if (e instanceof SessaoExpiradaError) return ''
    return e instanceof ApiError ? e.message : 'Não foi possível completar a operação. Tente novamente.'
  }

  async function aoSalvar(valores: EditarItemPedidoAvulsoFormValues) {
    if (!item) return
    setErro(null)
    try {
      const payload: EditarItemPedidoAvulsoFormValues = {
        precoEmbalagem: valores.precoEmbalagem,
        quantidade: valores.quantidade,
      }
      if (valores.unidade && valores.unidade !== item.unidadeSnapshot) {
        payload.unidade = valores.unidade
      }
      if (
        valores.quantidadePorEmbalagem &&
        valores.quantidadePorEmbalagem !== item.quantidadePorEmbalagemSnapshot
      ) {
        payload.quantidadePorEmbalagem = valores.quantidadePorEmbalagem
      }
      const pedido = await editar.mutateAsync({ itemId: item.id, ...payload })
      toast.success(`"${item.nomeSnapshot}" atualizado com sucesso!`)
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
      toast.success(`"${item.nomeSnapshot}" removido do pedido.`)
      onPedidoAtualizado(pedido)
      onClose()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setConfirmandoRemover(false)
      setErro(tratarErro(e))
    }
  }

  return (
    <Dialog
      open={item != null}
      onClose={onClose}
      size="md"
      ariaLabel={item ? `Editar item — ${item.nomeSnapshot}` : 'Editar item'}
      className="p-0 rounded-none border border-white/15 bg-[#0d1410] shadow-2xl max-w-lg text-on-surface overflow-hidden"
    >
      {item && (
        <div className="flex flex-col bg-[#0d1410]">
          {/* Cabeçalho Contábil */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3.5 bg-[#141e17]">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center bg-primary/15 border border-primary/30 text-primary rounded-none shadow-[0_0_12px_rgba(78,222,163,0.2)]">
                <Package className="size-4" weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Editar item do pedido
                </span>
                <div className="text-[11px] font-mono text-on-surface-variant/80 mt-0.5">
                  Ajuste preço, quantidade ou fator da embalagem
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 rounded-none transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="size-4" weight="bold" />
            </button>
          </div>

          <form onSubmit={form.handleSubmit(aoSalvar)} noValidate className="p-5 space-y-4 font-sans bg-[#0d1410]">
            {/* Produto Snapshot */}
            <div className="rounded-none border border-white/15 bg-[#141e17] p-3 px-4 font-mono">
              <div className="truncate text-xs font-bold uppercase text-on-surface">{item.nomeSnapshot}</div>
              <div className="text-[10px] text-on-surface-variant mt-0.5">
                Snapshot original: {item.unidadeSnapshot} com {item.quantidadePorEmbalagemSnapshot}
              </div>
            </div>

            {/* Ajuste de Embalagem e Fator */}
            <div className="rounded-none border border-primary/25 bg-[#121c15] p-3 px-3.5 font-mono text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Embalagem Comercial
                </span>
                <span className="text-[10px] text-on-surface-variant bg-white/5 px-1.5 py-0.5 border border-white/10">
                  1 emb = {fatorAtivo} {unidadeAtiva}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="edit-unidade" className="text-[10px] uppercase font-bold text-on-surface-variant">
                    Unidade de venda
                  </label>
                  <Input
                    id="edit-unidade"
                    autoComplete="off"
                    {...form.register('unidade')}
                    placeholder="Ex: FD, CX, PCT…"
                    className="rounded-none bg-[#131b15] border-white/15 text-xs font-mono text-on-surface h-9 focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-fator" className="text-[10px] uppercase font-bold text-on-surface-variant">
                    Fator (Qtd. por emb.)
                  </label>
                  <Input
                    id="edit-fator"
                    type="number"
                    min={1}
                    autoComplete="off"
                    {...form.register('quantidadePorEmbalagem', { valueAsNumber: true })}
                    placeholder="Ex: 25, 6, 12, 1…"
                    className="rounded-none bg-[#131b15] border-white/15 text-xs font-mono text-on-surface h-9 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Preço e Quantidade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-precoEmbalagem"
                  className="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
                >
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
                  className={`rounded-none bg-[#131b15] border-white/15 text-sm font-mono text-on-surface h-10 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    form.formState.errors.precoEmbalagem ? 'border-rose-500/50' : ''
                  }`}
                />
                {form.formState.errors.precoEmbalagem && (
                  <p className="text-[11px] font-mono text-rose-400">
                    {form.formState.errors.precoEmbalagem.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-quantidade"
                  className="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
                >
                  Quantidade de embalagens
                </label>
                <Input
                  id="edit-quantidade"
                  type="number"
                  min={1}
                  autoComplete="off"
                  {...form.register('quantidade', { valueAsNumber: true })}
                  className={`rounded-none bg-[#131b15] border-white/15 text-sm font-mono text-on-surface h-10 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    form.formState.errors.quantidade ? 'border-rose-500/50' : ''
                  }`}
                />
                {form.formState.errors.quantidade && (
                  <p className="text-[11px] font-mono text-rose-400">
                    {form.formState.errors.quantidade.message}
                  </p>
                )}
              </div>
            </div>

            {/* Totalizadores do Item */}
            {(precoUnitarioPreview != null || totalLinhaPreview != null) && (
              <div className="flex items-center justify-between rounded-none bg-[#141e17] border border-white/10 p-3 px-4 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-on-surface-variant">Preço unitário ({unidadeAtiva}):</span>
                  <span className="font-bold text-on-surface">
                    {precoUnitarioPreview != null ? moeda(precoUnitarioPreview) : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-on-surface-variant">Subtotal:</span>
                  <span className="text-sm font-bold text-primary">
                    {totalLinhaPreview != null ? moeda(totalLinhaPreview) : '—'}
                  </span>
                </div>
              </div>
            )}

            {erro && (
              <div
                role="alert"
                className="rounded-none border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-mono text-rose-300"
              >
                ⚠ {erro}
              </div>
            )}

            {/* Rodapé de Ações */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmandoRemover(true)}
                disabled={editar.isPending}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-none transition-colors cursor-pointer"
              >
                <Trash className="size-3.5" weight="bold" />
                Remover item
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={editar.isPending}
                  className="rounded-none border border-white/15 bg-transparent hover:bg-white/10 text-on-surface text-xs font-bold uppercase tracking-wider px-4 py-2"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={editar.isPending}
                  className="rounded-none bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider text-xs px-5 py-2 shadow-[0_0_16px_rgba(78,222,163,0.3)] cursor-pointer flex items-center gap-2"
                >
                  {editar.isPending ? (
                    <>
                      <CircleNotch className="size-3.5 animate-spin" />
                      <span>Salvando…</span>
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
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
