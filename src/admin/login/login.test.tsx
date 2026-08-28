import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { LoginPage } from './LoginPage'

const SESSION_KEY = 'simplecote_token'

function renderLogin() {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/admin', element: <div>dashboard</div> },
    ],
    { initialEntries: ['/login'] }
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  sessionStorage.clear()
})

test('caminho feliz: credenciais válidas logam e navegam para /admin', async () => {
  server.use(http.post('*/api/auth/login', () => HttpResponse.json({ token: 'jwt-ok' })))
  const user = userEvent.setup()

  renderLogin()

  await user.type(screen.getByLabelText('E-mail'), 'admin@simplecote.com')
  await user.type(screen.getByLabelText('Senha'), 'senha123')
  await user.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(await screen.findByText('dashboard')).toBeInTheDocument()
  expect(sessionStorage.getItem(SESSION_KEY)).toBe('jwt-ok')
})

test('validação: submeter vazio mostra os erros inline e não chama a API', async () => {
  const user = userEvent.setup()

  renderLogin()

  await user.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(await screen.findByText('E-mail obrigatório')).toBeInTheDocument()
  expect(screen.getByText('Senha obrigatória')).toBeInTheDocument()
  expect(screen.queryByText('dashboard')).not.toBeInTheDocument()
})

test('erro de API: 401 exibe a mensagem do servidor e permanece em /login', async () => {
  server.use(
    http.post('*/api/auth/login', () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'Credenciais inválidas.' },
        { status: 401, headers: { 'Content-Type': 'application/problem+json' } }
      )
    )
  )
  const user = userEvent.setup()

  renderLogin()

  await user.type(screen.getByLabelText('E-mail'), 'admin@simplecote.com')
  await user.type(screen.getByLabelText('Senha'), 'errada')
  await user.click(screen.getByRole('button', { name: 'Entrar' }))

  const alerta = await screen.findByRole('alert')
  expect(alerta).toHaveTextContent('Credenciais inválidas.')
  expect(screen.queryByText('dashboard')).not.toBeInTheDocument()
})
