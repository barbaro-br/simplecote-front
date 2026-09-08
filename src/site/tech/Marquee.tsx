import type { ReactNode } from 'react'
import { useDeveAnimar } from './useReduzirMovimento'

/**
 * Faixa infinita (marquee) via CSS animation; estática sob reduced-motion
 * (o conteúdo é duplicado para o loop, e a animação é desligada). O wrapper
 * externo deve ter `overflow-hidden`.
 */
export function Marquee({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const deveAnimar = useDeveAnimar()

  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      <div className={`flex w-max ${deveAnimar ? 'marquee-track' : ''}`}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
