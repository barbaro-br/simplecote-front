import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { NovaCotacaoPage } from './NovaCotacaoPage'

function renderPage() {
  server.use(http.get('*/api/cotacoes', () => HttpResponse.json([])))
  const router = createMemoryRouter(
    [
      { path: '/admin/cotacoes/nova', element: <NovaCotacaoPage /> },
      { path: '/admin/cotacoes/:id', element: <div>detalhe</div> },
    ],
    { initialEntries: ['/admin/cotacoes/nova'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

test('criar com título válido navega para o detalhe', async () => {
  server.use(
    http.post('*/api/cotacoes', async ({ request }) => {
      const body = (await request.json()) as { titulo: string }
      return HttpResponse.json(
        { id: 'nova-1', titulo: body.titulo, status: 'RASCUNHO', prazo: null, criadaEm: '2026-08-28T12:00:00Z', encerradaEm: null, itens: [] },
        { status: 201 },
      )
    }),
  )
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Título'), 'Compra semanal')
  await user.click(screen.getByRole('button', { name: /criar cotação/i }))

  expect(await screen.findByText('detalhe')).toBeInTheDocument()
})

test('título vazio bloqueia o envio', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /criar cotação/i }))

  expect(await screen.findByText('Informe o título da cotação')).toBeInTheDocument()
  expect(screen.queryByText('detalhe')).not.toBeInTheDocument()
})
