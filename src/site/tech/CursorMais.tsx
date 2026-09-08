import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useDeveAnimar } from './useReduzirMovimento'

const POINTER_FINO = '(pointer: fine)'

function pointerFino(): boolean {
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia(POINTER_FINO).matches
}

/**
 * Cursor custom que vira um "+" sobre áreas `[data-cursor="mais"]`. Fixo,
 * segue o mouse com spring. Só monta com `pointer: fine` e `useDeveAnimar()`
 * — em touch/reduced-motion simplesmente não existe (cursor nativo intocado).
 */
export function CursorMais() {
  const deveAnimar = useDeveAnimar()
  const ativo = deveAnimar && pointerFino()
  const [sobreAlvo, setSobreAlvo] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 400, damping: 40 })
  const sy = useSpring(y, { stiffness: 400, damping: 40 })

  useEffect(() => {
    if (!ativo) return

    const aoMover = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const aoEntrar = (e: PointerEvent) => {
      const alvo = e.target as Element | null
      setSobreAlvo(Boolean(alvo?.closest?.('[data-cursor="mais"]')))
    }

    window.addEventListener('pointermove', aoMover, { passive: true })
    window.addEventListener('pointerover', aoEntrar, { passive: true })
    return () => {
      window.removeEventListener('pointermove', aoMover)
      window.removeEventListener('pointerover', aoEntrar)
    }
  }, [ativo, x, y])

  if (!ativo) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden md:block"
      style={{ x: sx, y: sy }}
    >
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-all duration-200 ${
          sobreAlvo
            ? 'size-12 border-brand-mint bg-brand-mint/20 text-brand-mint'
            : 'size-5 border-foreground/40'
        }`}
      >
        <span
          className={`select-none text-2xl leading-none transition-opacity ${
            sobreAlvo ? 'opacity-100' : 'opacity-0'
          }`}
        >
          +
        </span>
      </div>
    </motion.div>
  )
}
