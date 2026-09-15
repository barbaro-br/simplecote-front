import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AnimatedNumber } from '@/shared/components/ui/animated-number'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { moeda } from '@/shared/format/formatters'
import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { Icon } from '../cotacoes/v2/ui-v2'
import { buscarDashboard } from './analise.api'

function variacaoGasto(atual: number, anterior: number): { texto: string; subiu: boolean } | null {
  if (anterior <= 0) return null
  const pct = ((atual - anterior) / anterior) * 100
  const seta = pct >= 0 ? '▲' : '▼'
  return { texto: `${seta} ${Math.abs(pct).toFixed(0)}% vs. mês anterior`, subiu: pct >= 0 }
}

interface PainelDashboardProps {
  onStatusClick: (status: StatusCotacao) => void
}

const STATUS_LISTA = [
  { chave: 'rascunho', rotulo: 'Rascunho', status: 'RASCUNHO', cor: 'bg-slate-400', borda: 'border-slate-400/30' },
  { chave: 'aberta', rotulo: 'Aberta', status: 'ABERTA', cor: 'bg-emerald-400', borda: 'border-emerald-400/30' },
  { chave: 'encerrada', rotulo: 'Encerrada', status: 'ENCERRADA', cor: 'bg-amber-400', borda: 'border-amber-400/30' },
  { chave: 'apurada', rotulo: 'Pedidos gerados', status: 'PEDIDOS_GERADOS', cor: 'bg-teal-400', borda: 'border-teal-400/30' },
  { chave: 'cancelada', rotulo: 'Cancelada', status: 'CANCELADA', cor: 'bg-rose-400', borda: 'border-rose-400/30' },
] as const

