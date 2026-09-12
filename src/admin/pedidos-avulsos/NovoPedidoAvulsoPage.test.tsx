import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { NovoPedidoAvulsoPage } from './NovoPedidoAvulsoPage'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const APOS_DEBOUNCE = 400

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/pedidos-avulsos/novo']}>
        <NovoPedidoAvulsoPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function sugestoesHandler(porTermo: Record<string, { doProprioCatalogo?: unknown[]; doCatalogoGlobal?: unknown[] }>) {
  return http.get('*/api/produtos/sugestoes', ({ request }) => {
    const q = new URL(request.url).searchParams.get('q') ?? ''
    const achado = porTermo[q]
    return HttpResponse.json(achado ?? { doProprioCatalogo: [], doCatalogoGlobal: [] })
  })
}

const SARDINHA = {
  id: 'p-sardinha',
  nome: 'Sardinha X',
  codigoBarras: null,
  unidade: 'Caixa',
  quantidadePorEmbalagem: 50,
  ativo: true,
}

const REFRIGERANTE = {
  id: 'p-refri',
  nome: 'Refrigerante Lata',
  codigoBarras: null,
  unidade: 'Unidade',
  quantidadePorEmbalagem: 1,
  ativo: true,
}

async function buscarESelecionar(user: ReturnType<typeof userEvent.setup>, termo: string, nomeProduto: string) {
  const campo = screen.getByPlaceholderText(/Buscar produto/i)
  await user.clear(campo)
  await user.type(campo, termo)
  await sleep(APOS_DEBOUNCE)
  await user.click(await screen.findByText(nomeProduto))
}

test('abre vazia: sem itens, "Fechar pedido" desabilitado', async () => {
  renderPage()

  expect(screen.getByRole('heading', { name: 'Novo pedido avulso' })).toBeInTheDocument()
  expect(screen.getByText('Nenhum item adicionado ainda.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Fechar pedido' })).toBeDisabled()
})

test('item com embalagem de mais de uma unidade deriva preço unitário e total da linha', async () => {
  server.use(sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }))
  const user = userEvent.setup()
  renderPage()

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')

  expect(await screen.findByText(/R\$\s*2,50/)).toBeInTheDocument()
  expect(screen.getByText(/R\$\s*250,00/)).toBeInTheDocument()
})

test('item de unidade única deriva preço unitário igual ao preço informado', async () => {
  server.use(sugestoesHandler({ refri: { doProprioCatalogo: [REFRIGERANTE] } }))
  const user = userEvent.setup()
  renderPage()

  await buscarESelecionar(user, 'refri', 'Refrigerante Lata')
  await user.type(screen.getByLabelText('Preço da embalagem'), '8.90')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '3')

  expect(await screen.findByText(/R\$\s*8,90/)).toBeInTheDocument()
  expect(screen.getByText(/R\$\s*26,70/)).toBeInTheDocument()
})

