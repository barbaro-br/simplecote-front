import { Link } from 'react-router-dom'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { moeda, dataBr } from '@/shared/format/formatters'
import { Sparkline } from './Sparkline'
import type { InsightProduto } from './analise.schema'

interface Props {
  insight: InsightProduto | null | 'erro'
}

export function InsightProdutoCard({ insight }: Props) {
  if (insight === 'erro') {
    return (
      <div className="p-4 w-64 text-sm text-destructive bg-popover text-popover-foreground rounded-md shadow-md border" data-testid="insight-produto-erro">
        Insight indisponível.
      </div>
    )
  }

  if (insight === null || !insight.ultimaCompra) {
    return (
      <div className="p-4 w-64 text-sm text-muted-foreground bg-popover rounded-md shadow-md border" data-testid="insight-produto-vazio">
        Sem compra anterior.
      </div>
    )
  }

  const variacao = insight.variacaoPct
  const subiu = variacao !== null && variacao > 0
  const desceu = variacao !== null && variacao < 0

  return (
    <div className="p-4 w-72 text-sm bg-popover text-popover-foreground rounded-md shadow-md border" data-testid="insight-produto-card">
      <span className="sr-only">Última compra</span>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold text-base">
            {moeda(insight.ultimaCompra.precoUnitario)}
            <span className="sr-only">/ un</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {dataBr(insight.ultimaCompra.data)}
          </div>
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-sm ${
            subiu
              ? 'bg-destructive/10 text-destructive'
              : desceu
              ? 'bg-success/10 text-success'
              : 'bg-muted text-muted-foreground'
          }`}
          data-testid="badge-variacao"
        >
          {subiu ? (
            <TrendingUp className="size-3" />
          ) : desceu ? (
            <TrendingDown className="size-3" />
          ) : (
            <Minus className="size-3" />
          )}
          {variacao !== null ? `${Math.abs(variacao).toFixed(1)}%` : '—'}
        </div>
      </div>

      <div className="space-y-1 mb-3 text-xs">
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">{insight.ultimaCompra.empresa}</span>
          {insight.ultimaCompra.representante && ` • ${insight.ultimaCompra.representante}`}
        </div>
        <div className="text-muted-foreground">Qtd: {insight.ultimaCompra.quantidade}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-muted/50 p-2 rounded">
          <div className="text-muted-foreground mb-1">Menor</div>
          <div className="font-medium">
            {insight.menorPrecoUnitario !== null ? moeda(insight.menorPrecoUnitario) : '—'}
          </div>
        </div>
        <div className="bg-muted/50 p-2 rounded">
          <div className="text-muted-foreground mb-1">Média 90d</div>
          <div className="font-medium">
            {insight.precoMedioUnitario90d !== null ? moeda(insight.precoMedioUnitario90d) : '—'}
          </div>
        </div>
        <div className="bg-muted/50 p-2 rounded">
          <div className="text-muted-foreground mb-1">Compras</div>
          <div className="font-medium">{insight.compras ?? '—'}</div>
        </div>
        <div className="bg-muted/50 p-2 rounded">
          <div className="text-muted-foreground mb-1">Fornecedores</div>
          <div className="font-medium">{insight.fornecedoresDistintos ?? '—'}</div>
        </div>
      </div>

      {insight.serie && insight.serie.length > 0 && (
        <div className="mb-3 flex justify-center text-primary" data-testid="container-sparkline">
          <Sparkline pontos={insight.serie.map(p => p.precoUnitario)} />
        </div>
      )}

      {insight.ultimaCompra.cotacaoId && (
        <Link
          to={`/admin/cotacoes/${insight.ultimaCompra.cotacaoId}/resultado`}
          className="text-primary hover:underline text-xs font-medium block text-center mt-2"
        >
          Ver cotação
        </Link>
      )}
    </div>
  )
}
