import { useEffect } from 'react'
import Snap from 'lenis/snap'
import { temMatchMedia } from './gsap-scroll'
import { useDeveAnimar } from './useReduzirMovimento'
import { aoTrocarLenis, lenisAtual } from './lenis-atual'

/**
 * Paginação por seção da home: cada gesto de scroll assenta numa seção de tela
 * cheia (as `.snap-start` da `HomePage`). Usa `lenis/snap` (mesmo autor do
 * Lenis) em vez de `scroll-snap` do CSS — o CSS `proximity` + `scroll-behavior:
 * smooth` brigavam com o Lenis e davam o tranco. Agora há uma única autoridade
 * de animação: o Lenis assenta na próxima seção com easing curto.
 *
 * Desligado sob `prefers-reduced-motion`/Save-Data (scroll nativo). `mandatory`
 * dá o "pulo" pedido; se seções longas em telas estreitas incomodarem, trocar
 * para `proximity` + `distanceThreshold`.
 */
export function useScrollSnap() {
  const deveAnimar = useDeveAnimar()

  useEffect(() => {
    if (!deveAnimar || !temMatchMedia()) return

    let snap: Snap | null = null

    const montar = () => {
      if (snap) return
      const lenis = lenisAtual()
      if (!lenis) return
      const secoes = Array.from(
        document.querySelectorAll<HTMLElement>('.snap-start'),
      )
      if (secoes.length < 2) return

      snap = new Snap(lenis, {
        type: 'mandatory',
        duration: 0.6,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      })
      for (const secao of secoes) snap.addElement(secao, { align: 'start' })
    }

    montar()
    const desassinar = aoTrocarLenis(() => {
      // Lenis sumiu (unmount da casca / HMR) → derruba o snap atual.
      if (!lenisAtual()) {
        try {
          snap?.destroy()
        } catch {
          /* Lenis já destruído */
        }
        snap = null
        return
      }
      montar()
    })

    return () => {
      desassinar()
      try {
        snap?.destroy()
      } catch {
        /* Lenis já destruído */
      }
      snap = null
    }
  }, [deveAnimar])
}
