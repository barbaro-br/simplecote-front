import { render, screen, waitFor } from '@testing-library/react'
import { vi, expect, test, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { definirCompradorTag, limparCompradorTag } from '@/shared/observability/sentry'
import userEvent from '@testing-library/user-event'

vi.mock('@/shared/observability/sentry', () => ({
  definirCompradorTag: vi.fn(),
  limparCompradorTag: vi.fn(),
}))

function jwt(claims: Record<string, unknown>): string {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

function Sonda() {
  const { logout } = useAuth()
  return <button onClick={() => logout()}>sair</button>
}

beforeEach(() => {
  vi.mocked(definirCompradorTag).mockClear()
  vi.mocked(limparCompradorTag).mockClear()
})

test('sessão restaurada seta a tag com o compradorId; logout limpa', async () => {
  server.use(
    http.post('*/api/auth/refresh', () =>
      HttpResponse.json({ token: jwt({ papel: 'ADMIN', compradorId: 'c1', slug: 'loja-1' }) })
    )
  )
  const user = userEvent.setup()
  render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>
  )

  await waitFor(() => expect(definirCompradorTag).toHaveBeenCalledWith('c1'))
  // a tag é o id técnico, nunca o slug
  expect(definirCompradorTag).not.toHaveBeenCalledWith('loja-1')

  await user.click(screen.getByRole('button', { name: 'sair' }))

  await waitFor(() => expect(limparCompradorTag).toHaveBeenCalled())
})

test('sem sessão não seta a tag de comprador', async () => {
  render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>
  )

  await waitFor(() => expect(limparCompradorTag).toHaveBeenCalled())
  expect(definirCompradorTag).not.toHaveBeenCalled()
})
