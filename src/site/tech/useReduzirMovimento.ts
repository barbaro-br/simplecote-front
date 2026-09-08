import { useSyncExternalStore } from 'react'

const CONSULTA_REDUZIDO = '(prefers-reduced-motion: reduce)'

type ConnectionSaveData = {
  saveData?: boolean
}

function salvarDadosAtivo(): boolean {
  const nav = navigator as Navigator & { connection?: ConnectionSaveData }
  return Boolean(nav.connection?.saveData)
}

function lerReduzido(): boolean {
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia(CONSULTA_REDUZIDO).matches
}

function assinarReduzido(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {}
  const mql = window.matchMedia(CONSULTA_REDUZIDO)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/**
 * `true` quando o usuário prefere menos movimento (`prefers-reduced-motion:
 * reduce`) OU o navegador está em modo economia de dados (`Save-Data`). É a
 * fonte única que desliga as animações pesadas do site (3D, vídeo autoplay,
 * marquee, parallax) — regra do projeto. `useDeveAnimar()` é a negação.
 */
export function useReduzirMovimento(): boolean {
  const reduzido = useSyncExternalStore(assinarReduzido, lerReduzido, () => false)
  return reduzido || salvarDadosAtivo()
}

/** `true` quando é seguro animar (sem reduced-motion nem Save-Data). */
export function useDeveAnimar(): boolean {
  return !useReduzirMovimento()
}
