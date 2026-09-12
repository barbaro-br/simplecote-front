import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { PedidosPage } from './PedidosPage'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/admin/pedidos', element: <PedidosPage /> },
      { path: '/admin/pedidos-avulsos/novo', element: <div>tela de pedido avulso</div> },
    ],
    { initialEntries: ['/admin/pedidos'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

const pedidoBase = {
  id: 'p1',
  origem: 'APURADO' as const,
  status: 'GERADO',
  empresaNome: 'Fornecedor A',
  total: 100,
  quantidadeItens: 2,
  condicaoPagamento: '14/21/28',
  prazoEntregaEstimado: '5 dias úteis',
  geradoEm: '2026-09-12T12:00:00Z',
}

test('agrupa pedidos por cotação', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [
          {
            cotacaoId: 'c1',
            tituloCotacao: 'Compra semanal',
            pedidos: [{ ...pedidoBase, id: 'p1' }, { ...pedidoBase, id: 'p2' }],
          },
          {
            cotacaoId: 'c2',
            tituloCotacao: 'Compra de hortifruti',
            pedidos: [{ ...pedidoBase, id: 'p3' }],
          },
        ],
        avulsos: [],
      }),
    ),
  )
  renderPage()

  expect(await screen.findByText('Compra semanal')).toBeInTheDocument()
  expect(screen.getByText('Compra de hortifruti')).toBeInTheDocument()
  expect(screen.getAllByText('Fornecedor A')).toHaveLength(3)
})

test('avulsos aparecem numa seção própria', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [{ cotacaoId: 'c1', tituloCotacao: 'Compra semanal', pedidos: [{ ...pedidoBase, id: 'p1' }] }],
        avulsos: [
          { ...pedidoBase, id: 'a1', origem: 'AVULSO', empresaNome: null },
          { ...pedidoBase, id: 'a2', origem: 'AVULSO', empresaNome: null },
        ],
      }),
    ),
  )
  renderPage()

  expect(await screen.findByText('Avulsos')).toBeInTheDocument()
  expect(screen.getAllByText(/Pedido avulso —/)).toHaveLength(2)
})

test('campos ausentes mostram traço', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [
          {
            cotacaoId: 'c1',
            tituloCotacao: 'Compra semanal',
            pedidos: [{ ...pedidoBase, condicaoPagamento: null, prazoEntregaEstimado: null }],
          },
        ],
        avulsos: [],
      }),
    ),
  )
  renderPage()

  expect(await screen.findByText(/Cond\.: — · Prazo: —/)).toBeInTheDocument()
})

test('estado vazio convida a criar pedido avulso ou apurar cotação', async () => {
  server.use(http.get('*/api/pedidos', () => HttpResponse.json({ grupos: [], avulsos: [] })))
  renderPage()

  expect(await screen.findByText('Nenhum pedido ainda')).toBeInTheDocument()
})

test('botão "Novo pedido" navega para a tela de pedido avulso', async () => {
  server.use(http.get('*/api/pedidos', () => HttpResponse.json({ grupos: [], avulsos: [] })))
  const user = userEvent.setup()
  renderPage()

  await user.click((await screen.findAllByRole('button', { name: 'Novo pedido' }))[0])

  expect(await screen.findByText('tela de pedido avulso')).toBeInTheDocument()
})
