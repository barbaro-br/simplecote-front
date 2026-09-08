import { useEffect, useRef } from 'react'

/**
 * Revela uma seção quando ela entra na viewport: adiciona a classe `revelado`
 * ao elemento (que o CSS usa para a transição de entrada). No-op quando o
 * usuário prefere `prefers-reduced-motion: reduce` — o CSS (media query) já
 * mantém a seção visível sem animação.
 */
export function useRevelarAoRolar<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Sem IntersectionObserver (teste/jsdom) ou com `prefers-reduced-motion`,
    // o hook é no-op — o CSS mantém a seção visível sem animação.
    if (
      typeof IntersectionObserver === 'undefined' ||
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revelado')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
