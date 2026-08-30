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

function renderPage(mockDashboardError = false) {
  server.use(
    http.get('*/api/cotacoes', () => HttpResponse.json(COTACOES)),
    http.get('*/api/analises/dashboard', () => {
      if (mockDashboardError) {
        return new HttpResponse(null, { status: 500 })
      }
      return HttpResponse.json({
        porStatus: { RASCUNHO: 1, ABERTA: 2 },
        contadores: { encerradasSemApurar: 1, apuradasSemPedido: 0 },
        proximosPrazos: [],
        gastos: { mesAtual: '0', mesAnterior: '0', variacaoPct: null, economia90d: '0' },
        topProdutos: [],
        topEmpresas: [],
      })
    })
  )
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

  await user.click(screen.getByRole('button', { name: 'Aberta' }))

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

test('a faixa do dashboard aparece e o atalho de "precisa de ação" filtra a lista de cotações', async () => {
  renderPage()
  // Wait for the dashboard to render completely
  const btn = await screen.findByRole('button', { name: /Encerradas sem apurar/i })
  expect(btn).toBeInTheDocument()
  
  const user = userEvent.setup()
  await user.click(btn)

  // O filtro selecionado agora deve ser ENCERRADA, ou seja, nenhum item na tabela (pois nenhum mockado tem ENCERRADA)
  // Or actually, wait, the text says "Nenhuma cotação para esse filtro"
  expect(await screen.findByText('Nenhuma cotação para esse filtro')).toBeInTheDocument()
})

test('a lista de cotações segue funcionando quando a análise falha', async () => {
  renderPage(true)
  expect(await screen.findByRole('link', { name: 'Compra semanal' })).toBeInTheDocument()
  // The dashboard should not render its "Visão geral" text if it errored
  expect(screen.queryByText('Visão geral')).not.toBeInTheDocument()
})
