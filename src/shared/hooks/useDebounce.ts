import { useEffect, useState } from 'react'

/**
 * Devolve `value` com atraso: só reflete o valor mais recente depois de `ms`
 * sem nenhuma mudança nova. Base do autosave da tela do representante (spec.md §10.2).
 */
export function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])

  return debounced
}
