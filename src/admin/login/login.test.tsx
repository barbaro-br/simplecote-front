import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { CREDITO_DESENVOLVEDOR } from '@/shared/creditos-desenvolvedor'
import { LoginPage } from './LoginPage'

const tenantMock = vi.hoisted(() => ({
  slug: null as string | null,
  existe: null as boolean | null,
  verificando: false,
  ehHostDoApp: false,
}))

vi.mock('@/shared/tenant/useTenant', () => ({
  useTenant: () => ({ ...tenantMock }),
}))

function renderLogin() {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '/admin', element: <div>dashboard</div> },
      { path: '/esqueci-senha', element: <div>esqueci senha view</div> },
      { path: '/cadastro', element: <div>cadastro view</div> },
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
  tenantMock.slug = null
  tenantMock.existe = null
  tenantMock.verificando = false
  tenantMock.ehHostDoApp = false
})

test('caminho feliz: credenciais válidas logam e navegam para /admin', async () => {
  server.use(http.post('*/api/auth/login', () => HttpResponse.json({ token: 'jwt-ok' })))
  const user = userEvent.setup()

  renderLogin()

  await user.type(screen.getByLabelText('E-mail'), 'admin@simplecote.com')
  await user.type(screen.getByLabelText('Senha'), 'senha123')
  await user.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(await screen.findByText('dashboard')).toBeInTheDocument()
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

test('link "Esqueci minha senha" navega para /esqueci-senha', async () => {
  const user = userEvent.setup()

  renderLogin()

  await user.click(screen.getByRole('link', { name: 'Esqueci minha senha' }))

  expect(await screen.findByText('esqueci senha view')).toBeInTheDocument()
})

test('link "Criar conta" navega para /cadastro', async () => {
  const user = userEvent.setup()

  renderLogin()

  await user.click(screen.getByRole('link', { name: 'Criar conta' }))

  expect(await screen.findByText('cadastro view')).toBeInTheDocument()
})

test('subdomínio de loja inexistente mostra "esse endereço de loja não existe"', () => {
  tenantMock.slug = 'loja-que-nao-existe'
  tenantMock.existe = false

  renderLogin()

  expect(screen.getByText(/esse endereço de loja não existe/i)).toBeInTheDocument()
  expect(screen.queryByLabelText('E-mail')).toBeNull()
  expect(screen.getByRole('link', { name: 'Ir para o site' })).toHaveAttribute(
    'href',
    'https://simplecote.com.br'
  )
})

test('renderiza o crédito de desenvolvedor abaixo de "Esqueci minha senha"', () => {
  renderLogin()

  expect(screen.getByText(CREDITO_DESENVOLVEDOR.texto)).toBeInTheDocument()
})

test('identidade fixa "SimpleCote" / "Cotações simplificadas" sem chamar /api/configuracoes', async () => {
  let chamadasConfiguracoes = 0
  server.use(
    http.get('*/api/configuracoes', () => {
      chamadasConfiguracoes += 1
      return HttpResponse.json({ nome: 'Loja Vazada' })
    })
  )

  renderLogin()

  expect(screen.getByRole('heading', { name: 'SimpleCote' })).toBeInTheDocument()
  expect(screen.getByText('Cotações simplificadas')).toBeInTheDocument()
  expect(screen.queryByText('Loja Vazada')).not.toBeInTheDocument()

  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(chamadasConfiguracoes).toBe(0)
})
