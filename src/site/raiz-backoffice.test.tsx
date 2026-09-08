import { render, screen } from '@testing-library/react'
import { vi, expect, test, beforeEach } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { TenantProvider } from '@/shared/tenant/TenantContext'
import { Raiz } from './Raiz'

const hostBackoffice = vi.hoisted(() => ({ valor: false }))

vi.mock('@/shared/tenant/slug-do-hostname', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/tenant/slug-do-hostname')>()
  return { ...actual, ehHostBackoffice: () => hostBackoffice.valor }
})

function renderRaiz() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <Raiz /> },
      { path: '/login', element: <div>login view</div> },
    ],
    { initialEntries: ['/'] }
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

beforeEach(() => {
  hostBackoffice.valor = false
})

test('host do backoffice sem sessão vai para o login (não a home)', async () => {
  hostBackoffice.valor = true

  renderRaiz()

  expect(await screen.findByText('login view')).toBeInTheDocument()
})

test('host de marketing sem sessão mostra a home institucional', async () => {
  renderRaiz()

  expect(
    await screen.findByRole('heading', { name: /Cotações competitivas, sem planilha/i })
  ).toBeInTheDocument()
})
