import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

function Sonda() {
  const { token, isAutenticado, carregando, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="autenticado">{isAutenticado ? 'sim' : 'nao'}</span>
      <span data-testid="carregando">{carregando ? 'sim' : 'nao'}</span>
      <span data-testid="token">{token ?? ''}</span>
      <button onClick={() => login('admin@simplecote.com', 'senha123')}>entrar</button>
      <button onClick={() => logout()}>sair</button>
    </div>
  )
}

function renderComProvider() {
  return render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>
  )
}

test('boot com refresh ok restaura a sessão sem passar pelo login', async () => {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-refresh' })))

  renderComProvider()

  expect(screen.getByTestId('carregando')).toHaveTextContent('sim')

  await waitFor(() => {
    expect(screen.getByTestId('carregando')).toHaveTextContent('nao')
  })
  expect(screen.getByTestId('autenticado')).toHaveTextContent('sim')
  expect(screen.getByTestId('token')).toHaveTextContent('jwt-refresh')
})

test('boot sem cookie de refresh → estado deslogado após carregando', async () => {
  // default handler em setupTests.ts: refresh → 401 (sem cookie)
  renderComProvider()

  await waitFor(() => {
    expect(screen.getByTestId('carregando')).toHaveTextContent('nao')
  })
  expect(screen.getByTestId('autenticado')).toHaveTextContent('nao')
  expect(screen.getByTestId('token')).toHaveTextContent('')
})

test('login() guarda o access token em memória e liga isAutenticado', async () => {
  server.use(http.post('*/api/auth/login', () => HttpResponse.json({ token: 'jwt-x' })))
  const user = userEvent.setup()

  renderComProvider()
  await waitFor(() => {
    expect(screen.getByTestId('carregando')).toHaveTextContent('nao')
  })
  expect(screen.getByTestId('autenticado')).toHaveTextContent('nao')

  await user.click(screen.getByRole('button', { name: 'entrar' }))

  await waitFor(() => {
    expect(screen.getByTestId('autenticado')).toHaveTextContent('sim')
  })
  expect(screen.getByTestId('token')).toHaveTextContent('jwt-x')
})

test('logout() chama POST /api/auth/logout e limpa o estado local', async () => {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-refresh' })))
  let hitsLogout = 0
  server.use(
    http.post('*/api/auth/logout', () => {
      hitsLogout += 1
      return new HttpResponse(null, { status: 204 })
    })
  )
  const user = userEvent.setup()

  renderComProvider()
  await waitFor(() => {
    expect(screen.getByTestId('autenticado')).toHaveTextContent('sim')
  })

  await user.click(screen.getByRole('button', { name: 'sair' }))

  await waitFor(() => {
    expect(screen.getByTestId('autenticado')).toHaveTextContent('nao')
  })
  expect(screen.getByTestId('token')).toHaveTextContent('')
  expect(hitsLogout).toBe(1)
})

test('useAuth() fora do <AuthProvider> lança erro explicativo', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

  expect(() => render(<Sonda />)).toThrow(/AuthProvider/)

  spy.mockRestore()
})
