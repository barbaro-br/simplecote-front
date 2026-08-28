import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider, useAuth } from './AuthContext'

const SESSION_KEY = 'simplecote_token'

function Sonda() {
  const { token, isAutenticado, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="autenticado">{isAutenticado ? 'sim' : 'nao'}</span>
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

beforeEach(() => {
  sessionStorage.clear()
})

test('hidrata o token de sessionStorage no mount', () => {
  sessionStorage.setItem(SESSION_KEY, 'jwt-semeado')

  renderComProvider()

  expect(screen.getByTestId('autenticado')).toHaveTextContent('sim')
  expect(screen.getByTestId('token')).toHaveTextContent('jwt-semeado')
})

test('login() persiste o token na sessão e liga isAutenticado', async () => {
  server.use(http.post('*/api/auth/login', () => HttpResponse.json({ token: 'jwt-x' })))
  const user = userEvent.setup()

  renderComProvider()
  expect(screen.getByTestId('autenticado')).toHaveTextContent('nao')

  await user.click(screen.getByRole('button', { name: 'entrar' }))

  await waitFor(() => {
    expect(screen.getByTestId('autenticado')).toHaveTextContent('sim')
  })
  expect(screen.getByTestId('token')).toHaveTextContent('jwt-x')
  expect(sessionStorage.getItem(SESSION_KEY)).toBe('jwt-x')
})

test('logout() limpa a memória e o sessionStorage', async () => {
  sessionStorage.setItem(SESSION_KEY, 'jwt-semeado')
  const user = userEvent.setup()

  renderComProvider()
  expect(screen.getByTestId('autenticado')).toHaveTextContent('sim')

  await user.click(screen.getByRole('button', { name: 'sair' }))

  await waitFor(() => {
    expect(screen.getByTestId('autenticado')).toHaveTextContent('nao')
  })
  expect(screen.getByTestId('token')).toHaveTextContent('')
  expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
})

test('useAuth() fora do <AuthProvider> lança erro explicativo', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

  expect(() => render(<Sonda />)).toThrow(/AuthProvider/)

  spy.mockRestore()
})
