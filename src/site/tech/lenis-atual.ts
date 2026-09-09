import type Lenis from 'lenis'

/**
 * Ponte entre o `useSmoothScroll` (que cria a instância única do Lenis na casca
 * do site) e quem precisa dela sem props/context — hoje o `useScrollSnap` da
 * home. Como os efeitos filhos rodam antes dos do pai, o snap pode montar
 * antes do Lenis existir: por isso há `aoTrocarLenis` para re-tentar quando a
 * instância aparece (ou some, num HMR).
 */
let atual: Lenis | null = null
const ouvintes = new Set<() => void>()

export function definirLenis(instancia: Lenis | null): void {
  atual = instancia
  for (const ouvir of ouvintes) ouvir()
}

export function lenisAtual(): Lenis | null {
  return atual
}

export function aoTrocarLenis(ouvir: () => void): () => void {
  ouvintes.add(ouvir)
  return () => {
    ouvintes.delete(ouvir)
  }
}
