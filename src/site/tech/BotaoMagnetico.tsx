import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

const RAIO = 24

/**
 * Wrapper que atrai o filho na direção do mouse (translate com spring, raio
 * limitado a `RAIO` px). Degrada pra render normal sem `pointer: fine` — os
 * estilos de `motion` simplesmente não são aplicados.
 */
export function BotaoMagnetico({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15 })
  const sy = useSpring(y, { stiffness: 200, damping: 15 })

  const aoMover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (typeof window.matchMedia === 'function' && !window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const dist = Math.hypot(dx, dy)
    const fator = Math.min(1, RAIO / (dist || 1))
    x.set(dx * fator * 0.4)
    y.set(dy * fator * 0.4)
  }

  const aoSair = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={aoMover}
      onPointerLeave={aoSair}
    >
      {children}
    </motion.div>
  )
}
