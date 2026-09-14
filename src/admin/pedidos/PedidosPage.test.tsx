import { render, screen, within } from '@testing-library/react'
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

const itemBase = {
  id: 'it1',
  itemCotacaoId: 'ic1',
  lanceId: null,
  nomeSnapshot: 'Arroz Tipo 1 5kg',
  unidadeSnapshot: 'Fardo com 6',
  quantidadePorEmbalagemSnapshot: 6,
  quantidade: 2,
  precoEmbalagem: 30,
  precoUnitario: 5,
  subtotal: 60,
}

test('agrupa pedidos por cotação num cartão e mostra as empresas ao abrir', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [
          {
            cotacaoId: 'c1',
            tituloCotacao: 'Compra semanal',
            pedidos: [{ ...pedidoBase, id: 'p1' }, { ...pedidoBase, id: 'p2', empresaNome: 'Fornecedor B' }],
          },
        ],
        avulsos: [],
      }),
    ),
    http.get('*/api/cotacoes/c1/pedidos', () =>
      HttpResponse.json([
        { ...pedidoBase, id: 'p1', cotacaoId: 'c1', participanteId: 'x1', enviadoEm: null, confirmadoEm: null, observacao: null, itens: [itemBase] },
        {
          ...pedidoBase,
          id: 'p2',
          cotacaoId: 'c1',
          participanteId: 'x2',
          empresaNome: 'Fornecedor B',
          enviadoEm: null,
          confirmadoEm: null,
          observacao: null,
          itens: [itemBase],
        },
      ]),
    ),
  )
  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByText('Compra semanal')).toBeInTheDocument()
  expect(screen.getByText('2 empresas')).toBeInTheDocument()

  await user.click(screen.getByText('Compra semanal'))

  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText('Fornecedor A')).toBeInTheDocument()
  expect(within(dialog).getByText('Fornecedor B')).toBeInTheDocument()
})

test('entrar numa empresa mostra os itens do pedido e as ações reais (PDF/planilha/e-mail)', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [{ cotacaoId: 'c1', tituloCotacao: 'Compra semanal', pedidos: [{ ...pedidoBase, id: 'p1' }] }],
        avulsos: [],
      }),
    ),
    http.get('*/api/cotacoes/c1/pedidos', () =>
      HttpResponse.json([
        { ...pedidoBase, id: 'p1', cotacaoId: 'c1', participanteId: 'x1', enviadoEm: null, confirmadoEm: null, observacao: null, itens: [itemBase] },
      ]),
    ),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByText('Compra semanal'))
  const dialog = await screen.findByRole('dialog')
  await user.click(within(dialog).getByText('Fornecedor A'))

  expect(await within(dialog).findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: /Baixar PDF/ })).toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: /Reenviar e-mail/ })).toBeInTheDocument()
})

test('avulsos aparecem agrupados por mês, num cartão próprio', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [],
        avulsos: [
          { ...pedidoBase, id: 'a1', origem: 'AVULSO', status: 'FECHADO', geradoEm: '2026-09-05T10:00:00Z' },
          { ...pedidoBase, id: 'a2', origem: 'AVULSO', status: 'FECHADO', empresaNome: 'Fornecedor C', geradoEm: '2026-09-20T10:00:00Z' },
          { ...pedidoBase, id: 'a3', origem: 'AVULSO', status: 'ABERTO', empresaNome: 'Fornecedor D', geradoEm: '2026-08-01T10:00:00Z' },
        ],
      }),
    ),
  )
  renderPage()

  expect(await screen.findByText(/Avulsos — Setembro de 2026/)).toBeInTheDocument()
  expect(screen.getByText('2 pedidos')).toBeInTheDocument()
  expect(screen.getByText(/Avulsos — Agosto de 2026/)).toBeInTheDocument()
  expect(screen.getByText('1 pedido')).toBeInTheDocument()
})

test('abrir um pedido avulso mostra os itens dele (sem PDF/e-mail, que o back não oferece pra avulso)', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [],
        avulsos: [{ ...pedidoBase, id: 'a1', origem: 'AVULSO', status: 'FECHADO', geradoEm: '2026-09-05T10:00:00Z' }],
      }),
    ),
    http.get('*/api/pedidos/avulsos/a1', () =>
      HttpResponse.json({
        id: 'a1',
        status: 'FECHADO',
        itens: [
          {
            id: 'i1',
            produtoId: 'prod1',
            nomeSnapshot: 'Sardinha X',
            unidadeSnapshot: 'Caixa com 50',
            quantidadePorEmbalagemSnapshot: 50,
            precoEmbalagem: 40,
            precoUnitario: 0.8,
            quantidade: 3,
          },
        ],
        quantidadeItens: 1,
        total: 100,
        geradoEm: '2026-09-05T10:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: '5 dias úteis',
        empresaNome: 'Fornecedor A',
        representanteNome: null,
      }),
    ),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByText(/Avulsos — Setembro de 2026/))
  const dialog = await screen.findByRole('dialog')
  await user.click(within(dialog).getByText('Fornecedor A'))

  expect(await within(dialog).findByText('Sardinha X')).toBeInTheDocument()
  expect(within(dialog).queryByRole('button', { name: /Baixar PDF/ })).not.toBeInTheDocument()
  expect(within(dialog).queryByRole('button', { name: /Reenviar e-mail/ })).not.toBeInTheDocument()
})

test('filtro de origem esconde cotações ou avulsos', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [{ cotacaoId: 'c1', tituloCotacao: 'Compra semanal', pedidos: [{ ...pedidoBase, id: 'p1' }] }],
        avulsos: [{ ...pedidoBase, id: 'a1', origem: 'AVULSO', status: 'FECHADO', geradoEm: '2026-09-05T10:00:00Z' }],
      }),
    ),
  )
  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByText('Compra semanal')).toBeInTheDocument()
  expect(screen.getByText(/Avulsos — Setembro de 2026/)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Avulsos', pressed: false }))

  expect(screen.queryByText('Compra semanal')).not.toBeInTheDocument()
  expect(screen.getByText(/Avulsos — Setembro de 2026/)).toBeInTheDocument()
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
