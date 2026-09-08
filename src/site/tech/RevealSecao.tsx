import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, temMatchMedia } from './gsap-scroll'
import { useDeveAnimar } from './useReduzirMovimento'

/**
 * Reveal de seção via GSAP + ScrollTrigger: itens marcados com `data-reveal`
 * entram com fade + translate (stagger). Substitui `SecaoRevelavel`/
 * `useRevelarAoRolar`. Sem `deveAnimar`, os itens ficam visíveis sem animação.
 */
export function RevealSecao({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const deveAnimar = useDeveAnimar()

  useEffect(() => {
    if (!deveAnimar || !temMatchMedia()) return
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const itens = el.querySelectorAll('[data-reveal]')
      gsap.from(itens, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 80%' },
      })
    }, el)

    return () => ctx.revert()
  }, [deveAnimar])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
