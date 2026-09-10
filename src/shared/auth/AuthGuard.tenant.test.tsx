import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from './AuthContext'
import { AuthGuard } from './AuthGuard'

const tenantMock = vi.hoisted(() => ({
  slug: null as string | null,
  existe: null as boolean | null,
  verificando: false,
  ehHostDoApp: false,
}))

vi.mock('@/shared/tenant/useTenant', () => ({
  useTenant: () => ({ ...tenantMock }),
}))

function jwt(slug: string): string {
  const payload = btoa(JSON.stringify({ papel: 'ADMIN', slug, compradorId: 'c1' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

function jwtSemSlug(): string {
  const payload = btoa(JSON.stringify({ papel: 'ADMIN', compradorId: 'c1' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

function renderGuard(token: string) {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token })))
  const router = createMemoryRouter(
    [
      { path: '/login', element: <div>login view</div> },
      {
        path: '/admin',
        element: <AuthGuard />,
        children: [{ index: true, element: <div>área admin</div> }],
      },
    ],
    { initialEntries: ['/admin'] }
  )
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

const locationOriginal = window.location

function stubHostname(hostname: string) {
  const u = new URL(`https://${hostname}/admin`)
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      href: u.href,
      origin: u.origin,
      protocol: u.protocol,
      host: u.host,
      hostname: u.hostname,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
  })
}

beforeEach(() => {
  tenantMock.slug = null
  tenantMock.ehHostDoApp = false
})

afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: locationOriginal })
})

test('slug do hostname igual ao do JWT renderiza o painel', async () => {
  tenantMock.slug = 'loja-a'
  tenantMock.ehHostDoApp = true
  renderGuard(jwt('loja-a'))

  expect(await screen.findByText('área admin')).toBeInTheDocument()
})

test('slug do hostname divergente do JWT não renderiza o painel', async () => {
  tenantMock.slug = 'loja-b'
  tenantMock.ehHostDoApp = true
  renderGuard(jwt('loja-a'))

  await screen.findByRole('status')
  expect(screen.queryByText('área admin')).not.toBeInTheDocument()
})

test('host neutro do app com sessão redireciona (não renderiza)', async () => {
  tenantMock.slug = null
  tenantMock.ehHostDoApp = true
  renderGuard(jwt('loja-a'))

  await screen.findByRole('status')
  expect(screen.queryByText('área admin')).not.toBeInTheDocument()
})

test('fora do app (localhost/preview) não redireciona mesmo com slug divergente', async () => {
  tenantMock.slug = 'loja-b'
  tenantMock.ehHostDoApp = false
  renderGuard(jwt('loja-a'))

  expect(await screen.findByText('área admin')).toBeInTheDocument()
})

test('novo.simplecote.app (host de transição) não redireciona pro subdomínio da loja', async () => {
  stubHostname('novo.simplecote.app')
  tenantMock.slug = null
  tenantMock.ehHostDoApp = true
  renderGuard(jwt('loja-a'))

  expect(await screen.findByText('área admin')).toBeInTheDocument()
})

test('token sem slug em host do app renderiza o painel (não desloga)', async () => {
  tenantMock.slug = 'loja-b'
  tenantMock.ehHostDoApp = true
  renderGuard(jwtSemSlug())

  expect(await screen.findByText('área admin')).toBeInTheDocument()
})
