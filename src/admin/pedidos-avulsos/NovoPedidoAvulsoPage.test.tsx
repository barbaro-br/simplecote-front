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

const ITEM_SARDINHA = {
  id: 'item-1',
  produtoId: 'p-sardinha',
  nomeSnapshot: 'Sardinha X',
  unidadeSnapshot: 'Caixa',
  quantidadePorEmbalagemSnapshot: 50,
  precoEmbalagem: 125,
  precoUnitario: 2.5,
  quantidade: 2,
  subtotal: 250,
}

// Abre o modal de adicionar item (idempotente — se já estiver aberto, no-op).
async function abrirModalItem(user: ReturnType<typeof userEvent.setup>) {
  if (screen.queryByRole('dialog', { name: /adicionar item/i })) return
  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
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

async function preencherObrigatorios(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByLabelText(/empresa/i))
  await user.click(await screen.findByRole('option', { name: 'Empresa A' }))
  await screen.findByText('Rep: João Rep')

  await user.click(await screen.findByLabelText(/condição de pagamento/i))
  await user.click(await screen.findByRole('option', { name: '14/21/28' }))
}

function fecharModal(user: ReturnType<typeof userEvent.setup>) {
  return user.click(within(screen.getByRole('dialog', { name: /adicionar item/i })).getByRole('button', { name: 'Concluído' }))
}

// Clica em "Adicionar item" DENTRO do modal (o gatilho na página tem o mesmo
// nome acessível e fica visível atrás do overlay).
function confirmarItemNoModal(user: ReturnType<typeof userEvent.setup>) {
  return user.click(within(screen.getByRole('dialog', { name: /adicionar item/i })).getByRole('button', { name: 'Adicionar item' }))
}

beforeEach(() => {
  server.use(
    http.get('*/api/condicoes-pagamento', () =>
      HttpResponse.json([{ id: 'cp-1', descricao: '14/21/28', ativo: true }]),
    ),
    http.get('*/api/empresas', () =>
      HttpResponse.json([{ id: '323e4567-e89b-12d3-a456-426614174000', nome: 'Empresa A', ativo: true, podeExcluir: true }]),
    ),
    http.get('*/api/representantes', () =>
      HttpResponse.json([{ id: '423e4567-e89b-12d3-a456-426614174000', empresaId: '323e4567-e89b-12d3-a456-426614174000', nome: 'João Rep', email: 'joao@rep.com', ativo: true, whatsapp: null }]),
    ),
  )
})

test('abre vazia: sem itens, "Fechar pedido" desabilitado', async () => {
  renderPage()

  expect(screen.getByRole('heading', { name: 'Novo pedido' })).toBeInTheDocument()
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
      expect(body).toEqual({ produtoId: 'p-sardinha', precoEmbalagem: 125, quantidade: 2, empresaId: '323e4567-e89b-12d3-a456-426614174000', condicaoPagamentoId: 'cp-1' })
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

  await abrirModalItem(user)
  await preencherObrigatorios(user)
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

  await preencherObrigatorios(user)
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
})

test('escolher condição de pagamento do catálogo envia condicaoPagamentoId ao criar', async () => {
  server.use(sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }))
  let corpo: any
  server.use(
    http.post('*/api/pedidos/avulsos', async ({ request }) => {
      corpo = await request.json()
      return HttpResponse.json(
        { id: 'ped-4', status: 'ABERTO', itens: [ITEM_SARDINHA], quantidadeItens: 1, total: 250, geradoEm: '2026-09-12T12:00:00Z', condicaoPagamento: '14/21/28', prazoEntregaEstimado: null },
        { status: 201 },
      )
    }),
  )
  const user = userEvent.setup()
  renderPage()

  await preencherObrigatorios(user)
  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)

  await screen.findByText('Sardinha X')
  expect(corpo).toEqual({
    produtoId: 'p-sardinha',
    precoEmbalagem: 125,
    quantidade: 2,
    empresaId: '323e4567-e89b-12d3-a456-426614174000',
    condicaoPagamentoId: 'cp-1',
  })
})

