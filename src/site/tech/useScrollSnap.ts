import { useEffect } from 'react'
import { useDeveAnimar } from './useReduzirMovimento'

/**
 * Ativa o scroll-snap suave da home: adiciona a classe `.scroll-snap-home`
 * ao `<html>` (definida no `index.css`) enquanto a home estiver montada, e a
 * remove ao desmontar. Desligado sob `prefers-reduced-motion`/Save-Data.
 */
export function useScrollSnap() {
  const deveAnimar = useDeveAnimar()

  useEffect(() => {
    if (!deveAnimar) return
    const el = document.documentElement
    el.classList.add('scroll-snap-home')
    return () => el.classList.remove('scroll-snap-home')
  }, [deveAnimar])
}
