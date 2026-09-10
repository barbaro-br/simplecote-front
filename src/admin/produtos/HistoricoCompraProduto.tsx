import { Link } from 'react-router-dom'
import { TrendDown, TrendUp, Minus } from '@phosphor-icons/react'
import { moeda, dataBr } from '@/shared/format/formatters'
import { Sparkline } from '@/admin/analise/Sparkline'
import type { InsightProduto } from '@/admin/analise/analise.schema'

/**
 * Corpo do modal "Histórico de compras" do catálogo. Usa os mesmos dados do
 * `InsightProdutoCard` (popover da grade ao vivo), mas com layout de painel —
 * o `Dialog` já é a superfície, então aqui não tem card/borda/sombra própria.
 */
export function HistoricoCompraProduto({ insight }: { insight: InsightProduto | null | 'erro' }) {
  if (insight === 'erro') {
    return (
      <p className="text-sm text-[var(--pnl-perigo,#ff6b6b)]" data-testid="insight-produto-erro">
        Não foi possível carregar o histórico deste produto.
      </p>
    )
  }

  if (insight === null || !insight.ultimaCompra) {
    return (
      <p className="text-sm text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]" data-testid="insight-produto-vazio">
        Este produto ainda não foi comprado em nenhuma cotação apurada.
      </p>
    )
  }

  const { ultimaCompra: uc } = insight
  const variacao = insight.variacaoPct
  const subiu = variacao !== null && variacao > 0
  const desceu = variacao !== null && variacao < 0

  const stats: { rotulo: string; valor: string }[] = [
    { rotulo: 'Menor preço', valor: insight.menorPrecoUnitario !== null ? moeda(insight.menorPrecoUnitario) : '—' },
    { rotulo: 'Média 90 dias', valor: insight.precoMedioUnitario90d !== null ? moeda(insight.precoMedioUnitario90d) : '—' },
    { rotulo: 'Vezes comprado', valor: String(insight.compras ?? '—') },
    { rotulo: 'Fornecedores', valor: String(insight.fornecedoresDistintos ?? '—') },
  ]

  return (
    <div className="space-y-4" data-testid="insight-produto-card">
      {/* Última compra */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            Última compra
          </div>
          <div className="mt-0.5 text-2xl font-bold tabular-nums text-[var(--pnl-txt,#fff)]">
            {moeda(uc.precoUnitario)}
            <span className="ml-1 text-xs font-normal text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">/ un</span>
          </div>
          <div className="mt-0.5 text-[13px] text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
            {dataBr(uc.data)}
          </div>
        </div>
        <span
          data-testid="badge-variacao"
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
            subiu
              ? 'bg-[var(--pnl-perigo,#ff6b6b)]/12 text-[var(--pnl-perigo,#ff6b6b)] ring-[var(--pnl-perigo,#ff6b6b)]/30'
              : desceu
                ? 'bg-[var(--pnl-acento,#57bf8e)]/15 text-[var(--pnl-acento-hi,#6fe6ac)] ring-[var(--pnl-acento,#57bf8e)]/30'
                : 'bg-white/[0.06] text-[var(--pnl-txt-2,rgba(255,255,255,0.7))] ring-white/15'
          }`}
        >
          {subiu ? <TrendUp className="size-3" weight="bold" /> : desceu ? <TrendDown className="size-3" weight="bold" /> : <Minus className="size-3" />}
          {variacao !== null ? `${Math.abs(variacao).toFixed(1)}%` : '—'}
        </span>
      </div>

      <p className="text-[13px] text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
        Comprado de <span className="font-semibold text-[var(--pnl-txt,#fff)]">{uc.empresa}</span>
        {uc.representante && ` · ${uc.representante}`} · {uc.quantidade} un
      </p>

      {/* Números */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.rotulo} className="rounded-lg bg-white/[0.04] px-3 py-2">
            <div className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{s.rotulo}</div>
            <div className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--pnl-txt,#fff)]">{s.valor}</div>
          </div>
        ))}
      </div>

      {insight.serie && insight.serie.length > 1 && (
        <div className="rounded-lg bg-white/[0.04] px-3 py-2.5">
          <div className="mb-1 text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            Preço unitário ao longo das compras
          </div>
          <div className="flex justify-center text-[var(--pnl-acento-hi,#6fe6ac)]" data-testid="container-sparkline">
            <Sparkline pontos={insight.serie.map((p) => p.precoUnitario)} w={280} h={48} />
          </div>
        </div>
      )}

      {uc.cotacaoId && (
        <Link
          to={`/admin/cotacoes/${uc.cotacaoId}/resultado`}
          className="block text-center text-[13px] font-medium text-[var(--pnl-acento-hi,#6fe6ac)] hover:underline"
        >
          Ver a cotação dessa compra
        </Link>
      )}
    </div>
  )
}
