import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { Toaster } from 'sonner'
import { server } from '@/setupTests'
import { NovoPedidoAvulsoPage } from './NovoPedidoAvulsoPage'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const APOS_DEBOUNCE = 400

function renderPage(caminhoInicial = '/admin/pedidos-avulsos/ped-1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: '/admin/pedidos-avulsos/novo', element: <NovoPedidoAvulsoPage /> },
      { path: '/admin/pedidos-avulsos/:id', element: <NovoPedidoAvulsoPage /> },
      { path: '/admin/pedidos', element: <div data-testid="tela-pedidos">Lista de Pedidos</div> },
    ],
    { initialEntries: [caminhoInicial] },
  )
  render(
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router }
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

async function abrirModalItem(user: ReturnType<typeof userEvent.setup>) {
  if (screen.queryByRole('dialog', { name: /adicionar item/i })) return
  await user.click(await screen.findByRole('button', { name: /adicionar item/i }))
  await screen.findByRole('dialog', { name: /adicionar item/i })
}

async function buscarESelecionar(user: ReturnType<typeof userEvent.setup>, termo: string, nomeProduto: string) {
  await abrirModalItem(user)
  const campo = screen.getByPlaceholderText(/Buscar produto/i)
  await user.clear(campo)
  await user.type(campo, termo)
  await sleep(APOS_DEBOUNCE)
  await user.click(await screen.findByText(nomeProduto))
}

function fecharModal(user: ReturnType<typeof userEvent.setup>) {
  const dialog = screen.queryByRole('dialog', { name: /adicionar item/i })
  if (!dialog) return Promise.resolve()
  return user.click(
    within(dialog).getByRole('button', { name: 'Concluído' }),
  )
}

function confirmarItemNoModal(user: ReturnType<typeof userEvent.setup>) {
  return user.click(
    within(screen.getByRole('dialog', { name: /adicionar item/i })).getByRole('button', { name: 'Adicionar item' }),
  )
}

beforeEach(() => {
  server.use(
    http.get('*/api/produtos', () => HttpResponse.json([SARDINHA, REFRIGERANTE])),
    http.get('*/api/pedidos/avulsos/:id', ({ params }) =>
      HttpResponse.json({
        id: params.id,
        status: 'ABERTO',
        itens: [],
        quantidadeItens: 0,
        total: 0,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
  )
})

test('sem rotaId (/novo), redireciona imediatamente para /admin/pedidos com aviso', async () => {
  const { router } = renderPage('/admin/pedidos-avulsos/novo')
  await screen.findByTestId('tela-pedidos')
  expect(router.state.location.pathname).toBe('/admin/pedidos')
  expect(await screen.findByText(/Inicie o pedido pelo botão "Novo pedido avulso"/i)).toBeInTheDocument()
})

test('ao carregar pedido, exibe cabeçalho somente-leitura com empresa, representante, condição e prazo', async () => {
  server.use(
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({
        id: 'ped-1',
        status: 'ABERTO',
        itens: [],
        quantidadeItens: 0,
        total: 0,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '30 dias',
        prazoEntregaEstimado: '5 dias úteis',
        empresaNome: 'Empresa ABC',
        representanteNome: 'Carlos Rep',
      }),
    ),
  )

  renderPage('/admin/pedidos-avulsos/ped-1')

  expect(await screen.findByText('Empresa ABC')).toBeInTheDocument()
  expect(screen.getByText('Carlos Rep')).toBeInTheDocument()
  expect(screen.getByText('30 dias')).toBeInTheDocument()
  expect(screen.getByText('5 dias úteis')).toBeInTheDocument()
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

test('primeiro item confirmado; segundo item reaproveita o id e a lista/total acompanham a soma', async () => {
  server.use(
    sugestoesHandler({
      sardinha: { doProprioCatalogo: [SARDINHA] },
      refri: { doProprioCatalogo: [REFRIGERANTE] },
    }),
  )
  const chamadas: string[] = []
  server.use(
    http.post('*/api/pedidos/avulsos/:id/itens', async ({ request, params }) => {
      const body = (await request.json()) as any
      chamadas.push(`item:${params.id}`)
      if (chamadas.length === 1) {
        expect(body).toEqual({ produtoId: 'p-sardinha', precoEmbalagem: 125, quantidade: 2 })
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
          ],
          quantidadeItens: 1,
          total: 250,
          geradoEm: '2026-09-12T12:00:00Z',
          condicaoPagamento: '14/21/28',
          prazoEntregaEstimado: null,
          empresaNome: 'Empresa A',
          representanteNome: 'João Rep',
        })
      }
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
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      })
    }),
  )

  const user = userEvent.setup()
  renderPage()

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)

  expect(await screen.findByText('Sardinha X')).toBeInTheDocument()
  expect(screen.getByText('1 item')).toBeInTheDocument()

  await buscarESelecionar(user, 'refri', 'Refrigerante Lata')
  await user.type(screen.getByLabelText('Preço da embalagem'), '8.90')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '3')
  await confirmarItemNoModal(user)
  expect(await screen.findByText('Refrigerante Lata')).toBeInTheDocument()
  await fecharModal(user)

  expect(screen.getByText('2 itens')).toBeInTheDocument()
  expect(screen.getByText(/R\$\s*276,70/)).toBeInTheDocument()
  expect(chamadas).toEqual(['item:ped-1', 'item:ped-1'])
})

