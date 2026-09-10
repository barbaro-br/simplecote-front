import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AnimatedNumber } from '@/shared/components/ui/animated-number'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Superficie, SecaoCabecalho, CampoEstat, Lista, LinhaLista } from '@/shared/ui'
import { moeda } from '@/shared/format/formatters'
import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { buscarDashboard } from './analise.api'

function prazoRelativo(fechaEm: string) {
  const agora = new Date()
  agora.setHours(0, 0, 0, 0)
  const limite = new Date(fechaEm)
  limite.setHours(0, 0, 0, 0)

  const diffTime = limite.getTime() - agora.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return { texto: 'vence hoje', atrasado: false }
  if (diffDays === 1) return { texto: 'vence amanhã', atrasado: false }
  if (diffDays > 1) return { texto: `vence em ${diffDays} dias`, atrasado: false }
  if (diffDays === -1) return { texto: 'venceu ontem', atrasado: true }
  return { texto: `venceu há ${Math.abs(diffDays)} dias`, atrasado: true }
}

// Variação percentual do gasto do mês contra o anterior. `null` = sem base de
// comparação (mês anterior zerado).
function variacaoGasto(atual: number, anterior: number): { texto: string; subiu: boolean } | null {
  if (anterior <= 0) return null
  const pct = ((atual - anterior) / anterior) * 100
  const sinal = pct >= 0 ? '+' : ''
  return { texto: `${sinal}${pct.toFixed(0)}% vs. mês anterior`, subiu: pct >= 0 }
}

interface PainelDashboardProps {
  onStatusClick: (status: StatusCotacao) => void
}

const STATUS_PIPELINE = [
  { chave: 'rascunho', rotulo: 'Rascunho', status: 'RASCUNHO', cor: 'bg-muted-foreground/40' },
  { chave: 'aberta', rotulo: 'Aberta', status: 'ABERTA', cor: 'bg-primary' },
  { chave: 'encerrada', rotulo: 'Encerrada', status: 'ENCERRADA', cor: 'bg-warning' },
  { chave: 'apurada', rotulo: 'Pedidos gerados', status: 'PEDIDOS_GERADOS', cor: 'bg-success' },
  { chave: 'cancelada', rotulo: 'Cancelada', status: 'CANCELADA', cor: 'bg-destructive' },
] as const

