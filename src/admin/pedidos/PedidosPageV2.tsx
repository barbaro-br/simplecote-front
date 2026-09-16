import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfigurarPedidoModal } from '@/admin/pedidos-avulsos/ConfigurarPedidoModal'
import {
  ArrowClockwise,
  ArrowSquareOut,
  Buildings,
  Calendar,
  CaretDown,
  CaretRight,
  CaretUp,
  CurrencyDollar,
  Eye,
  FilePdf,
  FileText,
  FileXls,
  Gear,
  MagnifyingGlass,
  Package,
  PaperPlaneTilt,
  Plus,
  Receipt,
  Scales,
  ShoppingCart,
  Storefront,
  Trash,
} from '@phosphor-icons/react'
import { usePedidosAgregados, useReenviarPedido } from './pedidos.api'
import { usePedidos, baixarPedidoPdf, baixarResultadoXlsx } from '@/admin/cotacoes/cotacoes.api'
import { useExcluirPedidoAvulso, usePedidoAvulso } from '@/admin/pedidos-avulsos/pedidos-avulsos.api'
import { ROTULO_STATUS } from './pedidos.util'
import { dataHoraBr, moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Tooltip } from '@/shared/components/ui/tooltip'
import { Dialog } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import type { GrupoCotacaoPedidos, PedidoResumo } from './pedidos.schema'

