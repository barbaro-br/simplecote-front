import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { useAuth } from '@/shared/auth/useAuth'
import { BackofficeGuard } from './BackofficeGuard'
import { CompradoresPage } from './CompradoresPage'
import { CompradorDetalhePage } from './CompradorDetalhePage'
import { ModoSuporteBanner } from './ModoSuporteBanner'

function jwt(claims: Record<string, unknown>): string {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

const TOKEN_SUPER_ADMIN = jwt({ papel: 'SUPER_ADMIN' })
const TOKEN_ADMIN = jwt({ papel: 'ADMIN', compradorId: 'c1', slug: 'loja' })
const TOKEN_SUPORTE = jwt({ papel: 'ADMIN', compradorId: 'c1', impersonatedBy: 'sa-1' })

const C1 = '11111111-1111-4111-8111-111111111111'
const ADMIN_1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

const DETALHE = {
  id: C1,
  nome: 'Mercado do Zé',
  slug: 'mercado-do-ze',
  statusAssinatura: 'TESTE',
  criadoEm: '2026-09-01T10:00:00Z',
  ultimoAcessoEm: null,
  cotacoes: 3,
  usuarios: 2,
  representantes: 5,
  suspenso: false,
  admins: [
    { id: ADMIN_1, nome: 'Dono', email: 'dono@x.com', papel: 'OWNER' },
  ],
}

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderGuard(token: string | null) {
  server.use(
    http.post('*/api/auth/refresh', () =>
      token ? HttpResponse.json({ token }) : new HttpResponse(null, { status: 401 })
    )
  )
  const router = createMemoryRouter(
    [
      {
        path: '/backoffice',
        element: <BackofficeGuard />,
        children: [{ index: true, element: <div>lista view</div> }],
      },
    ],
    { initialEntries: ['/backoffice'] }
  )
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('BackofficeGuard', () => {
  test('ADMIN (sem SUPER_ADMIN) vê não encontrado', async () => {
    renderGuard(TOKEN_ADMIN)

    expect(await screen.findByText('Página não encontrada')).toBeInTheDocument()
    expect(screen.queryByText('lista view')).not.toBeInTheDocument()
  })

  test('SUPER_ADMIN acessa o backoffice', async () => {
    renderGuard(TOKEN_SUPER_ADMIN)

    expect(await screen.findByText('lista view')).toBeInTheDocument()
  })
})

describe('CompradoresPage', () => {
  function renderLista() {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: TOKEN_SUPER_ADMIN })))
    const router = createMemoryRouter([{ path: '/backoffice', element: <CompradoresPage /> }], {
      initialEntries: ['/backoffice'],
    })
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  test('lista compradores com status e uso', async () => {
    server.use(
      http.get('*/api/admin/compradores', () =>
        HttpResponse.json([
          { ...DETALHE, statusAssinatura: 'INADIMPLENTE', cotacoes: 12, usuarios: 3, representantes: 20 },
        ])
      )
    )
    renderLista()

    expect(await screen.findByText('Mercado do Zé')).toBeInTheDocument()
    expect(screen.getAllByText('Inadimplente').length).toBeGreaterThan(0)
  })

  test('filtro por status e busca chamam a API com os params', async () => {
    let url = ''
    server.use(
      http.get('*/api/admin/compradores', ({ request }) => {
        url = request.url
        return HttpResponse.json([])
      })
    )
    const user = userEvent.setup()
    renderLista()

    await screen.findByText('Nenhum comprador encontrado.')

    await user.selectOptions(screen.getByLabelText('Filtrar por status'), 'INADIMPLENTE')
    await waitFor(() => expect(url).toContain('status=INADIMPLENTE'))

    await user.type(screen.getByLabelText('Buscar por nome ou e-mail'), 'dono@x.com')
    await waitFor(() => expect(url).toContain('busca='))
  })
})

