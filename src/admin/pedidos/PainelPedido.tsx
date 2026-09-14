import { useState } from 'react'
import { ArrowLeft, CaretRight, FilePdf, FileXls, PaperPlaneTilt, X } from '@phosphor-icons/react'
import { Dialog } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { ErrorAlert } from '@/shared/components/ui/error-alert'
import { Lista, LinhaLista, Selo } from '@/shared/ui'
import { moeda } from '@/shared/format/formatters'
import { cn } from '@/shared/lib/utils'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { usePedidos, baixarPedidoPdf, baixarResultadoXlsx } from '@/admin/cotacoes/cotacoes.api'
import type { Pedido } from '@/admin/cotacoes/cotacoes.schema'
import { usePedidoAvulso } from '@/admin/pedidos-avulsos/pedidos-avulsos.api'
import type { PedidoAvulso } from '@/admin/pedidos-avulsos/pedidos-avulsos.schema'
import { useReenviarPedido } from './pedidos.api'
import { ROTULO_STATUS, TOM_STATUS } from './pedidos.util'
import type { PedidoResumo } from './pedidos.schema'

export type ContextoPainel =
  | { tipo: 'cotacao'; cotacaoId: string; titulo: string }
  | { tipo: 'avulso-mes'; rotulo: string; pedidos: PedidoResumo[] }

type Direcao = 'frente' | 'voltar' | null

const ANIMACAO_NIVEL = 'min-h-0 flex-1 overflow-y-auto animate-in fade-in duration-150'
const CABECALHO = 'flex shrink-0 items-start gap-3 border-b border-border p-4 px-6'
const RODAPE = 'flex shrink-0 items-center justify-between border-t border-border px-6 py-3 text-sm text-muted-foreground'

function CarregandoLinhas() {
  return <p className="p-6 text-sm text-muted-foreground">Carregando…</p>
}

