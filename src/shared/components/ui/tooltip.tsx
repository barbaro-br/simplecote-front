import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/utils'

type Props = {
  content: ReactNode
  /** Atraso em ms antes de o tooltip aparecer (hover pausado). Padrão: 300. */
  delay?: number
  /** Lado do alvo em que o balão aparece. Padrão: 'top'. */
  side?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode
}

const MARGEM = 6

/**
 * Tooltip leve (sem lib): balão com fade-in via CSS nativo (`fade-in` do
 * index.css, respeita prefers-reduced-motion) + atraso configurável.
 * Aparece no hover e no foco (teclado), some no leave/blur.
 *
 * Renderiza via portal em `document.body` com `position: fixed` (calculado
 * do `getBoundingClientRect` do gatilho) em vez de `absolute` dentro do
 * próprio fluxo: um balão `absolute` com texto longo (`whitespace-nowrap`)
 * estourava a largura de containers com `overflow-x-auto` (ex.: tabelas),
 * criando um scroll horizontal fantasma só de passar o mouse.
 */
export function Tooltip({ content, delay = 100, side = 'top', children }: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gatilhoRef = useRef<HTMLSpanElement>(null)

  function calcularPosicao() {
    const r = gatilhoRef.current?.getBoundingClientRect()
    if (!r) return null
    switch (side) {
      case 'bottom':
        return { top: r.bottom + MARGEM, left: r.left + r.width / 2 }
      case 'left':
        return { top: r.top + r.height / 2, left: r.left - MARGEM }
      case 'right':
        return { top: r.top + r.height / 2, left: r.right + MARGEM }
      default:
        return { top: r.top - MARGEM, left: r.left + r.width / 2 }
    }
  }

  function mostrar() {
    timer.current = setTimeout(() => setPos(calcularPosicao()), delay)
  }

  function esconder() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setPos(null)
  }

  const transformPorLado: Record<NonNullable<Props['side']>, string> = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)',
  }

  return (
    <span ref={gatilhoRef} className="relative inline-flex" onMouseEnter={mostrar} onMouseLeave={esconder} onFocus={mostrar} onBlur={esconder}>
      {children}
      {pos &&
        createPortal(
          <span
            role="tooltip"
            style={{ position: 'fixed', top: pos.top, left: pos.left, transform: transformPorLado[side] }}
            className={cn(
              'fade-in pointer-events-none z-50 whitespace-nowrap rounded-lg bg-[#1a231d] text-[#e1e9e3] border border-white/20 px-2.5 py-1 text-[11.5px] font-medium shadow-2xl backdrop-blur-md',
            )}
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  )
}
