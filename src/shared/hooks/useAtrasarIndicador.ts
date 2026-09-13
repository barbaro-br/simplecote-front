import { useEffect, useState } from 'react'

/**
 * Só liga depois de `atrasoMs` com `ativo` contínuo — evita "flicker" de
 * spinner em respostas rápidas (uma busca que resolve antes do atraso nunca
 * chega a mostrar nada). Desliga imediatamente quando `ativo` vira false.
 */
export function useAtrasarIndicador(ativo: boolean, atrasoMs = 150): boolean {
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    if (!ativo) return undefined
    const id = window.setTimeout(() => setMostrar(true), atrasoMs)
    // Desliga na limpeza (não no corpo do effect): cobre tanto "ativo virou
    // false" quanto "atrasoMs mudou no meio do caminho" — sem chamar setState
    // sincronamente no corpo do effect.
    return () => {
      window.clearTimeout(id)
      setMostrar(false)
    }
  }, [ativo, atrasoMs])

  return mostrar
}
