import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider, useSearchParams } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { DashboardPage } from './DashboardPage'

function ListaMarker() {
  const [searchParams] = useSearchParams()
  return <div>lista filtrada {searchParams.get('status')}</div>
}

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/admin', element: <DashboardPage /> },
      { path: '/admin/cotacoes', element: <ListaMarker /> },
    ],
    { initialEntries: ['/admin'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

test('renderiza o monitor e o atalho navega para a lista filtrada', async () => {
  server.use(
    http.get('*/api/analises/dashboard', () =>
      HttpResponse.json({
        porStatus: { rascunho: 1, aberta: 2, encerrada: 1, apurada: 0, cancelada: 0 },
        encerradasSemApurar: 3,
        apuradasSemPedidoEnviado: 0,
        proximosPrazos: [],
        gastoMes: 1000,
        gastoMesAnterior: 500,
        economiaEstimada90d: 200,
        topProdutos: [],
        topEmpresas: [],
      })
    )
  )

  renderPage()

  expect(await screen.findByText('Economia estimada (90 dias)')).toBeInTheDocument()

  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: /encerradas sem apurar/i }))

  expect(await screen.findByText('lista filtrada ENCERRADA')).toBeInTheDocument()
})
