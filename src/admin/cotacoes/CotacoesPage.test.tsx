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

function renderPage() {
  server.use(http.get('*/api/cotacoes', () => HttpResponse.json(COTACOES)))
  const router = createMemoryRouter([{ path: '/admin', element: <CotacoesPage /> }], {
    initialEntries: ['/admin'],
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
  expect(await screen.findByRole('link', { name: 'Compra semanal' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Hortifruti agosto' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Limpeza Q3' })).toBeInTheDocument()
})

test('filtrar por status reduz as linhas', async () => {
  renderPage()
  await screen.findByRole('link', { name: 'Compra semanal' })
  const user = userEvent.setup()

  await user.selectOptions(screen.getByLabelText('Filtrar por status'), 'ABERTA')

  const linhas = within(screen.getByRole('table')).getAllByRole('row')
  // 1 header + 2 ABERTA
  expect(linhas).toHaveLength(3)
  expect(screen.queryByRole('link', { name: 'Compra semanal' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Hortifruti agosto' })).toBeInTheDocument()
})

test('atalho "Nova cotação" aponta para o formulário de criação', async () => {
  renderPage()
  await screen.findByRole('link', { name: 'Compra semanal' })
  expect(screen.getByRole('link', { name: /nova cotação/i })).toHaveAttribute(
    'href',
    '/admin/cotacoes/nova',
  )
})
