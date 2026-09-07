import { render, screen } from '@testing-library/react'
import { createMemoryRouter, Navigate, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { TenantProvider } from '@/shared/tenant/TenantContext'
import { SiteLayout } from './SiteLayout'
import { Raiz } from './Raiz'
import { PrecosPage } from './PrecosPage'
import { AjudaPage } from './AjudaPage'

function renderSite(initialEntry: string) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <Raiz /> },
      {
        element: <SiteLayout />,
        children: [
          { path: '/precos', element: <PrecosPage /> },
          { path: '/ajuda', element: <AjudaPage /> },
        ],
      },
      { path: '/admin', element: <div>dashboard</div> },
      { path: '/login', element: <div>login view</div> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
    { initialEntries: [initialEntry] }
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          <RouterProvider router={router} />
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

test('/ sem sessão renderiza a home com os CTAs "Criar conta" e "Entrar"', async () => {
  renderSite('/')

  expect(
    await screen.findByRole('heading', { name: /Cotações competitivas, sem planilha/i })
  ).toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: 'Criar conta' }).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('link', { name: 'Entrar' }).length).toBeGreaterThan(0)
})

test('/ com sessão redireciona para /admin sem montar a casca do site', async () => {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-x' })))

  renderSite('/')

  expect(await screen.findByText('dashboard')).toBeInTheDocument()
  // a casca do SiteLayout (header/footer) não deve estar no DOM durante o redirect
  expect(screen.queryByRole('link', { name: 'Preços' })).not.toBeInTheDocument()
})

test('/precos lista os planos da fonte única', async () => {
  renderSite('/precos')

  expect(await screen.findByText('Teste grátis')).toBeInTheDocument()
  expect(screen.getByText('Essencial')).toBeInTheDocument()
  expect(screen.getByText('Profissional')).toBeInTheDocument()
  expect(screen.getByText('Grátis')).toBeInTheDocument()
})

test('/ajuda renderiza as perguntas do FAQ', async () => {
  renderSite('/ajuda')

  expect(await screen.findByText('Como criar uma nova cotação?')).toBeInTheDocument()
  expect(screen.getByText('Como cancelar uma cotação?')).toBeInTheDocument()
})

test('rota desconhecida sem sessão cai na home', async () => {
  renderSite('/rota-que-nao-existe')

  expect(
    await screen.findByRole('heading', { name: /Cotações competitivas, sem planilha/i })
  ).toBeInTheDocument()
})