test('primeiro item cria o pedido; segundo item reaproveita o id e a lista/total acompanham a soma', async () => {
  server.use(
    sugestoesHandler({
      sardinha: { doProprioCatalogo: [SARDINHA] },
      refri: { doProprioCatalogo: [REFRIGERANTE] },
    }),
  )
  const chamadas: string[] = []
  server.use(
    http.post('*/api/pedidos/avulsos', async ({ request }) => {
      chamadas.push('criar')
      const body = (await request.json()) as any
      expect(body).toEqual({ produtoId: 'p-sardinha', precoEmbalagem: 125, quantidade: 2 })
      return HttpResponse.json(
        {
          id: 'ped-1',
          status: 'ABERTO',
          itens: [
            {
              id: 'item-1',
              produtoId: 'p-sardinha',
              nomeSnapshot: 'Sardinha X',
              unidadeSnapshot: 'Caixa',
              quantidadePorEmbalagemSnapshot: 50,
              precoEmbalagem: 125,
              precoUnitario: 2.5,
              quantidade: 2,
              subtotal: 250,
            },
          ],
          quantidadeItens: 1,
          total: 250,
          geradoEm: '2026-09-12T12:00:00Z',
        },
        { status: 201 },
      )
    }),
    http.post('*/api/pedidos/avulsos/:id/itens', async ({ request, params }) => {
      chamadas.push(`item:${params.id}`)
      const body = (await request.json()) as any
      expect(body).toEqual({ produtoId: 'p-refri', precoEmbalagem: 8.9, quantidade: 3 })
      return HttpResponse.json({
        id: 'ped-1',
        status: 'ABERTO',
        itens: [
          {
            id: 'item-1',
            produtoId: 'p-sardinha',
            nomeSnapshot: 'Sardinha X',
            unidadeSnapshot: 'Caixa',
            quantidadePorEmbalagemSnapshot: 50,
            precoEmbalagem: 125,
            precoUnitario: 2.5,
            quantidade: 2,
            subtotal: 250,
          },
          {
            id: 'item-2',
            produtoId: 'p-refri',
            nomeSnapshot: 'Refrigerante Lata',
            unidadeSnapshot: 'Unidade',
            quantidadePorEmbalagemSnapshot: 1,
            precoEmbalagem: 8.9,
            precoUnitario: 8.9,
            quantidade: 3,
            subtotal: 26.7,
          },
        ],
        quantidadeItens: 2,
        total: 276.7,
        geradoEm: '2026-09-12T12:00:00Z',
      })
    }),
  )

  const user = userEvent.setup()
  renderPage()

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))

  expect(await screen.findByText('Sardinha X')).toBeInTheDocument()
  expect(screen.getByText('1 item')).toBeInTheDocument()

  await buscarESelecionar(user, 'refri', 'Refrigerante Lata')
  await user.type(screen.getByLabelText('Preço da embalagem'), '8.90')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '3')
  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))

  expect(await screen.findByText('Refrigerante Lata')).toBeInTheDocument()
  expect(screen.getByText('2 itens')).toBeInTheDocument()
  expect(screen.getByText(/R\$\s*276,70/)).toBeInTheDocument()

  expect(chamadas).toEqual(['criar', 'item:ped-1'])
})

test('fechar exige confirmação nomeando total e contagem, e trava novos itens após fechar', async () => {
  server.use(sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }))
  server.use(
    http.post('*/api/pedidos/avulsos', () =>
      HttpResponse.json(
        {
          id: 'ped-2',
          status: 'ABERTO',
          itens: [
            {
              id: 'item-1',
              produtoId: 'p-sardinha',
              nomeSnapshot: 'Sardinha X',
              unidadeSnapshot: 'Caixa',
              quantidadePorEmbalagemSnapshot: 50,
              precoEmbalagem: 125,
              precoUnitario: 2.5,
              quantidade: 2,
              subtotal: 250,
            },
          ],
          quantidadeItens: 1,
          total: 250,
          geradoEm: '2026-09-12T12:00:00Z',
        },
        { status: 201 },
      ),
    ),
    http.post('*/api/pedidos/avulsos/:id/fechar', ({ params }) => {
      expect(params.id).toBe('ped-2')
      return HttpResponse.json({
        id: 'ped-2',
        status: 'FECHADO',
        itens: [
          {
            id: 'item-1',
            produtoId: 'p-sardinha',
            nomeSnapshot: 'Sardinha X',
            unidadeSnapshot: 'Caixa',
            quantidadePorEmbalagemSnapshot: 50,
            precoEmbalagem: 125,
            precoUnitario: 2.5,
            quantidade: 2,
            subtotal: 250,
          },
        ],
        quantidadeItens: 1,
        total: 250,
        geradoEm: '2026-09-12T12:00:00Z',
      })
    }),
  )

  const user = userEvent.setup()
  renderPage()

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
  expect(await screen.findByText('Sardinha X')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Fechar pedido' }))

  const dialog = within(screen.getByRole('dialog'))
  expect(dialog.getByText(/1 item, total R\$\s*250,00/)).toBeInTheDocument()
  await user.click(dialog.getByRole('button', { name: 'Fechar pedido' }))

  expect(await screen.findByRole('heading', { name: 'Pedido avulso fechado' })).toBeInTheDocument()
  expect(screen.getByText(/pedido ped-2/)).toBeInTheDocument()
  expect(screen.queryByPlaceholderText(/Buscar produto/i)).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Fechar pedido' })).not.toBeInTheDocument()
})

