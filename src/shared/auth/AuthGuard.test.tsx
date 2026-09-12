import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { server } from '@/setupTests'
import { AuthProvider } from './AuthContext'
import { AuthGuard } from './AuthGuard'

// Tenant neutro (host sem loja): este arquivo testa só a sessão, não o slug.
vi.mock('@/shared/tenant/useTenant', () => ({
  useTenant: () => ({ slug: null, existe: null, verificando: false, ehHostDoApp: false }),
}))

vi.mock('sonner', () => ({
  toast: { warning: vi.fn(), error: vi.fn(), success: vi.fn(), info: vi.fn() },
}))

function renderEm(initialEntries: string[]) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <div>tela de login</div> },
      {
        path: '/backoffice',
        element: <div>tela do backoffice</div>,
      },
      {
        path: '/admin',
        element: <AuthGuard />,
        children: [{ index: true, element: <div>área admin</div> }],
      },
    ],
    { initialEntries }
  )
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

function jwtSuperAdmin(): string {
  const payload = btoa(JSON.stringify({ papel: 'SUPER_ADMIN' }))
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

test('sem token, acessar /admin redireciona para a tela de login', async () => {
  // default handler em setupTests.ts: refresh → 401 (sem cookie)
  renderEm(['/admin'])

  expect(await screen.findByText('tela de login')).toBeInTheDocument()
  expect(screen.queryByText('área admin')).not.toBeInTheDocument()
})

test('com refresh ok no boot, /admin renderiza a área admin', async () => {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-semeado' })))

  renderEm(['/admin'])

  expect(await screen.findByText('área admin')).toBeInTheDocument()
  expect(screen.queryByText('tela de login')).not.toBeInTheDocument()
})

// Regressão: token de suporte não encontrado nesta aba num reload (ex.: aba
// descartada em segundo plano) faz o boot cair no SUPER_ADMIN via cookie — o
// AuthGuard manda pro backoffice em vez de renderizar o painel do lojista.
// Sem aviso, isso é indistinguível de "o painel simplesmente sumiu"; o toast
// explica o porquê (mesmo sem saber com certeza se veio de um reload ou de
// navegação direta — ver comentário em AuthGuard.tsx).
test('SUPER_ADMIN em /admin é mandado pro backoffice com um aviso', async () => {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: jwtSuperAdmin() })))

  renderEm(['/admin'])

  expect(await screen.findByText('tela do backoffice')).toBeInTheDocument()
  expect(screen.queryByText('área admin')).not.toBeInTheDocument()
  await waitFor(() =>
    expect(toast.warning).toHaveBeenCalledWith('Sessão de suporte não encontrada nesta aba — entre novamente pelo backoffice.'),
  )
})
