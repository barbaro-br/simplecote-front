import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, temMatchMedia } from './gsap-scroll'
import { useDeveAnimar } from './useReduzirMovimento'

/**
 * Smooth-scroll global (Lenis) amarrado ao ticker do GSAP. É montado uma vez
 * na casca do site (`SiteChrome`) — nunca no `/admin` nem nas rotas por token.
 * Sob `prefers-reduced-motion`/Save-Data (ou sem `matchMedia`, como no jsdom)
 * vira no-op (scroll nativo).
 */
export function useSmoothScroll() {
  const deveAnimar = useDeveAnimar()

  useEffect(() => {
    if (!deveAnimar || !temMatchMedia()) return

    const lenis = new Lenis({ lerp: 0.1 })

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [deveAnimar])
}