describe('CompradorDetalhePage', () => {
  function renderDetalhe() {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: TOKEN_SUPER_ADMIN })))
    server.use(http.get('*/api/admin/compradores/:id', () => HttpResponse.json(DETALHE)))
    const router = createMemoryRouter(
      [{ path: '/backoffice/compradores/:id', element: <CompradorDetalhePage /> }],
      { initialEntries: [`/backoffice/compradores/${C1}`] }
    )
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  test('suspender chama a API após confirmação', async () => {
    let chamou = false
    server.use(
      http.post('*/api/admin/compradores/:id/suspender', ({ params }) => {
        chamou = true
        expect(params.id).toBe(C1)
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Suspender' }))
    const dialog = within(await screen.findByRole('dialog'))
    await user.click(dialog.getByRole('button', { name: 'Suspender' }))

    expect(chamou).toBe(true)
  })

  test('resetar senha de admin chama a API com o usuarioId e confirma por e-mail', async () => {
    let corpo: unknown
    server.use(
      http.post('*/api/admin/compradores/:id/resetar-senha-admin', async ({ request }) => {
        corpo = await request.json()
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Resetar senha' }))
    await user.click(screen.getByRole('button', { name: 'Enviar recuperação' }))

    expect(corpo).toEqual({ usuarioId: ADMIN_1 })
  })

  test('erro do backend aparece na tela', async () => {
    server.use(
      http.post('*/api/admin/compradores/:id/suspender', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Não processável', status: 422, detail: 'Conta já suspensa.' },
          { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
        )
      )
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Suspender' }))
    const dialog = within(await screen.findByRole('dialog'))
    await user.click(dialog.getByRole('button', { name: 'Suspender' }))

    expect(await screen.findByText('Conta já suspensa.')).toBeInTheDocument()
  })
})

describe('impersonação (entrar/sair do modo suporte)', () => {
  function PainelComBanner() {
    const { modoSuporte } = useAuth()
    return (
      <div>
        <div data-testid="modo-suporte">{modoSuporte ? 'sim' : 'nao'}</div>
        <ModoSuporteBanner nomeComprador="Mercado do Zé" />
      </div>
    )
  }

  function renderFluxo() {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: TOKEN_SUPER_ADMIN })))
    server.use(http.get('*/api/admin/compradores/:id', () => HttpResponse.json(DETALHE)))
    server.use(
      http.post('*/api/admin/compradores/:id/suporte', () =>
        HttpResponse.json({ token: TOKEN_SUPORTE, expiraEm: '2026-09-07T20:00:00Z' })
      )
    )
    const router = createMemoryRouter(
      [
        { path: '/backoffice', element: <div>backoffice view</div> },
        { path: '/backoffice/compradores/:id', element: <CompradorDetalhePage /> },
        { path: '/admin', element: <PainelComBanner /> },
      ],
      { initialEntries: [`/backoffice/compradores/${C1}`] }
    )
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  test('entrar como suporte exige motivo, troca a sessão e mostra a tarja', async () => {
    const user = userEvent.setup()
    renderFluxo()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Entrar como suporte' }))

    const dialog = within(await screen.findByRole('dialog'))
    const botaoEntrar = dialog.getByRole('button', { name: 'Entrar' })
    expect(botaoEntrar).toBeDisabled()

    await user.type(dialog.getByLabelText('Motivo'), 'Reproduzir bug de cotação')
    expect(botaoEntrar).not.toBeDisabled()

    await user.click(botaoEntrar)

    expect(await screen.findByTestId('modo-suporte')).toHaveTextContent('sim')
    expect(screen.getByText('Modo suporte — Mercado do Zé')).toBeInTheDocument()
  })

  test('sair do modo suporte restaura a sessão e volta ao backoffice', async () => {
    const user = userEvent.setup()
    renderFluxo()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Entrar como suporte' }))
    const dialog = within(await screen.findByRole('dialog'))
    await user.type(dialog.getByLabelText('Motivo'), 'Suporte')
    await user.click(dialog.getByRole('button', { name: 'Entrar' }))

    await screen.findByText('Modo suporte — Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Sair do modo suporte' }))

    expect(await screen.findByText('backoffice view')).toBeInTheDocument()
  })
})
