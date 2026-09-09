import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Número em destaque (economia, total, KPI). `inline` = par rótulo/valor num
 * rodapé de card; bloco = célula de dashboard. design.md §2.
 */
export function CampoEstat({
  rotulo,
  valor,
  sufixo,
  inline = false,
  className,
}: {
  rotulo: ReactNode
  valor: ReactNode
  sufixo?: ReactNode
  inline?: boolean
  className?: string
}) {
  return (
    <div className={cn(inline ? 'flex items-baseline gap-2' : 'space-y-0.5', className)}>
      <span className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{rotulo}</span>
      <span
        className={cn(
          'font-bold tabular-nums text-[var(--pnl-acento-hi,#6fe6ac)]',
          inline ? 'text-lg sm:text-xl' : 'block text-2xl',
        )}
      >
        {valor}
        {sufixo != null && (
          <span className="ml-1 text-xs font-normal text-[var(--pnl-txt-4,rgba(255,255,255,0.3))]">
            {sufixo}
          </span>
        )}
      </span>
    </div>
  )
}

/**
 * Rodapé de `Superficie`: faixa levemente clara, algo à esquerda (CampoEstat
 * inline ou texto) e ação à direita.
 */
export function RodapeAcao({
  esquerda,
  direita,
  className,
}: {
  esquerda: ReactNode
  direita?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-5',
        'border-[var(--pnl-borda,rgba(255,255,255,0.1))]',
        'bg-[var(--pnl-superficie-2,rgba(255,255,255,0.03))]',
        className,
      )}
    >
      <div className="min-w-0">{esquerda}</div>
      {direita != null && <div className="shrink-0">{direita}</div>}
    </div>
  )
}