function BarraTop({
  itens,
  vazio,
}: {
  itens: { nome: string; valor: number }[]
  vazio: string
}) {
  if (itens.length === 0) {
    return <p className="px-4 py-4 text-sm text-[var(--pnl-txt-3,rgba(255,255,255,0.45))] sm:px-5">{vazio}</p>
  }
  const max = Math.max(0, ...itens.map((i) => i.valor))
  return (
    <ul className="space-y-3 px-4 py-4 sm:px-5">
      {itens.map((i) => (
        <li key={i.nome} className="text-sm">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">{i.nome}</span>
            <span className="shrink-0 font-medium tabular-nums text-[var(--pnl-txt,#fff)]">{moeda(i.valor)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[var(--pnl-acento,#57bf8e)]"
              style={{ width: `${max > 0 ? (i.valor / max) * 100 : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
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
      <div className="@container">
        <div className="mb-5 grid grid-cols-1 gap-4 @md:grid-cols-3" data-testid="dashboard-skeleton">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
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
    data.proximosPrazos.length === 0 &&
    data.topProdutos.length === 0 &&
    data.topEmpresas.length === 0 &&
    data.gastoMes === 0 &&
    data.gastoMesAnterior === 0 &&
    data.economiaEstimada90d === 0

  if (semAtividade) {
    return (
      <Superficie className="mb-5">
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <p className="text-sm font-medium text-[var(--pnl-txt,#fff)]">Comece criando sua primeira cotação</p>
          <p className="text-xs text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            Os números de economia e gasto aparecem aqui conforme suas cotações são apuradas.
          </p>
          <Link
            to="/admin/cotacoes/nova"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Nova cotação
          </Link>
        </div>
      </Superficie>
    )
  }

  const variacao = variacaoGasto(data.gastoMes, data.gastoMesAnterior)

  return (
    <div className="mb-5 space-y-4 @container">
      {/* Resumo — KPIs */}
      <Superficie>
        <SecaoCabecalho titulo="Resumo" />
        <div className="grid grid-cols-1 gap-px bg-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))] @md:grid-cols-3">
          <div className="bg-[var(--pnl-superficie,#12263f)] p-4 sm:p-5">
            <CampoEstat
              rotulo="Economia estimada (90 dias)"
              valor={<AnimatedNumber value={data.economiaEstimada90d} formatter={moeda} />}
            />
          </div>
          <div className="bg-[var(--pnl-superficie,#12263f)] p-4 sm:p-5">
            <CampoEstat
              rotulo="Gasto do mês"
              valor={<AnimatedNumber value={data.gastoMes} formatter={moeda} />}
              sufixo={variacao?.texto}
            />
          </div>
          <div className="bg-[var(--pnl-superficie,#12263f)] p-4 sm:p-5">
            <CampoEstat
              rotulo="Mês anterior"
              valor={<AnimatedNumber value={data.gastoMesAnterior} formatter={moeda} />}
            />
          </div>
        </div>
      </Superficie>

      {/* Precisa de ação */}
      <Superficie>
        <SecaoCabecalho titulo="Precisa de ação" />
        <div className="flex flex-wrap gap-3 p-4 sm:p-5">
          <button
            onClick={() => onStatusClick('ENCERRADA')}
            className="flex items-center gap-2 rounded-lg border border-[var(--pnl-borda,rgba(255,255,255,0.1))] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--pnl-acento,#57bf8e)]/50"
          >
            <span className="font-semibold tabular-nums text-[var(--pnl-txt,#fff)]">{data.encerradasSemApurar}</span>
            <span className="text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">encerradas sem apurar</span>
          </button>
          <button
            onClick={() => onStatusClick('PEDIDOS_GERADOS')}
            className="flex items-center gap-2 rounded-lg border border-[var(--pnl-borda,rgba(255,255,255,0.1))] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--pnl-acento,#57bf8e)]/50"
          >
            <span className="font-semibold tabular-nums text-[var(--pnl-txt,#fff)]">{data.apuradasSemPedidoEnviado}</span>
            <span className="text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">apuradas sem pedido enviado</span>
          </button>
        </div>
      </Superficie>

      {/* Pipeline de status */}
      <Superficie>
        <SecaoCabecalho titulo="Cotações por status" />
        <div className="p-4 sm:p-5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            {STATUS_PIPELINE.map((s) => {
              const count = data.porStatus[s.chave]
              const pct = totalStatus > 0 ? (count / totalStatus) * 100 : 0
              return (
                <div
                  key={s.chave}
                  className={`${s.cor} h-full transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${s.rotulo}: ${count}`}
                />
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {STATUS_PIPELINE.map((s) => (
              <button
                key={s.chave}
                type="button"
                onClick={() => onStatusClick(s.status)}
                className="flex items-center gap-1.5 hover:underline"
              >
                <span className={`size-2.5 rounded-full ${s.cor}`} />
                <span className="text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{s.rotulo}</span>
                <span className="font-semibold tabular-nums text-[var(--pnl-txt,#fff)]">{data.porStatus[s.chave]}</span>
              </button>
            ))}
          </div>
        </div>
      </Superficie>

      {/* Próximos prazos */}
      <Superficie>
        <SecaoCabecalho titulo="Próximos prazos" />
        {data.proximosPrazos.length === 0 ? (
          <p className="px-4 py-4 text-sm text-[var(--pnl-txt-3,rgba(255,255,255,0.45))] sm:px-5">Nada por aqui</p>
        ) : (
          <Lista>
            {data.proximosPrazos.map((prazo) => {
              const rel = prazoRelativo(prazo.fechaEm)
              return (
                <LinhaLista
                  key={prazo.cotacaoId}
                  titulo={
                    <Link to={`/admin/cotacoes/${prazo.cotacaoId}`} className="hover:underline">
                      {prazo.titulo}
                    </Link>
                  }
                  fim={
                    <span
                      className={`whitespace-nowrap text-xs font-medium ${
                        rel.atrasado
                          ? 'text-[var(--pnl-perigo,#f87171)]'
                          : 'text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]'
                      }`}
                    >
                      {rel.texto}
                    </span>
                  }
                />
              )
            })}
          </Lista>
        )}
      </Superficie>

      {/* Top 5 */}
      <div className="grid grid-cols-1 gap-4 @md:grid-cols-2">
        <Superficie>
          <SecaoCabecalho titulo="Top 5 Produtos" />
          <BarraTop itens={data.topProdutos} vazio="Nada por aqui" />
        </Superficie>
        <Superficie>
          <SecaoCabecalho titulo="Top 5 Empresas" />
          <BarraTop itens={data.topEmpresas} vazio="Nada por aqui" />
        </Superficie>
      </div>
    </div>
  )
}
