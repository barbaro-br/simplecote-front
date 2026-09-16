import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { PedidosPageV2 } from './PedidosPageV2'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/admin/pedidos', element: <PedidosPageV2 /> },
      { path: '/admin/pedidos-avulsos/novo', element: <div>tela de pedido avulso</div> },
      { path: '/admin/pedidos-avulsos/:id', element: <div>detalhe pedido avulso</div> },
    ],
    { initialEntries: ['/admin/pedidos'] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  server.use(
    http.get('*/api/empresas', () => HttpResponse.json([])),
    http.get('*/api/representantes', () => HttpResponse.json([])),
    http.get('*/api/condicoes-pagamento', () => HttpResponse.json([])),
  )
})

const pedidoBase = {
  id: 'p1',
  origem: 'APURADO' as const,
  status: 'GERADO',
  empresaNome: 'Fornecedor Vencedor',
  total: 450,
  quantidadeItens: 2,
  condicaoPagamento: '28 dias',
  prazoEntregaEstimado: '3 dias úteis',
  geradoEm: '2026-09-12T12:00:00Z',
}

const itemBase = {
  id: 'it1',
  itemCotacaoId: 'ic1',
  lanceId: null,
  nomeSnapshot: 'Óleo de Soja 900ml',
  unidadeSnapshot: 'Caixa com 20',
  quantidadePorEmbalagemSnapshot: 20,
  quantidade: 5,
  precoEmbalagem: 90,
  precoUnitario: 4.5,
  subtotal: 450,
}

test('renderiza as seções de cotações e avulsos no estilo planilha contábil', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [
          {
            cotacaoId: 'c1',
            tituloCotacao: 'Cotação Mantimentos Semanal',
            pedidos: [pedidoBase],
          },
        ],
        avulsos: [
          {
            id: 'a1',
            origem: 'AVULSO',
            status: 'FECHADO',
            empresaNome: 'Distribuidora Central',
            total: 300,
            quantidadeItens: 1,
            condicaoPagamento: 'À vista',
            prazoEntregaEstimado: '1 dia',
            geradoEm: '2026-09-10T10:00:00Z',
          },
        ],
      }),
    ),
  )

  renderPage()

  expect(await screen.findByText('Pedidos')).toBeInTheDocument()
  expect(screen.getByText('Gestão de Compras')).toBeInTheDocument()
  expect(await screen.findByText('Cotação Mantimentos Semanal')).toBeInTheDocument()
  expect(await screen.findByText('Distribuidora Central')).toBeInTheDocument()
})

test('expande accordion de cotação (nível 1) e empresa (nível 2) exibindo itens da planilha (nível 3)', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [
          {
            cotacaoId: 'c1',
            tituloCotacao: 'Cotação Mantimentos Semanal',
            pedidos: [pedidoBase],
          },
        ],
        avulsos: [],
      }),
    ),
    http.get('*/api/cotacoes/c1/pedidos', () =>
      HttpResponse.json([
        {
          ...pedidoBase,
          id: 'p1',
          cotacaoId: 'c1',
          participanteId: 'part1',
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

  // Nível 1: Clica na faixa da cotação
  const faixaCotacao = await screen.findByText('Cotação Mantimentos Semanal')
  await user.click(faixaCotacao)

  // Nível 2: A empresa vencedora aparece
  const faixaEmpresa = await screen.findByText('Fornecedor Vencedor')
  expect(faixaEmpresa).toBeInTheDocument()

  // Nível 3: Clica na faixa da empresa para expandir a planilha com os itens
  await user.click(faixaEmpresa)

  expect(await screen.findByText('Óleo de Soja 900ml')).toBeInTheDocument()
  expect(screen.getByText('Caixa com 20')).toBeInTheDocument()
})

test('filtra por tipo de pedido e permite buscar por texto', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [
          {
            cotacaoId: 'c1',
            tituloCotacao: 'Cotação Hortifruti',
            pedidos: [pedidoBase],
          },
        ],
        avulsos: [
          {
            id: 'a1',
            origem: 'AVULSO',
            status: 'ABERTO',
            empresaNome: 'Empresa Bebidas',
            total: 150,
            quantidadeItens: 2,
            condicaoPagamento: 'Boleto 15d',
            prazoEntregaEstimado: null,
            geradoEm: '2026-09-14T08:00:00Z',
          },
        ],
      }),
    ),
  )

  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByText('Cotação Hortifruti')).toBeInTheDocument()
  expect(screen.getByText('Empresa Bebidas')).toBeInTheDocument()

  // Filtra só para avulsos
  await user.click(screen.getByRole('button', { name: 'Fora de cotação (Avulsos)' }))
  expect(screen.queryByText('Cotação Hortifruti')).not.toBeInTheDocument()
  expect(screen.getByText('Empresa Bebidas')).toBeInTheDocument()

  // Volta para todos e busca por texto
  await user.click(screen.getByRole('button', { name: 'Todos os pedidos' }))
  const inputBusca = screen.getByRole('searchbox', { name: 'Buscar pedidos' })
  await user.type(inputBusca, 'Hortifruti')

  expect(screen.getByText('Cotação Hortifruti')).toBeInTheDocument()
  expect(screen.queryByText('Empresa Bebidas')).not.toBeInTheDocument()
})

