import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui/card'
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

export function PainelDashboard({ onStatusClick }: PainelDashboardProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['analise', 'dashboard'],
    queryFn: buscarDashboard,
    staleTime: 60_000,
    retry: 1,
  })

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5" data-testid="dashboard-skeleton">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return null
  }

  const parseNum = (str: string) => Number(str) || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
      {/* Precisa de ação */}
      <Card className="p-4 flex flex-col justify-between">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Precisa de ação</h2>
        <div className="space-y-3">
          <button
            onClick={() => onStatusClick('ENCERRADA')}
            className="flex items-center justify-between w-full hover:underline text-left"
          >
            <span className="text-sm">Encerradas sem apurar</span>
            <span className="font-semibold">{data.contadores.encerradasSemApurar}</span>
          </button>
          <button
            onClick={() => onStatusClick('PEDIDOS_GERADOS')}
            className="flex items-center justify-between w-full hover:underline text-left"
          >
            <span className="text-sm">Apuradas sem pedido</span>
            <span className="font-semibold">{data.contadores.apuradasSemPedido}</span>
          </button>
        </div>
      </Card>

      {/* Gastos e Economia */}
      <Card className="p-4 flex flex-col justify-between">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Gastos (mês atual)</h2>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold">{moeda(parseNum(data.gastos.mesAtual))}</span>
        </div>
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <span>vs {moeda(parseNum(data.gastos.mesAnterior))}</span>
          {data.gastos.variacaoPct && (
            <span
              className={
                parseNum(data.gastos.variacaoPct) > 0
                  ? 'text-destructive font-medium'
                  : 'text-green-600 font-medium'
              }
            >
              ({parseNum(data.gastos.variacaoPct) > 0 ? '+' : ''}{parseNum(data.gastos.variacaoPct).toFixed(1)}%)
            </span>
          )}
        </div>
        
        <div className="pt-3 border-t">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Economia (90d)</span>
          <div className="text-sm font-medium text-green-600 mt-1">
            {moeda(parseNum(data.gastos.economia90d))}
          </div>
        </div>
      </Card>

      {/* Próximos prazos */}
      <Card className="p-4 flex flex-col justify-between">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Próximos prazos</h2>
        {data.proximosPrazos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nada por aqui</p>
        ) : (
          <ul className="space-y-2">
            {data.proximosPrazos.map((prazo) => {
              const rel = prazoRelativo(prazo.fechaEm)
              return (
                <li key={prazo.id} className="flex justify-between items-center text-sm">
                  <Link to={`/admin/cotacoes/${prazo.id}`} className="truncate max-w-[140px] hover:underline">
                    {prazo.titulo}
                  </Link>
                  <span className={`text-xs font-medium whitespace-nowrap ${rel.atrasado ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {rel.texto}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* Contagem por status */}
      <Card className="p-4 col-span-1 md:col-span-2 lg:col-span-3">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Visão geral</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(data.porStatus).map(([status, count]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{status}:</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
          {Object.keys(data.porStatus).length === 0 && (
            <span className="text-muted-foreground">Sem cotações ativas</span>
          )}
        </div>
      </Card>
      
      {/* Top Produtos / Empresas */}
      <Card className="p-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Top 5 Produtos</h2>
        {data.topProdutos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nada por aqui</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {data.topProdutos.map((p, i) => (
              <li key={i} className="flex justify-between items-center">
                <span className="truncate max-w-[150px]">{p.nome}</span>
                <span className="font-medium">{moeda(parseNum(p.valor))}</span>
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
          <ul className="space-y-1.5 text-sm">
            {data.topEmpresas.map((e, i) => (
              <li key={i} className="flex justify-between items-center">
                <span className="truncate max-w-[150px]">{e.nome}</span>
                <span className="font-medium">{moeda(parseNum(e.valor))}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