test('fluxo completo: dois itens de embalagens diferentes, total geral e confirmação final', async () => {
  server.use(
    sugestoesHandler({
      sardinha: { doProprioCatalogo: [SARDINHA] },
      refri: { doProprioCatalogo: [REFRIGERANTE] },
    }),
  )
  server.use(
    http.post('*/api/pedidos/avulsos', () =>
      HttpResponse.json(
        {
          id: 'ped-3',
          status: 'ABERTO',
          itens: [
            {
              id: 'item-1',
              produtoId: 'p-sardinha',
              nomeSnapshot: 'Sardinha X',
              unidadeSnapshot: 'Caixa',
              quantidadePorEmbalagemSnapshot: 50,
              precoEmbalagem: 125,
              precoUnitario: 2.5,
              quantidade: 2,
              subtotal: 250,
            },
          ],
          quantidadeItens: 1,
          total: 250,
          geradoEm: '2026-09-12T12:00:00Z',
        },
        { status: 201 },
      ),
    ),
    http.post('*/api/pedidos/avulsos/:id/itens', () =>
      HttpResponse.json({
        id: 'ped-3',
        status: 'ABERTO',
        itens: [
          {
            id: 'item-1',
            produtoId: 'p-sardinha',
            nomeSnapshot: 'Sardinha X',
            unidadeSnapshot: 'Caixa',
            quantidadePorEmbalagemSnapshot: 50,
            precoEmbalagem: 125,
            precoUnitario: 2.5,
            quantidade: 2,
            subtotal: 250,
          },
          {
            id: 'item-2',
            produtoId: 'p-refri',
            nomeSnapshot: 'Refrigerante Lata',
            unidadeSnapshot: 'Unidade',
            quantidadePorEmbalagemSnapshot: 1,
            precoEmbalagem: 8.9,
            precoUnitario: 8.9,
            quantidade: 3,
            subtotal: 26.7,
          },
        ],
        quantidadeItens: 2,
        total: 276.7,
        geradoEm: '2026-09-12T12:00:00Z',
      }),
    ),
    http.post('*/api/pedidos/avulsos/:id/fechar', () =>
      HttpResponse.json({
        id: 'ped-3',
        status: 'FECHADO',
        itens: [],
        quantidadeItens: 2,
        total: 276.7,
        geradoEm: '2026-09-12T12:00:00Z',
      }),
    ),
  )

  const user = userEvent.setup()
  renderPage()

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
  expect(await screen.findByText('Sardinha X')).toBeInTheDocument()

  await buscarESelecionar(user, 'refri', 'Refrigerante Lata')
  await user.type(screen.getByLabelText('Preço da embalagem'), '8.90')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '3')
  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
  expect(await screen.findByText('Refrigerante Lata')).toBeInTheDocument()

  expect(screen.getByText(/R\$\s*276,70/)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Fechar pedido' }))
  const dialog = within(screen.getByRole('dialog'))
  await user.click(dialog.getByRole('button', { name: 'Fechar pedido' }))

  expect(await screen.findByRole('heading', { name: 'Pedido avulso fechado' })).toBeInTheDocument()
  expect(screen.getByText(/R\$\s*276,70/)).toBeInTheDocument()
  expect(screen.getByText(/pedido ped-3/)).toBeInTheDocument()
})
