import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

/** `true` quando `window.matchMedia` existe (navegador real; ausente no jsdom). */
export function temMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

/**
 * Registro seguro do GSAP para o site. O `ScrollTrigger` chama `matchMedia`
 * no `registerPlugin` — que o jsdom (testes) não implementa. Aqui o registro
 * só acontece quando `window.matchMedia` existe; nos testes os plugins ficam
 * desligados e os componentes caem no fallback estático (sem lançar).
 */
if (temMatchMedia()) {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

export { gsap, ScrollTrigger, SplitText }
