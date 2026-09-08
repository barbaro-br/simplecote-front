import { useSyncExternalStore } from 'react'
import hero from '@/assets/hero.png'

const CONSULTA = '(prefers-reduced-motion: reduce)'

function assinar(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {}
  const mql = window.matchMedia(CONSULTA)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function ler(): boolean {
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia(CONSULTA).matches
}

/**
 * Vídeo de marca do hero: autoplay, mudo, loop e `playsinline`, com `poster`
 * estático sempre presente. Com `prefers-reduced-motion: reduce`, não dá play
 * (só o poster).
 */
export function HeroVideo() {
  const reduzirMovimento = useSyncExternalStore(assinar, ler)

  return (
    <video
      className="h-full w-full object-cover"
      src="/midia/animacao-marca.mp4"
      poster={hero}
      muted
      loop
      playsInline
      autoPlay={!reduzirMovimento}
      aria-hidden="true"
    />
  )
}
