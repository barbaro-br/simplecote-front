import { cn } from '@/shared/lib/utils'

export type OpcaoChip = { valor: string; rotulo: string }

/**
 * Linha de pills de filtro (ramo, papel, ativo/inativo…). Controlado.
 * design.md §2.
 */
export function ChipsFiltro({
  opcoes,
  valor,
  aoTrocar,
  className,
}: {
  opcoes: OpcaoChip[]
  valor: string
  aoTrocar: (valor: string) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-1.5 border-b px-4 py-3 sm:px-5',
        'border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]',
        className,
      )}
    >
      {opcoes.map((o) => {
        const ativo = o.valor === valor
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={ativo}
            onClick={() => aoTrocar(o.valor)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pnl-acento,#57bf8e)]',
              ativo
                ? 'bg-[var(--pnl-acento,#57bf8e)]/15 text-[var(--pnl-acento-hi,#6fe6ac)] ring-1 ring-inset ring-[var(--pnl-acento,#57bf8e)]/30'
                : 'bg-white/[0.06] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))] hover:text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]',
            )}
          >
            {o.rotulo}
          </button>
        )
      })}
    </div>
  )
}