test('fechar exige confirmação nomeando total e contagem, e trava novos itens após fechar', async () => {
  server.use(
    sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }),
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({
        id: 'ped-2',
        status: 'ABERTO',
        itens: [],
        quantidadeItens: 0,
        total: 0,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
    http.post('*/api/pedidos/avulsos/:id/itens', () =>
      HttpResponse.json({
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
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
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
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      })
    }),
  )

  const user = userEvent.setup()
  renderPage('/admin/pedidos-avulsos/ped-2')

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)
  expect(await screen.findByText('Sardinha X')).toBeInTheDocument()
  await fecharModal(user)

  await user.click(screen.getByRole('button', { name: 'Fechar pedido' }))

  const dialog = within(screen.getByRole('dialog', { name: /fechar pedido avulso/i }))
  expect(dialog.getByText(/1 item, total R\$\s*250,00/)).toBeInTheDocument()
  await user.click(dialog.getByRole('button', { name: 'Fechar pedido' }))

  expect(await screen.findByRole('heading', { name: 'Pedido fechado' })).toBeInTheDocument()
  expect(screen.getByText(/pedido ped-2/)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Adicionar item' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Fechar pedido' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Baixar PDF' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reenviar e-mail' })).toBeInTheDocument()
})

test('clicar numa linha abre a edição pré-preenchida e salvar atualiza preço/quantidade/total', async () => {
  server.use(
    sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }),
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({
        id: 'ped-7',
        status: 'ABERTO',
        itens: [],
        quantidadeItens: 0,
        total: 0,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
    http.post('*/api/pedidos/avulsos/:id/itens', () =>
      HttpResponse.json({
        id: 'ped-7',
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
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
  )
  let corpoEdicao: any
  server.use(
    http.put('*/api/pedidos/avulsos/:id/itens/:itemId', async ({ request, params }) => {
      corpoEdicao = await request.json()
      expect(params.itemId).toBe('item-1')
      return HttpResponse.json({
        id: 'ped-7',
        status: 'ABERTO',
        itens: [
          {
            id: 'item-1',
            produtoId: 'p-sardinha',
            nomeSnapshot: 'Sardinha X',
            unidadeSnapshot: 'Caixa',
            quantidadePorEmbalagemSnapshot: 50,
            precoEmbalagem: 200,
            precoUnitario: 4,
            quantidade: 5,
            subtotal: 1000,
          },
        ],
        quantidadeItens: 1,
        total: 1000,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      })
    }),
  )

  const user = userEvent.setup()
  renderPage('/admin/pedidos-avulsos/ped-7')

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)
  await fecharModal(user)

  await user.click(await screen.findByText('Sardinha X'))
  const dialogEdicao = within(await screen.findByRole('dialog', { name: /editar item/i }))
  expect(dialogEdicao.getByLabelText('Preço da embalagem')).toHaveValue(125)
  expect(dialogEdicao.getByLabelText('Quantidade de embalagens')).toHaveValue(2)

  await user.clear(dialogEdicao.getByLabelText('Preço da embalagem'))
  await user.type(dialogEdicao.getByLabelText('Preço da embalagem'), '200')
  await user.clear(dialogEdicao.getByLabelText('Quantidade de embalagens'))
  await user.type(dialogEdicao.getByLabelText('Quantidade de embalagens'), '5')
  await user.click(dialogEdicao.getByRole('button', { name: 'Salvar' }))

  expect(corpoEdicao).toEqual({ precoEmbalagem: 200, quantidade: 5 })
  expect(await screen.findByText(/R\$\s*4,00/)).toBeInTheDocument()
  expect(await screen.findAllByText(/R\$\s*1\.000,00/)).toHaveLength(2)
})

test('remover item exige confirmação e some da tabela e do total', async () => {
  server.use(
    sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }),
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({
        id: 'ped-8',
        status: 'ABERTO',
        itens: [],
        quantidadeItens: 0,
        total: 0,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
    http.post('*/api/pedidos/avulsos/:id/itens', () =>
      HttpResponse.json({
        id: 'ped-8',
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
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
  )
  let removeuItemId: string | undefined
  server.use(
    http.delete('*/api/pedidos/avulsos/:id/itens/:itemId', ({ params }) => {
      removeuItemId = params.itemId as string
      return HttpResponse.json({
        id: 'ped-8',
        status: 'ABERTO',
        itens: [],
        quantidadeItens: 0,
        total: 0,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      })
    }),
  )

  const user = userEvent.setup()
  renderPage('/admin/pedidos-avulsos/ped-8')

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)
  await fecharModal(user)

  await user.click(await screen.findByText('Sardinha X'))
  const dialogEdicao = within(await screen.findByRole('dialog', { name: /editar item/i }))
  await user.click(dialogEdicao.getByRole('button', { name: 'Remover item' }))

  const confirmar = within(await screen.findByRole('dialog', { name: /remover item/i }))
  await user.click(confirmar.getByRole('button', { name: 'Remover item' }))

  expect(removeuItemId).toBe('item-1')
  await screen.findByText('Nenhum item adicionado ainda.')
  expect(screen.getByText('0 itens')).toBeInTheDocument()
})

test('seta pra baixo move o foco entre linhas e Enter abre a edição', async () => {
  server.use(
    sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }),
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({
        id: 'ped-9',
        status: 'ABERTO',
        itens: [],
        quantidadeItens: 0,
        total: 0,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
    http.post('*/api/pedidos/avulsos/:id/itens', () =>
      HttpResponse.json({
        id: 'ped-9',
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
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
  )

  const user = userEvent.setup()
  renderPage('/admin/pedidos-avulsos/ped-9')

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)
  await screen.findByText('Refrigerante Lata')
  await fecharModal(user)

  const linhaSardinha = (await screen.findByText('Sardinha X')).closest('tr') as HTMLElement
  linhaSardinha.focus()
  await user.keyboard('{ArrowDown}')
  const linhaRefri = screen.getByText('Refrigerante Lata').closest('tr') as HTMLElement
  expect(linhaRefri).toHaveFocus()

  await user.keyboard('{Enter}')
  expect(await screen.findByRole('dialog', { name: /editar item — refrigerante lata/i })).toBeInTheDocument()
})

test('buscar um produto que já está no pedido mostra o selo "Já no pedido"', async () => {
  server.use(
    sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }),
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({
        id: 'ped-10',
        status: 'ABERTO',
        itens: [],
        quantidadeItens: 0,
        total: 0,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
    http.post('*/api/pedidos/avulsos/:id/itens', () =>
      HttpResponse.json({
        id: 'ped-10',
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
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
  )

  const user = userEvent.setup()
  renderPage('/admin/pedidos-avulsos/ped-10')

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)
  await screen.findByText('1 item')

  await abrirModalItem(user)
  const dialog = within(screen.getByRole('dialog', { name: /adicionar item/i }))
  const campo = dialog.getByPlaceholderText(/Buscar produto/i)
  await user.clear(campo)
  await user.type(campo, 'sardinha')
  await sleep(APOS_DEBOUNCE)

  expect(await dialog.findByText('Já no pedido')).toBeInTheDocument()
})

test('fluxo completo: dois itens de embalagens diferentes, total geral e confirmação final', async () => {
  server.use(
    sugestoesHandler({
      sardinha: { doProprioCatalogo: [SARDINHA] },
      refri: { doProprioCatalogo: [REFRIGERANTE] },
    }),
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({
        id: 'ped-3',
        status: 'ABERTO',
        itens: [],
        quantidadeItens: 0,
        total: 0,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
  )
  let itensChamadas = 0
  server.use(
    http.post('*/api/pedidos/avulsos/:id/itens', () => {
      itensChamadas += 1
      const itens =
        itensChamadas === 1
          ? [
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
            ]
          : [
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
            ]
      const total = itensChamadas === 1 ? 250 : 276.7
      return HttpResponse.json({
        id: 'ped-3',
        status: 'ABERTO',
        itens,
        quantidadeItens: itens.length,
        total,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      })
    }),
    http.post('*/api/pedidos/avulsos/:id/fechar', () =>
      HttpResponse.json({
        id: 'ped-3',
        status: 'FECHADO',
        itens: [],
        quantidadeItens: 2,
        total: 276.7,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      }),
    ),
  )

  const user = userEvent.setup()
  renderPage('/admin/pedidos-avulsos/ped-3')

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)
  expect(await screen.findByText('Sardinha X')).toBeInTheDocument()

  await buscarESelecionar(user, 'refri', 'Refrigerante Lata')
  await user.type(screen.getByLabelText('Preço da embalagem'), '8.90')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '3')
  await confirmarItemNoModal(user)
  expect(await screen.findByText('Refrigerante Lata')).toBeInTheDocument()
  await fecharModal(user)

  expect(screen.getByText(/R\$\s*276,70/)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Fechar pedido' }))
  const dialog = within(screen.getByRole('dialog', { name: /fechar pedido avulso/i }))
  await user.click(dialog.getByRole('button', { name: 'Fechar pedido' }))

  expect(await screen.findByRole('heading', { name: 'Pedido fechado' })).toBeInTheDocument()
  expect(screen.getByText(/R\$\s*276,70/)).toBeInTheDocument()
  expect(screen.getByText(/pedido ped-3/)).toBeInTheDocument()
})

test('abrir a URL de um pedido já existente (F5) recarrega Empresa/Representante/itens do back', async () => {
  server.use(
    http.get('*/api/pedidos/avulsos/:id', ({ params }) => {
      expect(params.id).toBe('ped-recuperado')
      return HttpResponse.json({
        id: 'ped-recuperado',
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
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: '3 dias úteis',
        empresaNome: 'Empresa A',
        representanteNome: 'João Rep',
      })
    }),
  )

  renderPage('/admin/pedidos-avulsos/ped-recuperado')

  expect(await screen.findByText('Sardinha X')).toBeInTheDocument()
  expect(screen.getByText('Empresa A', { selector: 'strong' })).toBeInTheDocument()
  expect(screen.getByText('João Rep', { selector: 'strong' })).toBeInTheDocument()
  expect(screen.getByText('3 dias úteis', { selector: 'strong' })).toBeInTheDocument()
  expect(screen.getByText('1 item')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Fechar pedido' })).toBeEnabled()
})

test('URL de pedido que não existe (ou não é seu) mostra estado de erro em vez de tela em branco', async () => {
  server.use(
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({ title: 'Unprocessable Entity', status: 422, detail: 'Pedido não encontrado.' }, { status: 422 }),
    ),
  )

  renderPage('/admin/pedidos-avulsos/ped-inexistente')

  expect(await screen.findByRole('heading', { name: 'Pedido não encontrado' })).toBeInTheDocument()
})

test('ao abrir o modal de adicionar item, itens do catálogo próprio já aparecem pré-carregados e busca normaliza acentos', async () => {
  const ACUCAR = {
    id: 'p-acucar',
    nome: 'Açúcar Cristal 1kg',
    codigoBarras: '7891112223334',
    unidade: 'Fardo',
    quantidadePorEmbalagem: 10,
    ativo: true,
  }

  server.use(
    http.get('*/api/produtos', () => HttpResponse.json([ACUCAR, SARDINHA])),
  )

  const user = userEvent.setup()
  renderPage('/admin/pedidos-avulsos/ped-1')

  await user.click(await screen.findByRole('button', { name: /adicionar item/i }))
  const modal = await screen.findByRole('dialog', { name: /adicionar item/i })

  // Itens já estão pré-carregados na tela sem digitar nada
  expect(within(modal).getByText('Açúcar Cristal 1kg')).toBeInTheDocument()
  expect(within(modal).getByText('Sardinha X')).toBeInTheDocument()

  // Digitar "acucar" (sem acento) encontra "Açúcar Cristal 1kg"
  const campo = within(modal).getByPlaceholderText(/Buscar produto/i)
  await user.type(campo, 'acucar')
  expect(within(modal).getByText('Açúcar Cristal 1kg')).toBeInTheDocument()
  expect(within(modal).queryByText('Sardinha X')).not.toBeInTheDocument()
})

test('tabela de itens exibe coluna Cód. Barras com o GTIN do produto', async () => {
  const PROD_COM_GTIN = {
    id: 'p-gtin',
    nome: 'Leite Integral 1L',
    codigoBarras: '7890001112223',
    unidade: 'Caixa',
    quantidadePorEmbalagem: 12,
    ativo: true,
  }

  server.use(
    http.get('*/api/produtos', () => HttpResponse.json([PROD_COM_GTIN])),
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({
        id: 'ped-gtin',
        status: 'ABERTO',
        empresaNome: 'Laticínios Sul',
        condicaoPagamento: 'À vista',
        total: 120,
        quantidadeItens: 1,
        itens: [
          {
            id: 'item-gtin',
            produtoId: 'p-gtin',
            nomeSnapshot: 'Leite Integral 1L',
            unidadeSnapshot: 'Caixa',
            quantidadePorEmbalagemSnapshot: 12,
            precoEmbalagem: 60,
            precoUnitario: 5,
            quantidade: 2,
            subtotal: 120,
          },
        ],
      }),
    ),
  )

  renderPage('/admin/pedidos-avulsos/ped-gtin')

  expect(await screen.findByText('Cód. Barras')).toBeInTheDocument()
  expect(screen.getByText('7890001112223')).toBeInTheDocument()
})

test('permite excluir pedido avulso em aberto pelo cabeçalho', async () => {
  let excluiu = false
  server.use(
    http.get('*/api/pedidos/avulsos/:id', () =>
      HttpResponse.json({
        id: 'ped-del-header',
        status: 'ABERTO',
        empresaNome: 'Empresa Teste',
        condicaoPagamento: 'À vista',
        total: 0,
        quantidadeItens: 0,
        itens: [],
      }),
    ),
    http.delete('*/api/pedidos/avulsos/ped-del-header', () => {
      excluiu = true
      return new HttpResponse(null, { status: 204 })
    }),
  )

  const user = userEvent.setup()
  renderPage('/admin/pedidos-avulsos/ped-del-header')

  const btnExcluir = await screen.findByRole('button', { name: /Excluir pedido/i })
  await user.click(btnExcluir)

  const dialog = screen.getByRole('dialog', { name: /Excluir pedido avulso/i })
  expect(dialog).toBeInTheDocument()

  await user.click(within(dialog).getByRole('button', { name: /Sim, excluir pedido/i }))
  expect(excluiu).toBe(true)
})
