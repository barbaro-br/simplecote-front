import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider, useAuth } from './AuthContext'
import { SessaoExpiradaBridge } from './SessaoExpiradaBridge'
import { api, configurarSessaoExpirada } from '@/shared/api/api-client'
import { routes } from '@/routes'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'

function SondaAuth() {
  const { isAutenticado } = useAuth()
  return <div data-testid="auth">{isAutenticado ? 'sim' : 'nao'}</div>
}

afterEach(async () => {
  configurarSessaoExpirada(() => {})
  sessionStorage.clear()
  await routes.navigate('/login')
})

describe('SessaoExpiradaBridge — fiação do 401 ao AuthContext + router', () => {
  it('401 numa chamada autenticada leva o usuário para /login e desloga', async () => {
    sessionStorage.setItem('simplecote_token', 'tok')
    await routes.navigate('/admin')
    server.use(http.get('*/api/produtos', () => new HttpResponse(null, { status: 401 })))

    render(
      <AuthProvider>
        <SessaoExpiradaBridge />
        <SondaAuth />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth')).toHaveTextContent('sim')

    await expect(api.get('/api/produtos')).rejects.toBeTruthy()

    await waitFor(() => {
      expect(routes.state.location.pathname).toBe('/login')
      expect(screen.getByTestId('auth')).toHaveTextContent('nao')
    })
  })
})

describe('UI não exibe a mensagem de SessaoExpiradaError', () => {
  it('mutation de formulário que recebe 401 → sem erro inline e rota em /login', async () => {
    sessionStorage.setItem('simplecote_token', 'tok')
    await routes.navigate('/admin')
    server.use(http.post('*/api/produtos', () => new HttpResponse(null, { status: 401 })))

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessaoExpiradaBridge />
          <ProdutoForm aoSalvar={() => {}} />
        </AuthProvider>
      </QueryClientProvider>
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Nome do produto'), 'Feijão 1kg')
    await user.click(screen.getByRole('button', { name: /Salvar/i }))

    await waitFor(() => {
      expect(routes.state.location.pathname).toBe('/login')
    })

    expect(screen.queryByText('Sessão expirada')).not.toBeInTheDocument()
    expect(screen.queryByText(/Erro ao salvar produto/i)).not.toBeInTheDocument()
  })
})
