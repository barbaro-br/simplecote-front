import { useEffect, useRef, useState } from 'react'

/**
 * Observa `value` e devolve `true` temporariamente (por `ms`, padrão 800ms)
 * toda vez que o valor muda em relação à renderização anterior. Base do
 * flash de destaque nas células de preço da Grade ao Vivo (change
 * melhoria-ux-performance-grid): a classe de highlight é aplicada durante o
 * pulso e removida suavemente via `transition-colors` no elemento.
 *
 * A primeira renderização NÃO dispara o pulso (não há "anterior" ainda).
 */
export function useHighlightOnUpdate<T>(value: T, ms = 800): boolean {
  const [destacado, setDestacado] = useState(false)
  const anterior = useRef<T>(value)
  const primeiro = useRef(true)

  useEffect(() => {
    if (primeiro.current) {
      primeiro.current = false
      anterior.current = value
      return
    }
    if (value === anterior.current) return

    anterior.current = value
    setDestacado(true)
    const id = setTimeout(() => setDestacado(false), ms)
    return () => clearTimeout(id)
  }, [value, ms])

  return destacado
}
