import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
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

test('linhas que retornam após ampliar a busca não reexibem a animação de entrada', async () => {
  renderPage()
  await screen.findByRole('link', { name: 'Compra semanal' })
  const user = userEvent.setup()

  const busca = screen.getByRole('searchbox', { name: 'Buscar cotação' })

  await user.type(busca, 'hortifruti')
  expect(screen.queryByRole('link', { name: 'Compra semanal' })).not.toBeInTheDocument()

  await user.clear(busca)
  const row = (await screen.findByRole('link', { name: 'Compra semanal' })).closest('tr')
  expect(row).not.toHaveClass('fade-in')
  expect(row?.getAttribute('style')).toBeNull()
})

// --- duplicar-cotacao-ui removido: "Duplicar" deixou de existir no menu de linha. ---

test('menu de cada linha não tem mais "Duplicar" (só Ver detalhes e Excluir)', async () => {
  renderPage()
  await screen.findByRole('link', { name: 'Compra semanal' })
  await userEvent.setup().click(screen.getAllByRole('button', { name: /mais opções/i })[0])

  expect(screen.queryByRole('menuitem', { name: /duplicar/i })).not.toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: 'Ver detalhes' })).toBeInTheDocument()
  expect(screen.getByRole('menuitem', { name: 'Excluir' })).toBeInTheDocument()
})

test('filtro de mês lista só os meses com prazo, mais recente primeiro', async () => {
  renderPage()
  await screen.findByRole('link', { name: 'Compra semanal' })

  const select = screen.getByRole('combobox', { name: 'Filtrar por mês do prazo' })
  const opcoes = within(select).getAllByRole('option').map((o) => o.textContent)
  expect(opcoes).toEqual(['Todos os meses', 'Agosto de 2026'])
})

test('filtrar por mês esconde cotações sem prazo e de outros meses', async () => {
  renderPage()
  await screen.findByRole('link', { name: 'Compra semanal' })
  const user = userEvent.setup()

  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Filtrar por mês do prazo' }),
    'Agosto de 2026',
  )

  expect(screen.queryByRole('link', { name: 'Compra semanal' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Hortifruti agosto' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Limpeza Q3' })).toBeInTheDocument()
})

test('filtro de mês vem da URL (?mes=)', async () => {
  renderPage('/admin/cotacoes?mes=2026-08')

  await screen.findByRole('link', { name: 'Hortifruti agosto' })
  expect(screen.queryByRole('link', { name: 'Compra semanal' })).not.toBeInTheDocument()
  expect(
    screen.getByRole('combobox', { name: 'Filtrar por mês do prazo' }),
  ).toHaveValue('2026-08')
})

test('mês inválido na URL mostra todos os meses', async () => {
  renderPage('/admin/cotacoes?mes=2099-01')

  await screen.findByRole('link', { name: 'Compra semanal' })
  expect(screen.getByRole('link', { name: 'Hortifruti agosto' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Limpeza Q3' })).toBeInTheDocument()
})
