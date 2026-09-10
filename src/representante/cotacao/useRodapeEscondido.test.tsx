import { renderHook, act } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { useRodapeEscondido } from './useRodapeEscondido'

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function campoPreco(): HTMLInputElement {
  const el = document.createElement('input')
  el.id = 'preco-item-1'
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
  window.scrollY = 0
})

test('desktop (matchMedia não bate) → sempre false, ignora foco e rolagem', () => {
  stubMatchMedia(false)
  const { result } = renderHook(() => useRodapeEscondido())
  expect(result.current).toBe(false)

  const input = campoPreco()
  act(() => {
    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
  })
  expect(result.current).toBe(false)
})

test('mobile: esconde enquanto um campo de preço está focado', () => {
  stubMatchMedia(true)
  const input = campoPreco()
  const { result } = renderHook(() => useRodapeEscondido())
  expect(result.current).toBe(false)

  act(() => {
    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
  })
  expect(result.current).toBe(true)

  act(() => {
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
  })
  expect(result.current).toBe(false)
})

test('mobile: esconde ao rolar para baixo, volta ao rolar para cima', () => {
  stubMatchMedia(true)
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0)
    return 0
  })
  // página alta o suficiente pra "perto do fim" não disparar
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(5000)

  const { result } = renderHook(() => useRodapeEscondido())

  act(() => {
    window.scrollY = 400
    window.dispatchEvent(new Event('scroll'))
  })
  expect(result.current).toBe(true)

  act(() => {
    window.scrollY = 100
    window.dispatchEvent(new Event('scroll'))
  })
  expect(result.current).toBe(false)
})
