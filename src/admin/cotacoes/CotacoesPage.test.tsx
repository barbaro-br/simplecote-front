import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider, useParams } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { CotacoesPage } from './CotacoesPage'

const COTACOES = [
  { id: '1', titulo: 'Compra semanal', status: 'RASCUNHO', prazo: null, criadaEm: '2026-08-01T12:00:00Z', encerradaEm: null },
  { id: '2', titulo: 'Hortifruti agosto', status: 'ABERTA', prazo: '2026-08-30T12:00:00Z', criadaEm: '2026-08-02T12:00:00Z', encerradaEm: null },
  { id: '3', titulo: 'Limpeza Q3', status: 'ABERTA', prazo: '2026-08-31T12:00:00Z', criadaEm: '2026-08-03T12:00:00Z', encerradaEm: null },
]

function renderPage(initial = '/admin/cotacoes') {
  server.use(http.get('*/api/cotacoes', () => HttpResponse.json(COTACOES)))
  const router = createMemoryRouter([{ path: '/admin/cotacoes', element: <CotacoesPage /> }], {
    initialEntries: [initial],
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

test('lista as cotações retornadas pela API', async () => {
  renderPage()
  await screen.findByRole('link', { name: 'Compra semanal' })
  await screen.findByRole('link', { name: 'Hortifruti agosto' })
  await screen.findByRole('link', { name: 'Limpeza Q3' })
})

test('filtrar por status reduz as linhas', async () => {
  renderPage()
  await screen.findByRole('link', { name: 'Compra semanal' })
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Aberta' }))

  const linhas = within(screen.getByRole('table')).getAllByRole('row')
  expect(linhas).toHaveLength(3)
  expect(screen.queryByRole('link', { name: 'Compra semanal' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Hortifruti agosto' })).toBeInTheDocument()
})

test('filtro por status vem da URL (?status=)', async () => {
  renderPage('/admin/cotacoes?status=ABERTA')

  await screen.findByRole('link', { name: 'Hortifruti agosto' })
  expect(screen.queryByRole('link', { name: 'Compra semanal' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Limpeza Q3' })).toBeInTheDocument()
})

test('status inválido na URL mostra todas as cotações', async () => {
  renderPage('/admin/cotacoes?status=NAO_EXISTE')

  await screen.findByRole('link', { name: 'Compra semanal' })
  expect(screen.getByRole('link', { name: 'Hortifruti agosto' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Limpeza Q3' })).toBeInTheDocument()
})

test('atalho "Nova cotação" aponta para o formulário de criação', async () => {
  renderPage()
  await screen.findByRole('link', { name: 'Compra semanal' })
  expect(screen.getByRole('link', { name: /nova cotação/i })).toHaveAttribute(
    'href',
    '/admin/cotacoes/nova',
  )
})

test('linhas de cotação não dependem de opacity-0 (visíveis sob reduced-motion)', async () => {
  renderPage()
  const link = await screen.findByRole('link', { name: 'Compra semanal' })
  const row = link.closest('tr')
  expect(row).not.toHaveClass('opacity-0')
})

// --- duplicar-cotacao-ui ---

function DetalheMarker() {
  const { id } = useParams()
  return <p>detalhe da cotação {id}</p>
}

function renderList() {
  server.use(http.get('*/api/cotacoes', () => HttpResponse.json(COTACOES)))
  const router = createMemoryRouter(
    [
      { path: '/admin/cotacoes', element: <CotacoesPage /> },
      { path: '/admin/cotacoes/:id', element: <DetalheMarker /> },
    ],
    { initialEntries: ['/admin/cotacoes'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

async function abrirDuplicarDaPrimeiraLinha() {
  const user = userEvent.setup()
  await screen.findByRole('link', { name: 'Compra semanal' })
  await user.click(screen.getAllByRole('button', { name: /mais opções/i })[0])
  await user.click(screen.getByRole('menuitem', { name: /duplicar/i }))
}

test('cada linha tem um menu de ações com "Duplicar"', async () => {
  renderList()
  await screen.findByRole('link', { name: 'Compra semanal' })
  await userEvent.setup().click(screen.getAllByRole('button', { name: /mais opções/i })[0])
  expect(screen.getByRole('menuitem', { name: /duplicar/i })).toBeInTheDocument()
})

test('duplicar com sucesso navega para o detalhe da nova cotação', async () => {
  server.use(
    http.post('*/api/cotacoes/1/duplicar', () =>
      HttpResponse.json({
        cotacao: {
          id: 'nova-99',
          titulo: 'Compra semanal',
          status: 'RASCUNHO',
          prazo: null,
          criadaEm: '2026-08-10T12:00:00Z',
          encerradaEm: null,
          itens: [],
        },
        omitidos: [],
      }),
    ),
  )
  renderList()
  await abrirDuplicarDaPrimeiraLinha()
  expect(await screen.findByText('detalhe da cotação nova-99')).toBeInTheDocument()
})

test('duplicar com erro mostra a mensagem do backend e não navega', async () => {
  server.use(
    http.post('*/api/cotacoes/1/duplicar', () =>
      HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Conflito',
          status: 409,
          detail: 'Cotação não pode ser duplicada neste estado.',
        },
        { status: 409 },
      ),
    ),
  )
  renderList()
  await abrirDuplicarDaPrimeiraLinha()
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Cotação não pode ser duplicada neste estado.',
  )
  expect(screen.queryByText(/detalhe da cotação/i)).not.toBeInTheDocument()
})
