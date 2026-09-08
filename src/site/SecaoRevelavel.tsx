import type { ReactNode } from 'react'
import { useRevelarAoRolar } from './useRevelarAoRolar'

/**
 * Wrapper de seção com animação de entrada ao rolar (via `useRevelarAoRolar`).
 * A classe `secao-revelavel` (definida no `index.css`) começa com opacidade 0 e
 * faz a transição para `.revelado`; `prefers-reduced-motion` desliga tudo.
 */
export function SecaoRevelavel({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRevelarAoRolar<HTMLDivElement>()
  return (
    <div ref={ref} className={`secao-revelavel ${className ?? ''}`}>
      {children}
    </div>
  )
}
