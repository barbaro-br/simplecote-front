import { act, renderHook } from '@testing-library/react'
import { useDebounce } from './useDebounce'

test('só reflete o valor após o intervalo sem novas mudanças', () => {
  vi.useFakeTimers()
  try {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 800), {
      initialProps: { v: 'a' },
    })
    expect(result.current).toBe('a')

    rerender({ v: 'b' })
    expect(result.current).toBe('a') // ainda não passou o tempo

    act(() => vi.advanceTimersByTime(799))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('b')
  } finally {
    vi.useRealTimers()
  }
})

test('mudanças em sequência reiniciam o timer (só o último valor assenta)', () => {
  vi.useFakeTimers()
  try {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 800), {
      initialProps: { v: '1' },
    })

    rerender({ v: '2' })
    act(() => vi.advanceTimersByTime(500))
    rerender({ v: '3' })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe('1') // nenhum assentou ainda

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('3')
  } finally {
    vi.useRealTimers()
  }
})