test('criar condição de pagamento nova pelo combobox cadastra no catálogo e usa o id ao criar o pedido', async () => {
  server.use(sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }))
  server.use(
    http.post('*/api/condicoes-pagamento', async ({ request }) => {
      const body = (await request.json()) as { descricao: string }
      return HttpResponse.json({ id: 'cp-nova', descricao: body.descricao, ativo: true }, { status: 201 })
    }),
  )
  let corpo: any
  server.use(
    http.post('*/api/pedidos/avulsos', async ({ request }) => {
      corpo = await request.json()
      return HttpResponse.json(
        { id: 'ped-5', status: 'ABERTO', itens: [ITEM_SARDINHA], quantidadeItens: 1, total: 250, geradoEm: '2026-09-12T12:00:00Z', condicaoPagamento: '10 dias direto', prazoEntregaEstimado: null },
        { status: 201 },
      )
    }),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByLabelText(/empresa/i))
  await user.click(await screen.findByRole('option', { name: 'Empresa A' }))

  await user.click(await screen.findByLabelText('Condição de pagamento'))
  await user.type(screen.getByPlaceholderText('Buscar…'), '10 dias direto')
  await user.click(await screen.findByRole('option', { name: 'Criar "10 dias direto"' }))

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)

  await screen.findByText('Sardinha X')
  expect(corpo).toEqual({
    produtoId: 'p-sardinha',
    precoEmbalagem: 125,
    quantidade: 2,
    empresaId: '323e4567-e89b-12d3-a456-426614174000',
    condicaoPagamentoId: 'cp-nova',
  })
})

test('digitar prazo de entrega em texto livre envia prazoEntregaEstimado ao criar', async () => {
  server.use(sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }))
  let corpo: any
  server.use(
    http.post('*/api/pedidos/avulsos', async ({ request }) => {
      corpo = await request.json()
      return HttpResponse.json(
        { id: 'ped-6', status: 'ABERTO', itens: [ITEM_SARDINHA], quantidadeItens: 1, total: 250, geradoEm: '2026-09-12T12:00:00Z', condicaoPagamento: '14/21/28', prazoEntregaEstimado: '3 dias úteis' },
        { status: 201 },
      )
    }),
  )
  const user = userEvent.setup()
  renderPage()

  await preencherObrigatorios(user)
  await user.type(screen.getByLabelText('Prazo de entrega'), '3 dias úteis')
  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)

  await screen.findByText('Sardinha X')
  expect(corpo).toEqual({
    produtoId: 'p-sardinha',
    precoEmbalagem: 125,
    quantidade: 2,
    empresaId: '323e4567-e89b-12d3-a456-426614174000',
    condicaoPagamentoId: 'cp-1',
    prazoEntregaEstimado: '3 dias úteis',
  })
})

test('botão de adicionar item fica desabilitado com texto explicando se faltar Empresa ou condição de pagamento', async () => {
  server.use(sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }))
  const user = userEvent.setup()
  renderPage()

  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')

  const dialog = within(screen.getByRole('dialog', { name: /adicionar item/i }))
  const botao = dialog.getByRole('button', { name: 'Adicionar item' })
  expect(botao).toBeDisabled()
  expect(dialog.getByText('Escolha a Empresa e a condição de pagamento antes de confirmar o primeiro item.')).toBeInTheDocument()
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

  await preencherObrigatorios(user)
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

