import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { NovaCotacaoPage } from './NovaCotacaoPage'

function renderPage(cotacoes: unknown[] = []) {
  server.use(http.get('*/api/cotacoes', () => HttpResponse.json(cotacoes)))
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

test('alternar entre "Em branco" e "Duplicar existente" troca o campo exibido', async () => {
  const user = userEvent.setup()
  renderPage()

  expect(screen.getByLabelText('Título')).toBeInTheDocument()
  expect(screen.queryByLabelText('Cotação de origem')).not.toBeInTheDocument()

  await user.click(screen.getByRole('tab', { name: 'Duplicar existente' }))
  expect(screen.queryByLabelText('Título')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Cotação de origem')).toBeInTheDocument()

  await user.click(screen.getByRole('tab', { name: 'Em branco' }))
  expect(screen.getByLabelText('Título')).toBeInTheDocument()
  expect(screen.queryByLabelText('Cotação de origem')).not.toBeInTheDocument()
})

test('duplicar no modo "Duplicar existente" chama a mutation e navega para a cópia', async () => {
  server.use(
    http.post('*/api/cotacoes/c-9/duplicar', () =>
      HttpResponse.json({
        cotacao: {
          id: 'nova-9',
          titulo: 'Compra anterior (cópia)',
          status: 'RASCUNHO',
          prazo: null,
          criadaEm: '2026-08-28T12:00:00Z',
          encerradaEm: null,
          itens: [],
        },
        omitidos: [],
      }),
    ),
  )
  const user = userEvent.setup()
  renderPage([
    {
      id: 'c-9',
      titulo: 'Compra anterior',
      status: 'ENCERRADA',
      prazo: null,
      criadaEm: '2026-08-28T12:00:00Z',
      encerradaEm: null,
    },
  ])

  await user.click(screen.getByRole('tab', { name: 'Duplicar existente' }))
  await user.click(screen.getByLabelText('Cotação de origem'))
  await user.click(screen.getByRole('option', { name: 'Compra anterior' }))
  await user.click(screen.getByRole('button', { name: /duplicar cotação/i }))

  expect(await screen.findByText('detalhe')).toBeInTheDocument()
})
