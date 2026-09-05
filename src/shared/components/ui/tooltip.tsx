import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type Props = {
  content: ReactNode
  /** Atraso em ms antes de o tooltip aparecer (hover pausado). Padrão: 300. */
  delay?: number
  /** Lado do alvo em que o balão aparece. Padrão: 'top'. */
  side?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode
}

/**
 * Tooltip leve (sem lib): balão com fade-in via CSS nativo (`fade-in` do
 * index.css, respeita prefers-reduced-motion) + atraso configurável.
 * Aparece no hover e no foco (teclado), some no leave/blur.
 */
export function Tooltip({ content, delay = 300, side = 'top', children }: Props) {
  const [visivel, setVisivel] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function mostrar() {
    timer.current = setTimeout(() => setVisivel(true), delay)
  }

  function esconder() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setVisivel(false)
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={mostrar}
      onMouseLeave={esconder}
      onFocus={mostrar}
      onBlur={esconder}
    >
      {children}
      {visivel && (
        <span
          role="tooltip"
          className={cn(
            'fade-in pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-md',
            side === 'top' && 'bottom-full left-1/2 mb-1 -translate-x-1/2',
            side === 'bottom' && 'top-full left-1/2 mt-1 -translate-x-1/2',
            side === 'left' && 'right-full top-1/2 mr-1 -translate-y-1/2',
            side === 'right' && 'left-full top-1/2 ml-1 -translate-y-1/2',
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
