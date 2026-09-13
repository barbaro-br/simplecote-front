import { act, renderHook } from '@testing-library/react'
import { useAtrasarIndicador } from './useAtrasarIndicador'

test('não mostra se "ativo" desliga antes do atraso (evita flicker em respostas rápidas)', () => {
  vi.useFakeTimers()
  try {
    const { result, rerender } = renderHook(({ ativo }) => useAtrasarIndicador(ativo, 150), {
      initialProps: { ativo: true },
    })
    expect(result.current).toBe(false)

    act(() => vi.advanceTimersByTime(100))
    rerender({ ativo: false })
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe(false)
  } finally {
    vi.useRealTimers()
  }
})

test('mostra depois do atraso se "ativo" continuar true', () => {
  vi.useFakeTimers()
  try {
    const { result, rerender } = renderHook(({ ativo }) => useAtrasarIndicador(ativo, 150), {
      initialProps: { ativo: true },
    })

    act(() => vi.advanceTimersByTime(149))
    expect(result.current).toBe(false)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(true)

    rerender({ ativo: false })
    expect(result.current).toBe(false)
  } finally {
    vi.useRealTimers()
  }
})
