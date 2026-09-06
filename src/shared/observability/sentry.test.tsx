import { render, screen } from '@testing-library/react'
import { vi, expect, test } from 'vitest'
import * as Sentry from '@sentry/react'
import { iniciarSentry } from './sentry'
import { FallbackErro } from './FallbackErro'

// Mantém o `ErrorBoundary` real (testado abaixo) e substitui apenas `init`,
// para o teste do `iniciarSentry` conseguir espiar a inicialização.
vi.mock('@sentry/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sentry/react')>()
  return { ...actual, init: vi.fn() }
})

test('iniciarSentry sem VITE_SENTRY_DSN não chama Sentry.init', () => {
  iniciarSentry()
  expect(Sentry.init).not.toHaveBeenCalled()
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
