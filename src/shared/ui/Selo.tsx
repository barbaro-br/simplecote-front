import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export type TomSelo = 'sucesso' | 'atencao' | 'neutro' | 'info' | 'perigo'

const TONS: Record<TomSelo, string> = {
  sucesso:
    'text-[var(--pnl-acento-hi,#6fe6ac)] bg-[var(--pnl-acento,#57bf8e)]/15 ring-[var(--pnl-acento,#57bf8e)]/30',
  atencao: 'text-[var(--pnl-atencao,#e0a030)] bg-[var(--pnl-atencao,#e0a030)]/12 ring-[var(--pnl-atencao,#e0a030)]/30',
  neutro: 'text-white/60 bg-white/[0.06] ring-white/15',
  info: 'text-[var(--info,#6ab0ff)] bg-[var(--info,#6ab0ff)]/12 ring-[var(--info,#6ab0ff)]/30',
  perigo:
    'text-[var(--pnl-perigo,#ff6b6b)] bg-[var(--pnl-perigo,#ff6b6b)]/12 ring-[var(--pnl-perigo,#ff6b6b)]/30',
}

/**
 * Chip de status: cor + ícone + texto (nunca só cor). design.md §2 / §6.
 */
export function Selo({
  tom = 'neutro',
  icone: Icone,
  children,
  className,
}: {
  tom?: TomSelo
  icone?: ComponentType<{ className?: string; weight?: 'fill' | 'bold' | 'regular' }>
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset',
        TONS[tom],
        className,
      )}
    >
      {Icone && <Icone className="size-3" weight="fill" aria-hidden />}
      {children}
    </span>
  )
}
