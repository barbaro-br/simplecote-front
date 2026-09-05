import { Info } from 'lucide-react'
import type { ItemGrid } from './cotacoes.schema'
import { InsightProdutoCard } from '../analise/InsightProdutoCard'
import type { InsightProduto } from '../analise/analise.schema'
import { HoverCard } from '@/shared/components/ui/HoverCard'

export function UltimaCompraPopover({ item, insight }: { item?: ItemGrid; insight?: InsightProduto | null | 'erro' }) {
  let derivedInsight: InsightProduto | null | 'erro' = null
  if (insight !== undefined) {
    derivedInsight = insight
  } else if (item) {
    const temCompra = item.ultimaCompraEm != null && item.ultimoPrecoUnitario != null
    if (temCompra) {
      derivedInsight = {
        ultimaCompra: {
          // a grade ao vivo não carrega a cotação de origem da última compra;
          // sem id → o card não renderiza o link "Ver cotação" (guarda no componente).
          cotacaoId: null,
          empresa: item.ultimaCompraEmpresa ?? '—',
          representante: '',
          precoUnitario: item.ultimoPrecoUnitario as number,
          data: item.ultimaCompraEm as string,
          quantidade: 1,
        },
        variacaoPct: null,
        menorPrecoUnitario: item.menorPrecoUnitario ?? null,
        precoMedioUnitario90d: null,
        compras: 0,
        fornecedoresDistintos: 0,
        serie: [],
      }
    }
  }

  return (
    <HoverCard
      trigger={
        <>
          <span className="font-normal truncate" title={item?.nome}>{item?.nome ?? 'Produto'}</span>
          <Info className="size-3.5 shrink-0 text-muted-foreground/50" />
        </>
      }
    >
      <InsightProdutoCard insight={derivedInsight} />
    </HoverCard>
  )
}

