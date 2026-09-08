import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, expect, test, afterEach } from 'vitest'
import { HomePage } from './HomePage'
import { PLANOS } from './planos'

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )
}

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

afterEach(() => {
  vi.restoreAllMocks()
})

test('hero tem os CTAs "Criar conta" e "Entrar"', () => {
  renderHome()

  expect(screen.getAllByRole('link', { name: 'Criar conta' }).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('link', { name: 'Entrar' }).length).toBeGreaterThan(0)
})

test('o vídeo do hero tem muted, loop, playsinline e um poster', () => {
  const { container } = renderHome()

  const video = container.querySelector('video[poster]') as HTMLVideoElement
  expect(video).not.toBeNull()
  expect(video.muted).toBe(true)
  expect(video.loop).toBe(true)
  expect(video.playsInline).toBe(true)
  expect(video.poster).toBeTruthy()
})

test('a seção de planos lista os planos de planos.ts e tem link para /precos', () => {
  renderHome()

  for (const plano of PLANOS) {
    expect(screen.getAllByText(plano.nome).length).toBeGreaterThan(0)
  }
  expect(screen.getByRole('link', { name: /Ver todos os planos/i })).toHaveAttribute('href', '/precos')
})

test('prefers-reduced-motion: reduce → o vídeo do hero não dá play', async () => {
  mockMatchMedia(true)
  const { container } = renderHome()

  const video = container.querySelector('video[poster]') as HTMLVideoElement
  await waitFor(() => expect(video.autoplay).toBe(false))
})
