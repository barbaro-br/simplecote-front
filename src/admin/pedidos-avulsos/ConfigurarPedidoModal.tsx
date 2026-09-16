import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Buildings, CalendarBlank, CreditCard, ShoppingCart, User, X } from '@phosphor-icons/react'
import { Dialog } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Combobox } from '@/shared/components/ui/combobox'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useEmpresas } from '@/admin/empresas/empresas.api'
import { useRepresentantes } from '@/admin/representantes/representantes.api'
import {
  useCondicoesPagamento,
  useCriarCondicaoPagamento,
} from '@/admin/condicoes-pagamento/condicoes-pagamento.api'
import { useCriarPedidoAvulso } from './pedidos-avulsos.api'

const configurarPedidoSchema = z.object({
  empresaId: z.string().min(1, 'Selecione a empresa'),
  condicaoPagamentoId: z.string().optional(),
  prazoEntregaEstimado: z.string().optional(),
})

type FormValues = z.infer<typeof configurarPedidoSchema>

type Props = {
  open: boolean
  onClose: () => void
}

export function ConfigurarPedidoModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const criar = useCriarPedidoAvulso()

  const { data: empresas } = useEmpresas()
  const { data: representantes } = useRepresentantes()
  const { data: condicoesPagamento } = useCondicoesPagamento()
  const criarCondicao = useCriarCondicaoPagamento()

  const [condicaoPagamentoId, setCondicaoPagamentoId] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(configurarPedidoSchema),
    defaultValues: {
      empresaId: '',
      condicaoPagamentoId: '',
      prazoEntregaEstimado: '',
    },
  })

  const empresaIdWatch = form.watch('empresaId')
  const representante = empresaIdWatch
    ? representantes?.find((r) => r.empresaId === empresaIdWatch)
    : null

  function aoCriarCondicao(descricao: string) {
    criarCondicao.mutate(
      { descricao },
      {
        onSuccess: (criada) => {
          setCondicaoPagamentoId(criada.id)
          form.setValue('condicaoPagamentoId', criada.id)
        },
        onError: (e) => {
          if (e instanceof SessaoExpiradaError) return
          setErro(e instanceof ApiError ? e.message : 'Não foi possível cadastrar a condição')
        },
      },
    )
  }

  async function aoSubmeter(valores: FormValues) {
    setErro(null)
    try {
      const pedidoCriado = await criar.mutateAsync({
        empresaId: valores.empresaId,
        ...(condicaoPagamentoId ? { condicaoPagamentoId } : {}),
        ...(valores.prazoEntregaEstimado?.trim()
          ? { prazoEntregaEstimado: valores.prazoEntregaEstimado.trim() }
          : {}),
      })
      onClose()
      navigate(`/admin/pedidos-avulsos/${pedidoCriado.id}`)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Não foi possível criar o pedido. Tente novamente.')
    }
  }

  function aoFechar() {
    if (criar.isPending) return
    form.reset()
    setCondicaoPagamentoId('')
    setErro(null)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={aoFechar}
      size="md"
      ariaLabel="Configurar novo pedido avulso"
      className="p-0 rounded-none border border-white/15 bg-[#0d1410] shadow-2xl max-w-lg text-on-surface"
    >
      <div className="flex flex-col">
        {/* Cabeçalho Contábil */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 bg-[#141e17]">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center bg-primary/15 border border-primary/30 text-primary rounded-none shadow-[0_0_12px_rgba(78,222,163,0.2)]">
              <ShoppingCart className="size-4" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Configurar Pedido Avulso
                </span>
                <span className="px-1.5 py-0.2 rounded-none text-[9px] font-mono bg-primary/10 text-primary border border-primary/20">
                  ETAPA 1/2
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant/80 mt-0.5">
                Defina os parâmetros comerciais antes de abrir a planilha de itens
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            disabled={criar.isPending}
            className="flex size-7 items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 rounded-none transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="size-4" weight="bold" />
          </button>
        </div>

        {/* Formulário Estilo Planilha */}
        <form onSubmit={form.handleSubmit(aoSubmeter)} noValidate className="p-5 space-y-4 font-sans bg-[#0d1410]">
          {/* Campo Empresa */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cfg-empresa"
                className="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"
              >
                <Buildings className="size-3.5 text-primary" weight="bold" />
                <span>Empresa / Fornecedor</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] font-mono text-on-surface-variant/60 uppercase">Obrigatório</span>
            </div>

            <Combobox
              id="cfg-empresa"
              options={(empresas ?? []).map((e) => ({ value: e.id, label: e.nome }))}
              value={empresaIdWatch}
              onChange={(v) => form.setValue('empresaId', v, { shouldValidate: true })}
              placeholder="Selecione ou busque o fornecedor…"
              emptyMessage="Nenhuma empresa cadastrada encontrada"
              className="rounded-none bg-[#131b15] border-white/15 text-xs text-on-surface h-10 hover:border-primary/40 focus:border-primary"
              popupClassName="rounded-none bg-[#141e17] border-white/20 text-xs shadow-2xl text-on-surface"
            />
            {form.formState.errors.empresaId && (
              <p className="text-[11px] font-mono text-rose-400 flex items-center gap-1 mt-1">
                <span>⚠</span> {form.formState.errors.empresaId.message}
              </p>
            )}

            {/* Painel do Representante Vinculado */}
            {representante && (
              <div className="mt-2 p-2.5 px-3 bg-[#141e17] border border-white/10 rounded-none flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <User className="size-3.5 text-primary" weight="bold" />
                  <span className="text-on-surface-variant">Representante:</span>
                  <span className="font-bold text-primary">{representante.nome}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-none text-on-surface-variant">
                  CONTATO PRINCIPAL
                </span>
              </div>
            )}
          </div>

          {/* Campo Condição de Pagamento */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cfg-condicao"
                className="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"
              >
                <CreditCard className="size-3.5 text-primary" weight="bold" />
                <span>Condição de pagamento</span>
              </label>
              <span className="text-[10px] font-mono text-on-surface-variant/60 uppercase">Opcional</span>
            </div>

            <Combobox
              id="cfg-condicao"
              options={(condicoesPagamento ?? []).map((c) => ({ value: c.id, label: c.descricao }))}
              value={condicaoPagamentoId}
              onChange={(v) => {
                setCondicaoPagamentoId(v)
                form.setValue('condicaoPagamentoId', v)
              }}
              onCriarNova={aoCriarCondicao}
              placeholder="Selecione ou digite para criar nova (ex: 28 dias)…"
              emptyMessage="Nenhuma condição cadastrada"
              rotuloCriar={(texto) => `+ Cadastrar "${texto}" na loja`}
              className="rounded-none bg-[#131b15] border-white/15 text-xs text-on-surface h-10 hover:border-primary/40 focus:border-primary"
              popupClassName="rounded-none bg-[#141e17] border-white/20 text-xs shadow-2xl text-on-surface"
            />
          </div>

          {/* Campo Prazo de Entrega Estimado */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cfg-prazo"
                className="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5"
              >
                <CalendarBlank className="size-3.5 text-primary" weight="bold" />
                <span>Prazo de entrega estimado</span>
              </label>
              <span className="text-[10px] font-mono text-on-surface-variant/60 uppercase">Opcional</span>
            </div>

            <Input
              id="cfg-prazo"
              autoComplete="off"
              {...form.register('prazoEntregaEstimado')}
              placeholder="Ex: 3 dias úteis, Imediato, Próxima segunda…"
              className="rounded-none bg-[#131b15] border-white/15 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 h-10 hover:border-primary/40 focus:border-primary"
            />
          </div>

          {erro && (
            <div
              role="alert"
              className="rounded-none border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-mono text-rose-300"
            >
              ⚠ {erro}
            </div>
          )}

          {/* Rodapé de Ações */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={aoFechar}
              disabled={criar.isPending}
              className="rounded-none border border-white/15 bg-transparent hover:bg-white/10 text-on-surface text-xs font-bold uppercase tracking-wider px-4 py-2.5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={criar.isPending}
              className="rounded-none bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 shadow-[0_0_16px_rgba(78,222,163,0.3)] cursor-pointer"
            >
              {criar.isPending ? 'Abrindo pedido…' : 'Abrir pedido'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
