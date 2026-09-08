import { useSyncExternalStore } from 'react'

const MD = '(min-width: 768px)'

function lerLarga(): boolean {
  if (typeof window.matchMedia === 'function') return window.matchMedia(MD).matches
  return typeof window.innerWidth === 'number' && window.innerWidth >= 768
}

function assinarLarga(onChange: () => void): () => void {
  if (typeof window.matchMedia === 'function') {
    const mql = window.matchMedia(MD)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

/**
 * `true` quando o viewport está em `md` (≥768px) ou acima. Usa `matchMedia`
 * com fallback a `window.innerWidth` (jsdom não implementa matchMedia).
 */
export function useViewportLarga(): boolean {
  return useSyncExternalStore(assinarLarga, lerLarga, () => false)
}