test('clicar numa linha abre a edição pré-preenchida e salvar atualiza preço/quantidade/total', async () => {
  server.use(sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }))
  let corpoEdicao: any
  server.use(
    http.post('*/api/pedidos/avulsos', () =>
      HttpResponse.json(
        { id: 'ped-7', status: 'ABERTO', itens: [ITEM_SARDINHA], quantidadeItens: 1, total: 250, geradoEm: '2026-09-12T12:00:00Z', condicaoPagamento: '14/21/28', prazoEntregaEstimado: null },
        { status: 201 },
      ),
    ),
    http.put('*/api/pedidos/avulsos/:id/itens/:itemId', async ({ request, params }) => {
      corpoEdicao = await request.json()
      expect(params.itemId).toBe('item-1')
      return HttpResponse.json({
        id: 'ped-7',
        status: 'ABERTO',
        itens: [{ ...ITEM_SARDINHA, precoEmbalagem: 200, precoUnitario: 4, quantidade: 5, subtotal: 1000 }],
        quantidadeItens: 1,
        total: 1000,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
      })
    }),
  )

  const user = userEvent.setup()
  renderPage()

  await preencherObrigatorios(user)
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
  server.use(sugestoesHandler({ sardinha: { doProprioCatalogo: [SARDINHA] } }))
  let removeuItemId: string | undefined
  server.use(
    http.post('*/api/pedidos/avulsos', () =>
      HttpResponse.json(
        { id: 'ped-8', status: 'ABERTO', itens: [ITEM_SARDINHA], quantidadeItens: 1, total: 250, geradoEm: '2026-09-12T12:00:00Z', condicaoPagamento: '14/21/28', prazoEntregaEstimado: null },
        { status: 201 },
      ),
    ),
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
      })
    }),
  )

  const user = userEvent.setup()
  renderPage()

  await preencherObrigatorios(user)
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
    sugestoesHandler({
      sardinha: { doProprioCatalogo: [SARDINHA] },
      refri: { doProprioCatalogo: [REFRIGERANTE] },
    }),
  )
  server.use(
    http.post('*/api/pedidos/avulsos', () =>
      HttpResponse.json(
        { id: 'ped-9', status: 'ABERTO', itens: [ITEM_SARDINHA], quantidadeItens: 1, total: 250, geradoEm: '2026-09-12T12:00:00Z', condicaoPagamento: '14/21/28', prazoEntregaEstimado: null },
        { status: 201 },
      ),
    ),
    http.post('*/api/pedidos/avulsos/:id/itens', () =>
      HttpResponse.json({
        id: 'ped-9',
        status: 'ABERTO',
        itens: [
          ITEM_SARDINHA,
          { id: 'item-2', produtoId: 'p-refri', nomeSnapshot: 'Refrigerante Lata', unidadeSnapshot: 'Unidade', quantidadePorEmbalagemSnapshot: 1, precoEmbalagem: 8.9, precoUnitario: 8.9, quantidade: 3, subtotal: 26.7 },
        ],
        quantidadeItens: 2,
        total: 276.7,
        geradoEm: '2026-09-12T12:00:00Z',
        condicaoPagamento: '14/21/28',
        prazoEntregaEstimado: null,
      }),
    ),
  )

  const user = userEvent.setup()
  renderPage()

  await preencherObrigatorios(user)
  await buscarESelecionar(user, 'sardinha', 'Sardinha X')
  await user.type(screen.getByLabelText('Preço da embalagem'), '125')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '2')
  await confirmarItemNoModal(user)
  await buscarESelecionar(user, 'refri', 'Refrigerante Lata')
  await user.type(screen.getByLabelText('Preço da embalagem'), '8.90')
  await user.type(screen.getByLabelText('Quantidade de embalagens'), '3')
  await confirmarItemNoModal(user)
  await fecharModal(user)

  const linhaSardinha = (await screen.findByText('Sardinha X')).closest('tr') as HTMLElement
  linhaSardinha.focus()
  await user.keyboard('{ArrowDown}')
  const linhaRefri = screen.getByText('Refrigerante Lata').closest('tr') as HTMLElement
  expect(linhaRefri).toHaveFocus()

  await user.keyboard('{Enter}')
  expect(await screen.findByRole('dialog', { name: /editar item — refrigerante lata/i })).toBeInTheDocument()
})