function RankingCard({
  titulo,
  subtitulo,
  icone,
  itens,
}: {
  titulo: string
  subtitulo: string
  icone: string
  itens: { nome: string; valor: number }[]
}) {
  const max = Math.max(0, ...itens.map((i) => i.valor))

  return (
    <div className="rounded-none border border-white/15 bg-[#0d1410] shadow-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 bg-[#16211a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={icone} className="text-primary text-[18px]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">{titulo}</h3>
        </div>
        <span className="text-[11px] font-mono text-on-surface-variant/70 uppercase">
          {subtitulo}
        </span>
      </div>

      <div className="p-4 flex-1">
        {itens.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-on-surface-variant/70">Nenhum dado registrado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {itens.map((item, idx) => {
              const pct = max > 0 ? (item.valor / max) * 100 : 0
              return (
                <div key={item.nome} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-none bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-on-surface-variant flex items-center justify-center shrink-0">
                        {idx + 1}º
                      </span>
                      <span className="font-medium text-on-surface truncate" title={item.nome}>
                        {item.nome}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-primary shrink-0 tabular-nums">
                      {moeda(item.valor)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 border border-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function PainelDashboard({ onStatusClick }: PainelDashboardProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['analise', 'dashboard'],
    queryFn: buscarDashboard,
    staleTime: 60_000,
    retry: 1,
  })

  if (isPending) {
    return (
      <div className="space-y-4" data-testid="dashboard-skeleton">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full bg-white/5 border border-white/10 rounded-none" />
          <Skeleton className="h-32 w-full bg-white/5 border border-white/10 rounded-none" />
          <Skeleton className="h-32 w-full bg-white/5 border border-white/10 rounded-none" />
        </div>
        <Skeleton className="h-28 w-full bg-white/5 border border-white/10 rounded-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full bg-white/5 border border-white/10 rounded-none" />
          <Skeleton className="h-44 w-full bg-white/5 border border-white/10 rounded-none" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return null
  }

  const totalStatus = Object.values(data.porStatus).reduce((a, b) => a + b, 0)
  const semAtividade =
    totalStatus === 0 &&
    data.gastoMes === 0 &&
    data.gastoMesAnterior === 0 &&
    data.economiaEstimada90d === 0 &&
    data.topProdutos.length === 0 &&
    data.topEmpresas.length === 0

  if (semAtividade) {
    return (
      <div className="rounded-none border border-white/15 bg-[#0f1712] p-8 sm:p-12 text-center shadow-xl">
        <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto mb-4 shadow-[0_0_20px_rgba(78,222,163,0.15)]">
          <Icon name="query_stats" className="text-3xl" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-1">Comece criando sua primeira cotação</h3>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto mb-6">
          Os números de economia e gasto aparecem aqui conforme suas cotações são apuradas.
        </p>
        <Link
          to="/admin/cotacoes/nova"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold text-sm shadow-[0_0_20px_rgba(78,222,163,0.35)] transition-all cursor-pointer"
        >
          <Icon name="add" className="text-lg" />
          Nova cotação
        </Link>
      </div>
    )
  }

  const variacao = variacaoGasto(data.gastoMes, data.gastoMesAnterior)

  return (
    <div className="space-y-4 text-on-surface">
      {/* 1. RESUMO FINANCEIRO (ECONOMIA E GASTOS) */}
      <div className="rounded-none border border-white/15 bg-[#0d1410] shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 bg-[#16211a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="account_balance" className="text-primary text-[18px]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Resumo financeiro</h3>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant/70 uppercase">
            Balanço geral
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Card 1: Economia Estimada 90 dias */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-950/20 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Icon name="savings" className="text-base text-primary" />
                Economia estimada (90 dias)
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary drop-shadow-[0_0_12px_rgba(78,222,163,0.35)]">
              <AnimatedNumber value={data.economiaEstimada90d} formatter={moeda} />
            </div>
            <p className="text-[11px] text-on-surface-variant/70 mt-1">
              Diferença comparando com o maior preço dos concorrentes
            </p>
          </div>

          {/* Card 2: Gasto do mês */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-cyan-950/15 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Icon name="payments" className="text-base text-cyan-400" />
                Gasto do mês
              </span>
              {variacao && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    variacao.subiu
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {variacao.texto}
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-on-surface">
              <AnimatedNumber value={data.gastoMes} formatter={moeda} />
            </div>
            <p className="text-[11px] text-on-surface-variant/70 mt-1">
              Total de compras realizadas neste mês
            </p>
          </div>

          {/* Card 3: Mês anterior */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900/40 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Icon name="history" className="text-base text-slate-400" />
                Mês anterior
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-on-surface/80">
              <AnimatedNumber value={data.gastoMesAnterior} formatter={moeda} />
            </div>
            <p className="text-[11px] text-on-surface-variant/70 mt-1">
              Total de compras realizadas no mês anterior
            </p>
          </div>
        </div>
      </div>

      {/* 2. PRECISA DE AÇÃO (ALERTAS OPERACIONAIS) */}
      {(data.encerradasSemApurar > 0 || data.apuradasSemPedidoEnviado > 0) && (
        <div className="rounded-none border border-amber-500/30 bg-[#161a14] shadow-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-amber-500/20 bg-amber-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Icon name="warning" className="text-base" />
              Precisa de ação
            </div>
            <span className="text-[10px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Atenção
            </span>
          </div>

          <div className="p-4 flex flex-wrap gap-3">
            {data.encerradasSemApurar > 0 && (
              <button
                type="button"
                onClick={() => onStatusClick('ENCERRADA')}
                className="flex items-center gap-3 px-4 py-3 rounded-none border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-none bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-extrabold text-lg font-mono shrink-0">
                  {data.encerradasSemApurar}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-amber-200 block group-hover:underline">
                    encerradas sem apurar
                  </span>
                  <span className="text-[11px] text-on-surface-variant/80">
                    Clique para apurar os lances e definir vencedores
                  </span>
                </div>
                <Icon name="arrow_forward" className="text-amber-300 text-lg opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-2" />
              </button>
            )}

            {data.apuradasSemPedidoEnviado > 0 && (
              <button
                type="button"
                onClick={() => onStatusClick('PEDIDOS_GERADOS')}
                className="flex items-center gap-3 px-4 py-3 rounded-none border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 transition-all text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-none bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-primary font-extrabold text-lg font-mono shrink-0">
                  {data.apuradasSemPedidoEnviado}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-200 block group-hover:underline">
                    apuradas sem pedido enviado
                  </span>
                  <span className="text-[11px] text-on-surface-variant/80">
                    Clique para baixar romaneios e enviar aos fornecedores
                  </span>
                </div>
                <Icon name="arrow_forward" className="text-primary text-lg opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-2" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. COTAÇÕES POR STATUS (CARDS SIMPLES E DIRETOS) */}
      <div className="rounded-none border border-white/15 bg-[#0d1410] shadow-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 bg-[#16211a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="format_list_bulleted" className="text-primary text-[18px]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Cotações por status
            </h3>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant/70">
            Total: {totalStatus} cotações
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {STATUS_LISTA.map((s) => {
              const count = data.porStatus[s.chave]
              const pct = totalStatus > 0 ? (count / totalStatus) * 100 : 0
              return (
                <button
                  key={s.chave}
                  type="button"
                  onClick={() => onStatusClick(s.status)}
                  className={`p-3.5 rounded-none border ${s.borda} bg-white/[0.02] hover:bg-white/[0.06] transition-all text-left flex flex-col justify-between group cursor-pointer`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-semibold text-on-surface-variant truncate">
                      {s.rotulo}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${s.cor}`} />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-on-surface group-hover:text-primary transition-colors">
                      {count}
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant/60">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4. RANKINGS: FORNECEDORES QUE MAIS VENDEM & PRODUTOS MAIS COMPRADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RankingCard
          titulo="Fornecedores que mais vendem"
          subtitulo="Maior volume aprovado"
          icone="storefront"
          itens={data.topEmpresas}
        />
        <RankingCard
          titulo="Produtos mais comprados"
          subtitulo="Maior volume aprovado"
          icone="inventory_2"
          itens={data.topProdutos}
        />
      </div>
    </div>
  )
}