// Planilha contábil escura e densa para exibição dos itens de um pedido
function PlanilhaItensPedido({
  itens,
}: {
  itens: Array<{
    id: string
    nomeSnapshot: string
    unidadeSnapshot: string
    quantidade: number
    precoUnitario: number
    subtotal: number
  }>
}) {
  if (!itens || itens.length === 0) {
    return (
      <div className="py-4 px-6 text-xs text-on-surface-variant/60 italic bg-black/20">
        Nenhum item registrado para este pedido.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-black/40 border-t border-white/5">
      <table className="w-full text-left text-xs border-separate border-spacing-0">
        <thead className="bg-[#141e17] text-on-surface text-[11px] font-bold uppercase tracking-wider select-none">
          <tr>
            <th className="py-2 px-6 font-bold border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <Package className="size-3.5 text-primary shrink-0" weight="bold" />
                <span>Item</span>
              </div>
            </th>
            <th className="py-2 px-4 font-bold border-b border-white/10 text-right w-28">
              <div className="flex items-center justify-end gap-1.5">
                <Scales className="size-3.5 text-primary shrink-0" weight="bold" />
                <span>Qtd.</span>
              </div>
            </th>
            <th className="py-2 px-4 font-bold border-b border-white/10 text-right w-32">
              <div className="flex items-center justify-end gap-1.5">
                <CurrencyDollar className="size-3.5 text-primary shrink-0" weight="bold" />
                <span>Preço Unit.</span>
              </div>
            </th>
            <th className="py-2 px-6 font-bold border-b border-white/10 text-right w-36">
              <div className="flex items-center justify-end gap-1.5">
                <CurrencyDollar className="size-3.5 text-primary shrink-0" weight="bold" />
                <span>Subtotal</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-mono">
          {itens.map((it) => (
            <tr key={it.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-2 px-6 font-sans">
                <div className="font-semibold text-on-surface">{it.nomeSnapshot}</div>
                <div className="text-[11px] text-on-surface-variant/70 font-mono">
                  {it.unidadeSnapshot}
                </div>
              </td>
              <td className="py-2 px-4 text-right text-on-surface tabular-nums">
                {it.quantidade}
              </td>
              <td className="py-2 px-4 text-right text-on-surface tabular-nums">
                {moeda(it.precoUnitario)}
              </td>
              <td className="py-2 px-6 text-right font-bold text-primary tabular-nums">
                {moeda(it.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Carrega sob demanda os itens de um pedido de cotação
function ItensPedidoCotacao({ cotacaoId, pedidoId }: { cotacaoId: string; pedidoId: string }) {
  const { data: pedidos, isLoading, error } = usePedidos(cotacaoId)

  if (isLoading) {
    return (
      <div className="py-3 px-6 text-xs text-on-surface-variant flex items-center gap-2 bg-black/20">
        <ArrowClockwise className="size-3.5 animate-spin text-primary" />
        Carregando itens do pedido…
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-3 px-6 text-xs text-rose-300 bg-rose-500/10">
        Erro ao carregar itens do pedido.
      </div>
    )
  }

  const pedido = pedidos?.find((p) => p.id === pedidoId)
  if (!pedido) {
    return (
      <div className="py-3 px-6 text-xs text-on-surface-variant italic bg-black/20">
        Pedido não encontrado na cotação.
      </div>
    )
  }

  return <PlanilhaItensPedido itens={pedido.itens} />
}

// Carrega sob demanda os itens de um pedido avulso e disponibiliza a barra de ações
function ItensPedidoAvulso({ pedido: pedidoResumo }: { pedido: PedidoResumo }) {
  const { data: pedido, isLoading, error } = usePedidoAvulso(pedidoResumo.id)
  const reenviar = useReenviarPedido()
  const navigate = useNavigate()

  function aoBaixarPdf(e: React.MouseEvent) {
    e.stopPropagation()
    toast.info('Baixando PDF do pedido…')
    baixarPedidoPdf(pedidoResumo.id).catch((err) => {
      if (err instanceof SessaoExpiradaError) return
      toast.error(err instanceof ApiError ? err.message : 'Falha ao baixar PDF do pedido.')
    })
  }

  async function aoReenviar(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await reenviar.mutateAsync(pedidoResumo.id)
      toast.success(`Pedido reenviado para ${pedidoResumo.empresaNome ?? 'o fornecedor'} com sucesso!`)
    } catch (err) {
      if (err instanceof SessaoExpiradaError) return
      toast.error(err instanceof ApiError ? err.message : 'Falha ao reenviar o pedido.')
    }
  }

  if (isLoading) {
    return (
      <div className="py-3 px-6 text-xs text-on-surface-variant flex items-center gap-2 bg-black/20">
        <ArrowClockwise className="size-3.5 animate-spin text-primary" />
        Carregando itens do pedido avulso…
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-3 px-6 text-xs text-rose-300 bg-rose-500/10">
        Erro ao carregar itens do pedido avulso.
      </div>
    )
  }

  return (
    <div className="bg-black/30 border-t border-white/5">
      {/* Barra de Ações Rápidas no Acordeão Aberto */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-black/40 border-b border-white/5 font-mono text-xs">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <span>Fornecedor: <strong className="text-on-surface">{pedidoResumo.empresaNome ?? '—'}</strong></span>
          {pedido?.representanteNome && (
            <span>Representante: <strong className="text-on-surface">{pedido.representanteNome}</strong></span>
          )}
          <span>Total: <strong className="text-primary font-bold">{moeda(pedidoResumo.total)}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {pedidoResumo.status === 'FECHADO' && (
            <>
              <button
                type="button"
                onClick={aoBaixarPdf}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-on-surface bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer"
              >
                <FilePdf className="size-3.5 text-rose-400" weight="bold" />
                Baixar PDF
              </button>

              <button
                type="button"
                onClick={aoReenviar}
                disabled={reenviar.isPending}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-on-surface bg-white/5 hover:bg-primary/10 hover:text-primary border border-white/10 hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                <PaperPlaneTilt className="size-3.5 text-primary" weight="bold" />
                {reenviar.isPending ? 'Enviando…' : 'Reenviar pedido'}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => navigate(`/admin/pedidos-avulsos/${pedidoResumo.id}`)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-on-surface bg-white/5 hover:bg-primary/10 hover:text-primary border border-white/10 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <ArrowSquareOut className="size-3.5" weight="bold" />
            {pedidoResumo.status === 'FECHADO' ? 'Ver pedido completo' : 'Continuar montagem'}
          </button>
        </div>
      </div>

      <PlanilhaItensPedido itens={pedido?.itens ?? []} />
    </div>
  )
}

// Faixa Nível 2 - Empresa vencedora dentro da cotação (Accordion Nível 2)
function AccordionEmpresaCotacao({
  pedido,
  cotacaoId,
}: {
  pedido: PedidoResumo
  cotacaoId: string
}) {
  const [aberto, setAberto] = useState(false)
  const reenviar = useReenviarPedido()

  async function aoReenviar(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await reenviar.mutateAsync(pedido.id)
      toast.success(`Pedido reenviado para ${pedido.empresaNome ?? 'o fornecedor'} com sucesso!`)
    } catch (err) {
      if (err instanceof SessaoExpiradaError) return
      toast.error(err instanceof ApiError ? err.message : 'Falha ao reenviar o pedido.')
    }
  }

  function aoBaixarPdf(e: React.MouseEvent) {
    e.stopPropagation()
    toast.info('Baixando PDF do pedido…')
    baixarPedidoPdf(pedido.id).catch((err) => {
      if (err instanceof SessaoExpiradaError) return
      toast.error(err instanceof ApiError ? err.message : 'Falha ao baixar PDF do pedido.')
    })
  }

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setAberto(!aberto)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setAberto(!aberto)
          }
        }}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-black/25 hover:bg-white/[0.03] transition-colors cursor-pointer select-none text-left"
      >
        {/* Esquerda: Identificação da Empresa Vencedora */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-on-surface-variant/70">
            {aberto ? <CaretDown className="size-4" /> : <CaretRight className="size-4" />}
          </div>
          <div className="size-7 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Buildings className="size-3.5" weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-on-surface hover:text-primary transition-colors">
                {pedido.empresaNome ?? 'Fornecedor'}
              </span>
              <span className="px-2 py-0.5 rounded-none text-[10px] font-mono uppercase tracking-wider font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {ROTULO_STATUS[pedido.status] ?? pedido.status}
              </span>
            </div>
            <div className="text-[11px] text-on-surface-variant flex items-center gap-2 mt-0.5">
              <span>{pedido.quantidadeItens} {pedido.quantidadeItens === 1 ? 'item ganho' : 'itens ganhos'}</span>
              {pedido.condicaoPagamento && (
                <>
                  <span>•</span>
                  <span>Pgto: {pedido.condicaoPagamento}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Direita: Total Ganho e Botões de Ação do Pedido */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-on-surface-variant/70">
              Total Ganho
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-primary">
              {moeda(pedido.total)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <Tooltip content="Baixar PDF do pedido">
              <button
                type="button"
                onClick={aoBaixarPdf}
                aria-label="Baixar PDF"
                className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
              >
                <FilePdf className="size-4" weight="bold" />
              </button>
            </Tooltip>

            <Tooltip content="Reenviar e-mail do pedido">
              <button
                type="button"
                onClick={aoReenviar}
                disabled={reenviar.isPending}
                aria-label="Reenviar e-mail"
                className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <PaperPlaneTilt className="size-4" weight="bold" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Nível 3: Planilha de Itens do Pedido */}
      {aberto && <ItensPedidoCotacao cotacaoId={cotacaoId} pedidoId={pedido.id} />}
    </div>
  )
}

// Faixa Nível 1 - Cotação (Accordion Nível 1)
function AccordionCotacao({ grupo }: { grupo: GrupoCotacaoPedidos }) {
  const [aberto, setAberto] = useState(false)
  const totalCotacao = grupo.pedidos.reduce((acc, p) => acc + p.total, 0)
  const totalItens = grupo.pedidos.reduce((acc, p) => acc + p.quantidadeItens, 0)
  const dataRecente = grupo.pedidos[0]?.geradoEm

  function aoBaixarPlanilha(e: React.MouseEvent) {
    e.stopPropagation()
    toast.info('Baixando planilha Excel do resultado da cotação…')
    baixarResultadoXlsx(grupo.cotacaoId).catch((err) => {
      if (err instanceof SessaoExpiradaError) return
      toast.error(err instanceof ApiError ? err.message : 'Falha ao baixar a planilha da cotação.')
    })
  }

  return (
    <div className="rounded-none border border-white/10 bg-[#111813]/60 overflow-hidden shadow-sm">
      {/* Faixa Nível 1: Dados da Cotação */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setAberto(!aberto)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setAberto(!aberto)
          }
        }}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-[#17221b] hover:bg-[#1c2921] transition-colors cursor-pointer select-none text-left border-b border-white/10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-primary shrink-0">
            {aberto ? <CaretUp className="size-5" weight="bold" /> : <CaretDown className="size-5" weight="bold" />}
          </div>
          <div className="size-9 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText className="size-5" weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-on-surface truncate">
                {grupo.tituloCotacao}
              </h3>
              <span className="px-2 py-0.5 rounded-none text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                {grupo.pedidos.length} {grupo.pedidos.length === 1 ? 'empresa' : 'empresas'}
              </span>
            </div>
            <div className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
              <span>{totalItens} {totalItens === 1 ? 'item comprado' : 'itens comprados'}</span>
              {dataRecente && (
                <>
                  <span>•</span>
                  <span>{dataHoraBr(dataRecente)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-on-surface-variant/70">
              Total Comprado
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-primary">
              {moeda(totalCotacao)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-white/10">
            <Tooltip content="Baixar planilha Excel do resultado">
              <button
                type="button"
                onClick={aoBaixarPlanilha}
                aria-label="Baixar planilha Excel"
                className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
              >
                <FileXls className="size-4" weight="bold" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Accordion Nível 2: Lista de Empresas Vencedoras */}
      {aberto && (
        <div className="divide-y divide-white/5">
          {grupo.pedidos.map((pedido) => (
            <AccordionEmpresaCotacao
              key={pedido.id}
              pedido={pedido}
              cotacaoId={grupo.cotacaoId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Linha de Pedido Avulso na Planilha Contábil de Avulsos
function LinhaPedidoAvulso({ pedido }: { pedido: PedidoResumo }) {
  const [expandido, setExpandido] = useState(false)
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false)
  const navigate = useNavigate()
  const reenviar = useReenviarPedido()
  const excluirMutation = useExcluirPedidoAvulso()

  function aoBaixarPdf(e: React.MouseEvent) {
    e.stopPropagation()
    toast.info('Baixando PDF do pedido…')
    baixarPedidoPdf(pedido.id).catch((err) => {
      if (err instanceof SessaoExpiradaError) return
      toast.error(err instanceof ApiError ? err.message : 'Falha ao baixar PDF do pedido.')
    })
  }

  async function aoReenviar(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await reenviar.mutateAsync(pedido.id)
      toast.success(`Pedido reenviado para ${pedido.empresaNome ?? 'o fornecedor'} com sucesso!`)
    } catch (err) {
      if (err instanceof SessaoExpiradaError) return
      toast.error(err instanceof ApiError ? err.message : 'Falha ao reenviar o pedido.')
    }
  }

  async function aoConfirmarExclusao() {
    try {
      await excluirMutation.mutateAsync(pedido.id)
      toast.success('Pedido avulso excluído com sucesso!')
      setConfirmandoExcluir(false)
    } catch (err) {
      if (err instanceof SessaoExpiradaError) return
      toast.error(err instanceof ApiError ? err.message : 'Falha ao excluir o pedido.')
    }
  }

  return (
    <>
      <tr
        onClick={() => setExpandido(!expandido)}
        className="transition-colors hover:bg-white/[0.03] cursor-pointer group"
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant/60 group-hover:text-primary transition-colors">
              {expandido ? <CaretDown className="size-4" /> : <CaretRight className="size-4" />}
            </span>
            <div className="size-7 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Storefront className="size-3.5" weight="bold" />
            </div>
            <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
              {pedido.empresaNome ?? 'Fornecedor'}
            </span>
          </div>
        </td>

        <td className="py-3 px-4 text-xs text-on-surface-variant font-mono">
          {pedido.condicaoPagamento || '—'}
        </td>

        <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-on-surface">
          {pedido.quantidadeItens}
        </td>

        <td className="py-3 px-4 text-xs text-on-surface-variant font-mono">
          {dataHoraBr(pedido.geradoEm)}
        </td>

        <td className="py-3 px-4 text-right font-mono font-bold text-primary text-sm tabular-nums">
          {moeda(pedido.total)}
        </td>

        <td className="py-3 px-4 text-center">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-none text-xs font-semibold ${
              pedido.status === 'FECHADO'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            {ROTULO_STATUS[pedido.status] ?? pedido.status}
          </span>
        </td>

        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center gap-1.5">
            {pedido.status === 'FECHADO' ? (
              <>
                <Tooltip content="Baixar PDF do pedido">
                  <button
                    type="button"
                    onClick={aoBaixarPdf}
                    aria-label="Baixar PDF"
                    className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                  >
                    <FilePdf className="size-4" weight="bold" />
                  </button>
                </Tooltip>

                <Tooltip content="Reenviar pedido por e-mail">
                  <button
                    type="button"
                    onClick={aoReenviar}
                    disabled={reenviar.isPending}
                    aria-label="Reenviar e-mail"
                    className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <PaperPlaneTilt className="size-4" weight="bold" />
                  </button>
                </Tooltip>

                <Tooltip content="Visualizar pedido completo">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/pedidos-avulsos/${pedido.id}`)}
                    aria-label="Abrir pedido avulso"
                    className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                  >
                    <ArrowSquareOut className="size-4" weight="bold" />
                  </button>
                </Tooltip>

                <Tooltip content="Excluir pedido avulso">
                  <button
                    type="button"
                    onClick={() => setConfirmandoExcluir(true)}
                    aria-label="Excluir pedido avulso"
                    className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                  >
                    <Trash className="size-4" weight="bold" />
                  </button>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip content="Continuar montando pedido">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/pedidos-avulsos/${pedido.id}`)}
                    aria-label="Abrir pedido avulso"
                    className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-primary hover:bg-white/10 hover:border-primary/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                  >
                    <ArrowSquareOut className="size-4" weight="bold" />
                  </button>
                </Tooltip>

                <Tooltip content="Excluir pedido em aberto">
                  <button
                    type="button"
                    onClick={() => setConfirmandoExcluir(true)}
                    aria-label="Excluir pedido avulso"
                    className="size-8 rounded-none bg-white/5 border border-white/10 text-on-surface hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors inline-flex items-center justify-center cursor-pointer"
                  >
                    <Trash className="size-4" weight="bold" />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </td>
      </tr>

      {expandido && (
        <tr>
          <td colSpan={7} className="p-0 border-b border-white/10">
            <ItensPedidoAvulso pedido={pedido} />
          </td>
        </tr>
      )}

      {confirmandoExcluir && (
        <Dialog
          open
          onClose={() => setConfirmandoExcluir(false)}
          size="md"
          ariaLabel="Excluir pedido avulso"
          className="p-0 rounded-none border border-rose-500/30 bg-[#0d1410] shadow-2xl max-w-md text-on-surface overflow-hidden"
        >
          <div className="flex flex-col bg-[#0d1410]">
            <div className="flex items-center gap-3 border-b border-rose-500/20 px-5 py-4 bg-rose-500/10">
              <div className="flex size-8 items-center justify-center bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-none">
                <Trash className="size-4" weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Excluir pedido avulso
                </span>
                <div className="text-[11px] font-mono text-on-surface-variant">
                  {pedido.empresaNome ?? 'Fornecedor'} · {pedido.quantidadeItens} {pedido.quantidadeItens === 1 ? 'item' : 'itens'}
                </div>
              </div>
            </div>
            <div className="p-5 text-xs font-mono text-on-surface-variant space-y-2">
              <p>
                Tem certeza que deseja excluir este pedido avulso {pedido.status === 'ABERTO' ? 'em aberto' : ''}? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 bg-[#141e17] p-3 px-5">
              <Button
                variant="outline"
                onClick={() => setConfirmandoExcluir(false)}
                disabled={excluirMutation.isPending}
                className="rounded-none border border-white/15 bg-white/5 text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={aoConfirmarExclusao}
                disabled={excluirMutation.isPending}
                className="rounded-none bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer"
              >
                {excluirMutation.isPending ? 'Excluindo…' : 'Sim, excluir pedido'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}

export function PedidosPageV2() {
  const [params, setParams] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [modalCriarAberto, setModalCriarAberto] = useState(false)

  const tipoParam = params.get('tipo') ?? 'TODOS'
  const filtroTipo = ['TODOS', 'COTACAO', 'AVULSO'].includes(tipoParam) ? tipoParam : 'TODOS'

  function setFiltroTipo(tipo: string) {
    setParams((p) => {
      if (tipo && tipo !== 'TODOS') p.set('tipo', tipo)
      else p.delete('tipo')
      return p
    })
  }

  const { data, isLoading, error, refetch, isFetching } = usePedidosAgregados()

  const gruposCotacao = useMemo(() => data?.grupos ?? [], [data])
  const avulsos = useMemo(() => data?.avulsos ?? [], [data])

  // Métricas rápidas
  const metricas = useMemo(() => {
    const totalCotacoes = gruposCotacao.reduce((acc, g) => acc + g.pedidos.length, 0)
    const totalAvulsos = avulsos.length
    const totalGeral = totalCotacoes + totalAvulsos

    const valorCotacoes = gruposCotacao.reduce(
      (acc, g) => acc + g.pedidos.reduce((s, p) => s + p.total, 0),
      0,
    )
    const valorAvulsos = avulsos.reduce((acc, p) => acc + p.total, 0)
    const valorGeral = valorCotacoes + valorAvulsos

    return { totalGeral, totalCotacoes, totalAvulsos, valorGeral }
  }, [gruposCotacao, avulsos])

  // Filtragem de cotações por busca
  const gruposFiltrados = useMemo(() => {
    if (filtroTipo === 'AVULSO') return []
    if (!busca.trim()) return gruposCotacao
    const termo = busca.trim().toLowerCase()
    return gruposCotacao.filter(
      (g) =>
        g.tituloCotacao.toLowerCase().includes(termo) ||
        g.pedidos.some((p) => p.empresaNome?.toLowerCase().includes(termo)),
    )
  }, [gruposCotacao, filtroTipo, busca])

  // Filtragem de avulsos por busca
  const avulsosFiltrados = useMemo(() => {
    if (filtroTipo === 'COTACAO') return []
    if (!busca.trim()) return avulsos
    const termo = busca.trim().toLowerCase()
    return avulsos.filter(
      (p) =>
        p.empresaNome?.toLowerCase().includes(termo) ||
        p.condicaoPagamento?.toLowerCase().includes(termo),
    )
  }, [avulsos, filtroTipo, busca])

  return (
    <div className="flex flex-col min-h-0 flex-1 max-w-7xl mx-auto w-full h-full min-w-0 overflow-hidden pr-1 pb-1 space-y-3 text-on-surface">
      {/* ============================================================ */}
      {/* 1. Header do Painel de Pedidos                               */}
      {/* ============================================================ */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Receipt className="size-5" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
                Pedidos
              </h1>
              <span className="px-2 py-0.5 rounded-none text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Gestão de Compras
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Pedidos apurados em cotações competitivas e pedidos avulsos diretos com fornecedores.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-none bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface text-xs font-semibold transition-all cursor-pointer"
            title="Atualizar lista de pedidos"
          >
            <ArrowClockwise className={`size-4 ${isFetching ? 'animate-spin' : ''}`} weight="bold" />
            Atualizar
          </button>

          <button
            type="button"
            onClick={() => setModalCriarAberto(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-none bg-primary hover:bg-primary/90 text-black font-semibold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(78,222,163,0.25)]"
          >
            <Plus className="size-4" weight="bold" />
            Novo pedido avulso
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Barra de Métricas Superiores (Kpis Compactos Brutalistas) */}
      {/* ============================================================ */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-[#121a14] border border-white/10 rounded-none p-2.5 shadow-sm">
        <div className="flex items-center gap-2.5 px-2">
          <div className="size-8 rounded-none bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShoppingCart className="size-4" weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">
              Total de Pedidos
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-on-surface truncate">
              {metricas.totalGeral}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-l border-white/5">
          <div className="size-8 rounded-none bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="size-4" weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">
              Pedidos de Cotação
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 truncate">
              {metricas.totalCotacoes}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-l border-white/5">
          <div className="size-8 rounded-none bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
            <Storefront className="size-4" weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">
              Pedidos Avulsos
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-cyan-400 truncate">
              {metricas.totalAvulsos}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-l border-white/5">
          <div className="size-8 rounded-none bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            <CurrencyDollar className="size-4" weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">
              Total Comprado
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-amber-400 truncate">
              {moeda(metricas.valorGeral)}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Filtros e Campo de Busca (Cantos Quadrados)               */}
      {/* ============================================================ */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 p-1 rounded-none bg-white/[0.03] border border-white/10 select-none overflow-x-auto max-w-full">
          {[
            { valor: 'TODOS', rotulo: 'Todos os pedidos' },
            { valor: 'COTACAO', rotulo: 'Pedidos da cotação' },
            { valor: 'AVULSO', rotulo: 'Fora de cotação (Avulsos)' },
          ].map((f) => {
            const ativo = filtroTipo === f.valor
            return (
              <button
                key={f.valor}
                type="button"
                onClick={() => setFiltroTipo(f.valor)}
                className={`px-3 py-1 rounded-none text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  ativo
                    ? 'bg-primary text-black font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                {f.rotulo}
              </button>
            )
          })}
        </div>

        <div className="relative w-full sm:w-80 shrink-0">
          <MagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant/50"
            aria-hidden
          />
          <input
            type="search"
            aria-label="Buscar pedidos"
            placeholder="Buscar por cotação ou empresa…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-8 pl-9 pr-3 rounded-none border border-white/15 bg-black/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors font-medium"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. Área Principal com as Duas Seções de Pedidos              */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-0.5">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-[#111813]/60 border border-white/10 rounded-none">
            <ArrowClockwise className="size-6 animate-spin text-primary" />
            <p className="text-xs text-on-surface-variant">Carregando pedidos…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3 bg-rose-500/10 border border-rose-500/30 rounded-none">
            <p className="text-sm font-semibold text-rose-300">
              Falha ao carregar os pedidos: {error.message}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-3 py-1.5 text-xs font-semibold rounded-none bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-500/40"
            >
              Tentar novamente
            </button>
          </div>
        ) : metricas.totalGeral === 0 ? (
          <div className="p-12 text-center space-y-3 bg-[#111813]/60 border border-white/10 rounded-none">
            <Receipt className="size-10 text-on-surface-variant/40 mx-auto" />
            <p className="text-sm font-bold text-on-surface">Nenhum pedido ainda</p>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Apure uma cotação para gerar pedidos automaticamente ou monte um pedido avulso direto.
            </p>
            <button
              type="button"
              onClick={() => setModalCriarAberto(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-none bg-primary hover:bg-primary/90 text-black font-semibold text-xs transition-all cursor-pointer mt-2"
            >
              <Plus className="size-4" weight="bold" />
              Criar primeiro pedido avulso
            </button>
          </div>
        ) : (
          <>
            {/* SEÇÃO 1: PEDIDOS DA COTAÇÃO (MENU SANFONA / ACCORDION HIERÁRQUICO) */}
            {filtroTipo !== 'AVULSO' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-on-surface">
                      Pedidos da Cotação
                    </h2>
                    <span className="px-1.5 py-0.5 rounded-none text-[10px] font-mono bg-white/10 text-on-surface border border-white/15">
                      {gruposFiltrados.length} {gruposFiltrados.length === 1 ? 'cotação' : 'cotações'}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Clique na cotação para ver as empresas e seus pedidos
                  </span>
                </div>

                {gruposFiltrados.length === 0 ? (
                  <div className="p-6 text-center text-xs text-on-surface-variant bg-[#111813]/40 border border-white/10 rounded-none">
                    Nenhum pedido de cotação encontrado para os filtros atuais.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gruposFiltrados.map((grupo) => (
                      <AccordionCotacao key={grupo.cotacaoId} grupo={grupo} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 2: PEDIDOS FORA DE COTAÇÃO (AVULSOS) */}
            {filtroTipo !== 'COTACAO' && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-on-surface">
                      Pedidos Fora de Cotação (Avulsos)
                    </h2>
                    <span className="px-1.5 py-0.5 rounded-none text-[10px] font-mono bg-white/10 text-on-surface border border-white/15">
                      {avulsosFiltrados.length} {avulsosFiltrados.length === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalCriarAberto(true)}
                    className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3.5" weight="bold" />
                    Novo pedido avulso
                  </button>
                </div>

                {avulsosFiltrados.length === 0 ? (
                  <div className="p-6 text-center text-xs text-on-surface-variant bg-[#111813]/40 border border-white/10 rounded-none">
                    Nenhum pedido avulso encontrado para os filtros atuais.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-none border border-white/10 bg-[#111813]/60 shadow-inner">
                    <table className="w-full text-left text-xs border-separate border-spacing-0">
                      <thead className="sticky top-0 z-10 bg-[#17221b] text-on-surface text-xs font-bold uppercase tracking-wider select-none shadow-sm">
                        <tr>
                          <th className="py-3 px-4 font-bold border-b border-white/10">
                            <div className="flex items-center gap-1.5">
                              <Buildings className="size-4 text-primary shrink-0" weight="bold" />
                              <span>Empresa</span>
                            </div>
                          </th>
                          <th className="py-3 px-4 font-bold border-b border-white/10">
                            <div className="flex items-center gap-1.5">
                              <Receipt className="size-4 text-primary shrink-0" weight="bold" />
                              <span>Condição Pgto.</span>
                            </div>
                          </th>
                          <th className="py-3 px-4 font-bold border-b border-white/10 text-right w-24">
                            <div className="flex items-center justify-end gap-1.5">
                              <Scales className="size-4 text-primary shrink-0" weight="bold" />
                              <span>Itens</span>
                            </div>
                          </th>
                          <th className="py-3 px-4 font-bold border-b border-white/10 w-44">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-4 text-primary shrink-0" weight="bold" />
                              <span>Data</span>
                            </div>
                          </th>
                          <th className="py-3 px-4 font-bold border-b border-white/10 text-right w-36">
                            <div className="flex items-center justify-end gap-1.5">
                              <CurrencyDollar className="size-4 text-primary shrink-0" weight="bold" />
                              <span>Total</span>
                            </div>
                          </th>
                          <th className="py-3 px-4 font-bold border-b border-white/10 text-center w-28">
                            <div className="flex items-center justify-center gap-1.5">
                              <Eye className="size-4 text-primary shrink-0" weight="bold" />
                              <span>Status</span>
                            </div>
                          </th>
                          <th className="py-3 px-4 font-bold border-b border-white/10 text-center w-[100px]">
                            <div className="flex items-center justify-center gap-1.5">
                              <Gear className="size-4 text-primary shrink-0" weight="bold" />
                              <span>Ações</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {avulsosFiltrados.map((pedido) => (
                          <LinhaPedidoAvulso key={pedido.id} pedido={pedido} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <ConfigurarPedidoModal open={modalCriarAberto} onClose={() => setModalCriarAberto(false)} />
    </div>
  )
}
