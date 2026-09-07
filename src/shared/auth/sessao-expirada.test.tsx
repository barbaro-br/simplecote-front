import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { SessaoExpiradaBridge } from './SessaoExpiradaBridge'
import { api, configurarSessaoExpirada, definirToken } from '@/shared/api/api-client'
import { routes } from '@/routes'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'

function SondaAuth() {
  const { isAutenticado } = useAuth()
  return <div data-testid="auth">{isAutenticado ? 'sim' : 'nao'}</div>
}

// Boot restaura a sessão (refresh #1 → token) e, numa chamada autenticada que
// recebe `401`, o refresh seguinte falha → sessão expirada.
function semearSessaoComRefreshQueDepoisFalha() {
  let refreshCount = 0
  server.use(
    http.post('*/api/auth/refresh', () => {
      refreshCount += 1
      return refreshCount === 1
        ? HttpResponse.json({ token: 'tok' })
        : new HttpResponse(null, { status: 401 })
    })
  )
}

afterEach(async () => {
  configurarSessaoExpirada(() => {})
  definirToken(null)
  await routes.navigate('/login')
})

describe('SessaoExpiradaBridge — fiação do 401 ao AuthContext + router', () => {
  it('401 numa chamada autenticada leva o usuário para /login e desloga', async () => {
    semearSessaoComRefreshQueDepoisFalha()
    await routes.navigate('/admin')
    server.use(http.get('*/api/produtos', () => new HttpResponse(null, { status: 401 })))

    render(
      <AuthProvider>
        <SessaoExpiradaBridge />
        <SondaAuth />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('sim')
    })

    await expect(api.get('/api/produtos')).rejects.toBeTruthy()

    await waitFor(() => {
      expect(routes.state.location.pathname).toBe('/login')
      expect(screen.getByTestId('auth')).toHaveTextContent('nao')
    })
  })
})

describe('UI não exibe a mensagem de SessaoExpiradaError', () => {
  it('mutation de formulário que recebe 401 → sem erro inline e rota em /login', async () => {
    semearSessaoComRefreshQueDepoisFalha()
    await routes.navigate('/admin')
    server.use(http.post('*/api/produtos', () => new HttpResponse(null, { status: 401 })))

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessaoExpiradaBridge />
          <SondaAuth />
          <ProdutoForm aoSalvar={() => {}} />
        </AuthProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('sim')
    })

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/Código de barras/i), '7891234567890')
    await user.type(screen.getByLabelText('Nome do produto'), 'Feijão 1kg')
    await user.click(screen.getByRole('button', { name: /Salvar/i }))

    await waitFor(() => {
      expect(routes.state.location.pathname).toBe('/login')
    })

    expect(screen.queryByText('Sessão expirada')).not.toBeInTheDocument()
    expect(screen.queryByText(/Erro ao salvar produto/i)).not.toBeInTheDocument()
  })
})