test('botão "Novo pedido avulso" abre o modal de configuração de pedido', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [],
        avulsos: [],
      }),
    ),
    http.get('*/api/empresas', () => HttpResponse.json([])),
    http.get('*/api/representantes', () => HttpResponse.json([])),
    http.get('*/api/condicoes-pagamento', () => HttpResponse.json([])),
  )

  const user = userEvent.setup()
  renderPage()

  const btnNovo = await screen.findByRole('button', { name: /Novo pedido avulso/i })
  await user.click(btnNovo)

  expect(await screen.findByRole('dialog', { name: /Configurar novo pedido avulso/i })).toBeInTheDocument()
})

test('pedido avulso em aberto permite excluir via diálogo de confirmação', async () => {
  let excluiu = false
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [],
        avulsos: [
          {
            id: 'avulso-delete-1',
            origem: 'AVULSO',
            status: 'ABERTO',
            empresaNome: 'Fornecedor Provisório',
            total: 200,
            quantidadeItens: 1,
            condicaoPagamento: 'À vista',
            prazoEntregaEstimado: null,
            geradoEm: '2026-09-14T08:00:00Z',
          },
        ],
      }),
    ),
    http.delete('*/api/pedidos/avulsos/avulso-delete-1', () => {
      excluiu = true
      return new HttpResponse(null, { status: 204 })
    }),
  )

  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByText('Fornecedor Provisório')).toBeInTheDocument()

  const btnExcluir = screen.getByRole('button', { name: 'Excluir pedido avulso' })
  await user.click(btnExcluir)

  const dialog = screen.getByRole('dialog', { name: 'Excluir pedido avulso' })
  expect(dialog).toBeInTheDocument()
  expect(dialog).toHaveTextContent(/Tem certeza que deseja excluir este pedido avulso em aberto/i)

  await user.click(screen.getByRole('button', { name: 'Sim, excluir pedido' }))
  expect(excluiu).toBe(true)
})

test('pedido avulso fechado exibe ações de PDF, envio e visualização no acordeão', async () => {
  server.use(
    http.get('*/api/pedidos', () =>
      HttpResponse.json({
        grupos: [],
        avulsos: [
          {
            id: 'avulso-fechado-1',
            origem: 'AVULSO',
            status: 'FECHADO',
            empresaNome: 'Fornecedor Fechado',
            total: 500,
            quantidadeItens: 2,
            condicaoPagamento: '30 dias',
            prazoEntregaEstimado: null,
            geradoEm: '2026-09-14T08:00:00Z',
          },
        ],
      }),
    ),
    http.get('*/api/pedidos/avulsos/avulso-fechado-1', () =>
      HttpResponse.json({
        id: 'avulso-fechado-1',
        status: 'FECHADO',
        empresaNome: 'Fornecedor Fechado',
        representanteNome: 'Vendedor Marcos',
        total: 500,
        quantidadeItens: 1,
        itens: [
          {
            id: 'item-1',
            produtoId: 'prod-1',
            nomeSnapshot: 'Açúcar Cristal 5kg',
            unidadeSnapshot: 'Fardo c/ 6',
            quantidadePorEmbalagemSnapshot: 6,
            quantidade: 2,
            precoUnitario: 50,
            subtotal: 500,
          },
        ],
      }),
    ),
  )

  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByText('Fornecedor Fechado')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Baixar PDF' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reenviar e-mail' })).toBeInTheDocument()

  // Expande o menu sanfona do pedido avulso
  await user.click(screen.getByText('Fornecedor Fechado'))

  expect(await screen.findByText('Açúcar Cristal 5kg')).toBeInTheDocument()
  expect(screen.getByText(/Vendedor Marcos/)).toBeInTheDocument()
})
