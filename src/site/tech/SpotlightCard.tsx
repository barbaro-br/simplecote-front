import { useRef, type ReactNode } from 'react'
import { useDeveAnimar } from './useReduzirMovimento'

/**
 * Card com brilho radial (`radial-gradient`) que segue o mouse, sob
 * `backdrop-blur`. As variáveis `--spot-x`/`--spot-y` (0..100%) são definidas
 * no `mousemove` e consumidas pelo CSS inline. Sem `deveAnimar` vira card
 * estático (sem o brilho).
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const deveAnimar = useDeveAnimar()

  const aoMover = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onPointerMove={deveAnimar ? aoMover : undefined}
      className={`group relative overflow-hidden rounded-2xl border bg-background/60 backdrop-blur-sm ${className ?? ''}`}
    >
      {deveAnimar && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--brand-mint) 18%, transparent), transparent 70%)',
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}
