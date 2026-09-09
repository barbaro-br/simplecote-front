import { Trophy } from '@phosphor-icons/react'
import { moeda } from '@/shared/format/formatters'
import { TelaCard } from './TelaCard'

// Fechamento de uma cotação: o vencedor de cada item e o quanto ele cobriu do
// segundo colocado. Fictício.
const ITENS: { item: string; vencedor: string; preco: number; economia: number }[] = [
  { item: 'Arroz tipo 1', vencedor: 'Meridiano', preco: 152.4, economia: 21.6 },
  { item: 'Feijão carioca', vencedor: 'Litoral', preco: 74.2, economia: 7.8 },
  { item: 'Óleo de soja', vencedor: 'Meridiano', preco: 128.9, economia: 13.1 },
  { item: 'Açúcar refinado', vencedor: 'Aurora', preco: 49.6, economia: 6.9 },
  { item: 'Café torrado', vencedor: 'Litoral', preco: 138.4, economia: 20.6 },
]

export function ResultadoDemo() {
  const total = ITENS.reduce((s, i) => s + i.economia, 0)

  return (
    <TelaCard titulo="Resultado da cotação">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[11px] text-white/50 sm:px-5">
        <span>Vencedor de cada item</span>
        <span className="text-white/70">5 itens · 3 fornecedores</span>
      </div>

      <ul className="divide-y divide-white/[0.07]">
        {ITENS.map(({ item, vencedor, preco, economia }) => (
          <li key={item} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-white">{item}</div>
              <div className="flex items-center gap-1 text-[11px] text-white/45">
                <Trophy className="size-3 text-brand-mint" weight="fill" aria-hidden />
                {vencedor}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-semibold text-white tabular-nums">{moeda(preco)}</div>
              <div className="text-[11px] font-medium text-brand-mint-bright tabular-nums">
                −{moeda(economia)}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.03] px-4 py-3 sm:px-5">
        <div>
          <div className="text-[11px] text-white/50">Economia total nesta cotação</div>
          <div className="text-lg font-bold text-brand-mint-bright tabular-nums">{moeda(total)}</div>
        </div>
        <span className="rounded-lg bg-brand-mint px-3 py-1.5 text-xs font-semibold text-brand-navy-deep">
          Gerar pedidos
        </span>
      </div>
    </TelaCard>
  )
}
