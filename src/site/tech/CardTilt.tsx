import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useDeveAnimar } from './useReduzirMovimento'

/**
 * Wrapper com tilt 3D no hover (rotateX/rotateY seguindo o mouse). Degrada pra
 * render estática sem `pointer: fine` ou sem `deveAnimar`.
 */
export function CardTilt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const deveAnimar = useDeveAnimar()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 180, damping: 18 })
  const sry = useSpring(ry, { stiffness: 180, damping: 18 })
  const rotateX = useTransform(srx, [-1, 1], ['6deg', '-6deg'])
  const rotateY = useTransform(sry, [-1, 1], ['-6deg', '6deg'])

  const aoMover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!deveAnimar) return
    if (typeof window.matchMedia === 'function' && !window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    ry.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    rx.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  const aoSair = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={aoMover}
      onPointerLeave={aoSair}
    >
      {children}
    </motion.div>
  )
}
