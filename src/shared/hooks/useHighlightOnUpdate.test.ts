import { act, renderHook } from '@testing-library/react'
import { useHighlightOnUpdate } from './useHighlightOnUpdate'

test('primeira renderização não dispara o pulso', () => {
  vi.useFakeTimers()
  try {
    const { result } = renderHook(({ v }) => useHighlightOnUpdate(v, 800), {
      initialProps: { v: 100 },
    })
    expect(result.current).toBe(false)
  } finally {
    vi.useRealTimers()
  }
})

test('valor igual não dispara; valor novo liga e desliga após o intervalo', () => {
  vi.useFakeTimers()
  try {
    const { result, rerender } = renderHook(({ v }) => useHighlightOnUpdate(v, 800), {
      initialProps: { v: 100 },
    })

    rerender({ v: 100 })
    expect(result.current).toBe(false)

    rerender({ v: 110 })
    expect(result.current).toBe(true)

    act(() => vi.advanceTimersByTime(799))
    expect(result.current).toBe(true)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(false)
  } finally {
    vi.useRealTimers()
  }
})

test('mudança durante o pulso reinicia o timer (pulso estendido, sem piscar duplo)', () => {
  vi.useFakeTimers()
  try {
    const { result, rerender } = renderHook(({ v }) => useHighlightOnUpdate(v, 800), {
      initialProps: { v: 100 },
    })

    rerender({ v: 110 })
    act(() => vi.advanceTimersByTime(500))
    rerender({ v: 120 })
    expect(result.current).toBe(true)

    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe(true) // ainda dentro do segundo pulso

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(false)
  } finally {
    vi.useRealTimers()
  }
})

test('null → valor dispara; valor → null também (célula deixou de ser cotada)', () => {
  vi.useFakeTimers()
  try {
    const { result, rerender } = renderHook(({ v }) => useHighlightOnUpdate(v, 800), {
      initialProps: { v: null as number | null },
    })

    rerender({ v: 50 })
    expect(result.current).toBe(true)
    act(() => vi.advanceTimersByTime(800))

    rerender({ v: null })
    expect(result.current).toBe(true)
    act(() => vi.advanceTimersByTime(800))
    expect(result.current).toBe(false)
  } finally {
    vi.useRealTimers()
  }
})