function TabelaItens({ itens }: { itens: { id: string; nomeSnapshot: string; unidadeSnapshot: string; quantidade: number; precoUnitario: number; subtotal: number }[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] text-left text-[11px] uppercase tracking-wide text-muted-foreground">
          <th className="px-4 py-2 font-medium">Item</th>
          <th className="px-4 py-2 text-right font-medium">Qtd.</th>
          <th className="px-4 py-2 text-right font-medium">Unitário</th>
          <th className="px-4 py-2 text-right font-medium">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
        {itens.map((it) => (
          <tr key={it.id}>
            <td className="px-4 py-2.5">
              <div className="font-medium text-foreground">{it.nomeSnapshot}</div>
              <div className="text-xs text-muted-foreground">{it.unidadeSnapshot}</div>
            </td>
            <td className="px-4 py-2.5 text-right tabular-nums">{it.quantidade}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{moeda(it.precoUnitario)}</td>
            <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-foreground">{moeda(it.subtotal)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ConteudoCotacao({ contexto, onFechar }: { contexto: Extract<ContextoPainel, { tipo: 'cotacao' }>; onFechar: () => void }) {
  const { data: pedidos, isLoading, error } = usePedidos(contexto.cotacaoId)
  const [nivel, setNivel] = useState<'lista' | 'itens'>('lista')
  const [pedidoAtual, setPedidoAtual] = useState<Pedido | null>(null)
  const [direcao, setDirecao] = useState<Direcao>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const reenviar = useReenviarPedido()

  function abrir(p: Pedido) {
    setDirecao('frente')
    setPedidoAtual(p)
    setNivel('itens')
  }
  function voltar() {
    setDirecao('voltar')
    setNivel('lista')
    setPedidoAtual(null)
  }

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    setErroAcao(e instanceof ApiError ? e.message : 'Falha ao concluir a ação.')
  }

  async function aoReenviar(id: string) {
    setErroAcao(null)
    try {
      await reenviar.mutateAsync(id)
    } catch (e) {
      tratarErro(e)
    }
  }

  function aoBaixarPdf(id: string) {
    setErroAcao(null)
    baixarPedidoPdf(id).catch(tratarErro)
  }

  function aoBaixarPlanilha() {
    setErroAcao(null)
    baixarResultadoXlsx(contexto.cotacaoId).catch(tratarErro)
  }

  const lista = pedidos ?? []
  const totalCotacao = lista.reduce((s, p) => s + p.total, 0)
  const itensCotacao = lista.reduce((s, p) => s + p.itens.length, 0)

  return (
    <div className="flex h-[70vh] max-h-[640px] flex-col">
      <div className={CABECALHO}>
        {nivel === 'itens' && (
          <Button variant="ghost" size="icon" onClick={voltar} aria-label="Voltar" className="h-8 w-8 shrink-0 text-muted-foreground">
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          {nivel === 'itens' && pedidoAtual && (
            <div className="mb-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <span className="truncate">{contexto.titulo}</span>
              <CaretRight className="size-3 shrink-0" />
            </div>
          )}
          <div className="truncate text-[15px] font-semibold text-foreground">
            {nivel === 'itens' && pedidoAtual ? pedidoAtual.empresaNome : contexto.titulo}
          </div>
          <div className="mt-[1px] text-xs text-muted-foreground">
            {nivel === 'itens' && pedidoAtual
              ? `Status ${(ROTULO_STATUS[pedidoAtual.status] ?? pedidoAtual.status).toLowerCase()}`
              : `${lista.length} ${lista.length === 1 ? 'empresa participante' : 'empresas participantes'}`}
          </div>
        </div>
        {nivel === 'lista' && lista.length > 0 && (
          <Button variant="outline" size="sm" onClick={aoBaixarPlanilha} className="shrink-0">
            <FileXls className="mr-1.5 size-4" /> Planilha
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onFechar} aria-label="Fechar" className="h-8 w-8 shrink-0 text-muted-foreground">
          <X className="size-4" />
        </Button>
      </div>

      {erroAcao && (
        <div className="shrink-0 p-4 pb-0">
          <ErrorAlert>{erroAcao}</ErrorAlert>
        </div>
      )}

      <div key={`${nivel}:${pedidoAtual?.id ?? ''}`} className={cn(ANIMACAO_NIVEL, direcao === 'frente' && 'slide-in-from-right-3', direcao === 'voltar' && 'slide-in-from-left-3')}>
        {isLoading ? (
          <CarregandoLinhas />
        ) : error ? (
          <div className="p-4">
            <ErrorAlert>Falha ao carregar os pedidos dessa cotação.</ErrorAlert>
          </div>
        ) : nivel === 'lista' ? (
          <Lista>
            {lista.map((p) => (
              <LinhaLista
                key={p.id}
                titulo={p.empresaNome}
                onClick={() => abrir(p)}
                meta={
                  <>
                    {p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'} · Cond.: {p.condicaoPagamento ?? '—'} · Prazo:{' '}
                    {p.prazoEntregaEstimado ?? '—'}
                  </>
                }
                fim={
                  <>
                    <Selo tom={TOM_STATUS[p.status] ?? 'neutro'}>{ROTULO_STATUS[p.status] ?? p.status}</Selo>
                    <span className="tabular-nums font-medium text-foreground">{moeda(p.total)}</span>
                    <CaretRight className="size-4 text-muted-foreground" />
                  </>
                }
              />
            ))}
          </Lista>
        ) : pedidoAtual ? (
          <>
            <div className="flex flex-wrap gap-2 p-4 pb-3">
              <Button variant="outline" size="sm" onClick={() => aoBaixarPdf(pedidoAtual.id)}>
                <FilePdf className="mr-1.5 size-4" /> Baixar PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => aoReenviar(pedidoAtual.id)} disabled={reenviar.isPending}>
                <PaperPlaneTilt className="mr-1.5 size-4" /> {reenviar.isPending ? 'Reenviando…' : 'Reenviar e-mail'}
              </Button>
            </div>
            <TabelaItens itens={pedidoAtual.itens} />
          </>
        ) : null}
      </div>

      <div className={RODAPE}>
        {nivel === 'lista' ? (
          <>
            <span>{itensCotacao} {itensCotacao === 1 ? 'item no total' : 'itens no total'}</span>
            <span className="text-base font-semibold tabular-nums text-foreground">{moeda(totalCotacao)}</span>
          </>
        ) : pedidoAtual ? (
          <>
            <span>{pedidoAtual.itens.length} {pedidoAtual.itens.length === 1 ? 'item' : 'itens'}</span>
            <span className="text-base font-semibold tabular-nums text-foreground">{moeda(pedidoAtual.total)}</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

function ConteudoAvulsoMes({ contexto, onFechar }: { contexto: Extract<ContextoPainel, { tipo: 'avulso-mes' }>; onFechar: () => void }) {
  const [nivel, setNivel] = useState<'lista' | 'itens'>('lista')
  const [pedidoId, setPedidoId] = useState<string | null>(null)
  const [direcao, setDirecao] = useState<Direcao>(null)
  const detalhe = usePedidoAvulso(nivel === 'itens' ? (pedidoId ?? undefined) : undefined)

  function abrir(p: PedidoResumo) {
    setDirecao('frente')
    setPedidoId(p.id)
    setNivel('itens')
  }
  function voltar() {
    setDirecao('voltar')
    setNivel('lista')
    setPedidoId(null)
  }

  const resumoAtual = contexto.pedidos.find((p) => p.id === pedidoId) ?? null
  const totalMes = contexto.pedidos.reduce((s, p) => s + p.total, 0)
  const itensMes = contexto.pedidos.reduce((s, p) => s + p.quantidadeItens, 0)

  return (
    <div className="flex h-[70vh] max-h-[640px] flex-col">
      <div className={CABECALHO}>
        {nivel === 'itens' && (
          <Button variant="ghost" size="icon" onClick={voltar} aria-label="Voltar" className="h-8 w-8 shrink-0 text-muted-foreground">
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          {nivel === 'itens' && resumoAtual && (
            <div className="mb-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <span className="truncate">Avulsos — {contexto.rotulo}</span>
              <CaretRight className="size-3 shrink-0" />
            </div>
          )}
          <div className="truncate text-[15px] font-semibold text-foreground">
            {nivel === 'itens' && resumoAtual ? (resumoAtual.empresaNome ?? '—') : `Avulsos — ${contexto.rotulo}`}
          </div>
          <div className="mt-[1px] text-xs text-muted-foreground">
            {nivel === 'itens' && resumoAtual
              ? `Status ${(ROTULO_STATUS[resumoAtual.status] ?? resumoAtual.status).toLowerCase()}`
              : `${contexto.pedidos.length} ${contexto.pedidos.length === 1 ? 'pedido' : 'pedidos'}`}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onFechar} aria-label="Fechar" className="h-8 w-8 shrink-0 text-muted-foreground">
          <X className="size-4" />
        </Button>
      </div>

      <div key={`${nivel}:${pedidoId ?? ''}`} className={cn(ANIMACAO_NIVEL, direcao === 'frente' && 'slide-in-from-right-3', direcao === 'voltar' && 'slide-in-from-left-3')}>
        {nivel === 'lista' ? (
          <Lista>
            {contexto.pedidos.map((p) => (
              <LinhaLista
                key={p.id}
                titulo={p.empresaNome ?? '—'}
                onClick={() => abrir(p)}
                meta={
                  <>
                    {p.quantidadeItens} {p.quantidadeItens === 1 ? 'item' : 'itens'} · Cond.: {p.condicaoPagamento ?? '—'} ·
                    Prazo: {p.prazoEntregaEstimado ?? '—'}
                  </>
                }
                fim={
                  <>
                    <Selo tom={TOM_STATUS[p.status] ?? 'neutro'}>{ROTULO_STATUS[p.status] ?? p.status}</Selo>
                    <span className="tabular-nums font-medium text-foreground">{moeda(p.total)}</span>
                    <CaretRight className="size-4 text-muted-foreground" />
                  </>
                }
              />
            ))}
          </Lista>
        ) : detalhe.isLoading ? (
          <CarregandoLinhas />
        ) : detalhe.error ? (
          <div className="p-4">
            <ErrorAlert>Falha ao carregar os itens desse pedido.</ErrorAlert>
          </div>
        ) : detalhe.data ? (
          <TabelaItens
            itens={(detalhe.data as PedidoAvulso).itens.map((it) => ({
              id: it.id,
              nomeSnapshot: it.nomeSnapshot,
              unidadeSnapshot: it.unidadeSnapshot,
              quantidade: it.quantidade,
              precoUnitario: it.precoUnitario,
              subtotal: it.precoUnitario * it.quantidade,
            }))}
          />
        ) : null}
      </div>

      <div className={RODAPE}>
        {nivel === 'lista' ? (
          <>
            <span>{itensMes} {itensMes === 1 ? 'item no total' : 'itens no total'}</span>
            <span className="text-base font-semibold tabular-nums text-foreground">{moeda(totalMes)}</span>
          </>
        ) : resumoAtual ? (
          <>
            <span>{resumoAtual.quantidadeItens} {resumoAtual.quantidadeItens === 1 ? 'item' : 'itens'}</span>
            <span className="text-base font-semibold tabular-nums text-foreground">{moeda(resumoAtual.total)}</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Drill-down dos Pedidos (design.md do prototype "pedidos-agrupados"): cartão de Cotação
 * abre a lista de empresas participantes, cartão de mês de Avulsos abre a lista de pedidos
 * daquele mês — em ambos, clicar numa linha entra no nível de itens. PDF/planilha/reenviar
 * e-mail só existem pro lado Cotação (endpoints reais já existentes em `cotacoes.api.ts`);
 * Avulso não tem PDF/e-mail no back hoje, por isso não aparecem aqui.
 */
export function PainelPedido({ contexto, onFechar }: { contexto: ContextoPainel | null; onFechar: () => void }) {
  return (
    <Dialog open={contexto != null} onClose={onFechar} size="xl" ariaLabel="Detalhe do pedido">
      {contexto?.tipo === 'cotacao' && <ConteudoCotacao contexto={contexto} onFechar={onFechar} />}
      {contexto?.tipo === 'avulso-mes' && <ConteudoAvulsoMes contexto={contexto} onFechar={onFechar} />}
    </Dialog>
  )
}
