import { renderHook } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { useDeveAnimar, useReduzirMovimento } from './useReduzirMovimento'

function mockMatchMedia(reduzir: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reduzir : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

function mockSaveData(valor: boolean | undefined) {
  Object.defineProperty(navigator, 'connection', {
    writable: true,
    configurable: true,
    value: valor === undefined ? undefined : { saveData: valor },
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

test('sem reduce e sem saveData → pode animar', () => {
  mockMatchMedia(false)
  mockSaveData(false)

  const { result } = renderHook(() => useReduzirMovimento())

  expect(result.current).toBe(false)
})

test('prefers-reduced-motion: reduce → reduz movimento', () => {
  mockMatchMedia(true)
  mockSaveData(false)

  const { result } = renderHook(() => useReduzirMovimento())

  expect(result.current).toBe(true)
})

test('saveData → reduz movimento', () => {
  mockMatchMedia(false)
  mockSaveData(true)

  const { result } = renderHook(() => useReduzirMovimento())

  expect(result.current).toBe(true)
})

test('useDeveAnimar é a negação de useReduzirMovimento', () => {
  mockMatchMedia(true)
  mockSaveData(false)

  const { result } = renderHook(() => useDeveAnimar())

  expect(result.current).toBe(false)
})
