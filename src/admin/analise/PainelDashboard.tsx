import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui/card'
import { AnimatedNumber } from '@/shared/components/ui/animated-number'
import { Skeleton } from '@/shared/components/ui/skeleton'
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

interface PainelDashboardProps {
  onStatusClick: (status: StatusCotacao) => void
}

const STATUS_PIPELINE = [
  { chave: 'rascunho', rotulo: 'Rascunho', status: 'RASCUNHO', cor: 'bg-muted-foreground/40' },
  { chave: 'aberta', rotulo: 'Aberta', status: 'ABERTA', cor: 'bg-primary' },
  { chave: 'encerrada', rotulo: 'Encerrada', status: 'ENCERRADA', cor: 'bg-warning' },
  { chave: 'apurada', rotulo: 'Apurada', status: 'PEDIDOS_GERADOS', cor: 'bg-success' },
  { chave: 'cancelada', rotulo: 'Cancelada', status: 'CANCELADA', cor: 'bg-destructive' },
] as const

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
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-4 mb-5" data-testid="dashboard-skeleton">
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
      <Card className="p-6 mb-5 flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium">Comece criando sua primeira cotação</p>
        <p className="text-xs text-muted-foreground">
          Os números de economia e gasto aparecem aqui conforme suas cotações são apuradas.
        </p>
        <Link
          to="/admin/cotacoes/nova"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Nova cotação
        </Link>
      </Card>
    )
  }

  const maxProduto = Math.max(0, ...data.topProdutos.map((p) => p.valor))
  const maxEmpresa = Math.max(0, ...data.topEmpresas.map((e) => e.valor))

  return (
    <div className="space-y-4 mb-5 @container">
      <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
        {/* Hero: economia */}
        <Card className="p-4 md:col-span-1">
          <h2 className="text-sm font-medium text-muted-foreground">Economia estimada (90 dias)</h2>
          <div className="mt-2 text-3xl font-bold text-success-foreground tabular-nums">
            <AnimatedNumber value={data.economiaEstimada90d} formatter={moeda} />
          </div>
        </Card>

        {/* Gastos */}
        <Card className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground">Gastos</h2>
          <div className="mt-2 flex items-baseline gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Mês atual</div>
              <div className="text-xl font-bold tabular-nums">
                <AnimatedNumber value={data.gastoMes} formatter={moeda} />
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Mês anterior</div>
              <div className="text-xl font-semibold text-muted-foreground tabular-nums">
                <AnimatedNumber value={data.gastoMesAnterior} formatter={moeda} />
              </div>
            </div>
          </div>
        </Card>

        {/* Próximos prazos */}
        <Card className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Próximos prazos</h2>
          {data.proximosPrazos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada por aqui</p>
          ) : (
            <ul className="space-y-2">
              {data.proximosPrazos.map((prazo) => {
                const rel = prazoRelativo(prazo.fechaEm)
                return (
                  <li key={prazo.cotacaoId} className="flex justify-between items-center text-sm">
                    <Link
                      to={`/admin/cotacoes/${prazo.cotacaoId}`}
                      className="truncate max-w-[140px] hover:underline"
                    >
                      {prazo.titulo}
                    </Link>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        rel.atrasado ? 'text-destructive' : 'text-muted-foreground'
                      }`}
                    >
                      {rel.texto}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Precisa de ação */}
      <Card className="p-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Precisa de ação</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onStatusClick('ENCERRADA')}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary/50 transition-colors text-left"
          >
            <span className="font-semibold tabular-nums">{data.encerradasSemApurar}</span>
            <span className="text-muted-foreground">encerradas sem apurar</span>
          </button>
          <button
            onClick={() => onStatusClick('PEDIDOS_GERADOS')}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-primary/50 transition-colors text-left"
          >
            <span className="font-semibold tabular-nums">{data.apuradasSemPedidoEnviado}</span>
            <span className="text-muted-foreground">apuradas sem pedido enviado</span>
          </button>
        </div>
      </Card>

      {/* Pipeline de status */}
      <Card className="p-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Cotações por status</h2>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
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
              <span className="text-muted-foreground">{s.rotulo}</span>
              <span className="font-semibold tabular-nums">{data.porStatus[s.chave]}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Top 5 */}
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Top 5 Produtos</h2>
          {data.topProdutos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada por aqui</p>
          ) : (
            <ul className="space-y-2">
              {data.topProdutos.map((p) => (
                <li key={p.nome} className="text-sm">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="truncate max-w-[150px]">{p.nome}</span>
                    <span className="font-medium tabular-nums">{moeda(p.valor)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${maxProduto > 0 ? (p.valor / maxProduto) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Top 5 Empresas</h2>
          {data.topEmpresas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada por aqui</p>
          ) : (
            <ul className="space-y-2">
              {data.topEmpresas.map((e) => (
                <li key={e.nome} className="text-sm">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="truncate max-w-[150px]">{e.nome}</span>
                    <span className="font-medium tabular-nums">{moeda(e.valor)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${maxEmpresa > 0 ? (e.valor / maxEmpresa) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
