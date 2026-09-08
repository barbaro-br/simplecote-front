import type { ReactNode } from 'react'
import { useDeveAnimar } from './useReduzirMovimento'

/**
 * Texto com `background-clip: text` navy→mint e shimmer opcional. O shimmer só
 * liga com `deveAnimar`.
 */
export function TextoGradiente({
  children,
  className,
  shimmer = false,
}: {
  children: ReactNode
  className?: string
  shimmer?: boolean
}) {
  const deveAnimar = useDeveAnimar()

  return (
    <span
      className={`bg-clip-text text-transparent ${
        shimmer && deveAnimar ? 'texto-gradiente-shimmer' : ''
      } ${className ?? ''}`}
      style={{
        backgroundImage:
          'linear-gradient(100deg, var(--brand-navy) 0%, var(--brand-mint) 60%, var(--brand-mint-bright) 100%)',
      }}
    >
      {children}
    </span>
  )
}
