import { render, screen } from '@testing-library/react'
import { afterEach, vi, expect, test } from 'vitest'
import * as Sentry from '@sentry/react'
import { iniciarSentry, definirCompradorTag, limparCompradorTag } from './sentry'
import { FallbackErro } from './FallbackErro'

// Mantém o `ErrorBoundary` real (testado abaixo) e substitui apenas `init`,
// para o teste do `iniciarSentry` conseguir espiar a inicialização.
vi.mock('@sentry/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sentry/react')>()
  return { ...actual, init: vi.fn() }
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.mocked(Sentry.init).mockClear()
})

test('iniciarSentry sem VITE_SENTRY_DSN não chama Sentry.init', () => {
  vi.stubEnv('VITE_SENTRY_DSN', '')
  iniciarSentry()
  expect(Sentry.init).not.toHaveBeenCalled()
})

test('iniciarSentry com VITE_SENTRY_DSN chama Sentry.init com o dsn', () => {
  vi.stubEnv('VITE_SENTRY_DSN', 'https://exemplo@o0.ingest.sentry.io/1')
  iniciarSentry()
  expect(Sentry.init).toHaveBeenCalledWith(
    expect.objectContaining({ dsn: 'https://exemplo@o0.ingest.sentry.io/1' }),
  )
})

test('definirCompradorTag seta a tag "comprador" com o id técnico', () => {
  const spy = vi.spyOn(Sentry, 'setTag')
  definirCompradorTag('comprador-id-123')
  expect(spy).toHaveBeenCalledWith('comprador', 'comprador-id-123')
  spy.mockRestore()
})

test('limparCompradorTag limpa a tag "comprador"', () => {
  const spy = vi.spyOn(Sentry, 'setTag')
  limparCompradorTag()
  expect(spy).toHaveBeenCalledWith('comprador', '')
  spy.mockRestore()
})

function FilhoQueLanca(): never {
  throw new Error('boom')
}

test('error boundary renderiza o fallback pt-BR e dispara a captura', () => {
  const beforeCapture = vi.fn()
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  render(
    <Sentry.ErrorBoundary fallback={<FallbackErro />} beforeCapture={beforeCapture}>
      <FilhoQueLanca />
    </Sentry.ErrorBoundary>,
  )

  expect(screen.getByText(/Algo quebrou nesta tela/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument()
  expect(beforeCapture).toHaveBeenCalledTimes(1)

  consoleError.mockRestore()
})
