import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Card base do painel escuro (change redesign-painel-dark, design.md §2).
 * Superfície navy, borda e ring sutis, cantos 2xl. Os `var(--pnl-*)` têm
 * fallback pros tokens `--brand-*`, então o componente funciona mesmo fora
 * de um wrapper `[data-painel="dark"]` (ex.: nas telas de demo da landing).
 */
export function Superficie({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]',
        'border-[var(--pnl-borda,rgba(255,255,255,0.1))]',
        'bg-[var(--pnl-superficie,#12263f)]',
        'ring-1 ring-inset ring-[var(--pnl-ring,rgba(255,255,255,0.06))]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
