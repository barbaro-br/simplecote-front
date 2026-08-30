import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { CotacaoDetalhePage } from './CotacaoDetalhePage'

type Item = {
  id: string
  produtoId: string
  nomeSnapshot: string
  codigoBarrasSnapshot: string | null
  unidadeSnapshot: string
  quantidadeSolicitada: number
  quantidadePorEmbalagemSnapshot: number
}

function novoItem(produtoId: string, quantidade: number, nomeSnapshot = 'Arroz Tipo 1 5kg'): Item {
  return {
    id: `item-${Math.random().toString(36).slice(2, 8)}`,
    produtoId,
    nomeSnapshot,
    codigoBarrasSnapshot: null,
    unidadeSnapshot: 'Fardo',
    quantidadeSolicitada: quantidade,
    quantidadePorEmbalagemSnapshot: 1,
  }
}

function setup(status: StatusCotacao, itensIniciais: Item[] = []) {
  const state = {
    id: 'c-1',
    titulo: 'Compra semanal',
    status,
    prazo: status === 'ABERTA' ? '2026-08-30T12:00:00Z' : null,
    criadaEm: '2026-08-01T12:00:00Z',
    encerradaEm: null as string | null,
    itens: [...itensIniciais],
  }
  const chamadas: Record<string, number> = {}
  let prazoRecebido: string | null = null
  const produtos: Array<Record<string, unknown>> = [
    { id: 'p-1', nome: 'Arroz Tipo 1 5kg', codigoBarras: null, unidade: 'Fardo', quantidadePorEmbalagem: 1, ativo: true },
  ]

  server.use(
    http.get('*/api/analises/produtos/insight', () => HttpResponse.json({})),
    http.get('*/api/cotacoes/c-1', () => HttpResponse.json(state)),
    http.get('*/api/produtos', () => HttpResponse.json(produtos)),
    http.post('*/api/produtos', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      const novo = { id: 'novo-1', ...body, ativo: true }
      produtos.push(novo)
      chamadas.criarProduto = (chamadas.criarProduto ?? 0) + 1
      return HttpResponse.json(novo, { status: 201 })
    }),
    http.post('*/api/cotacoes/c-1/itens', async ({ request }) => {
      const body = (await request.json()) as { produtoId: string; quantidade: number }
      const nome = (produtos.find((p) => p.id === body.produtoId)?.nome as string) ?? 'Arroz Tipo 1 5kg'
      state.itens.push(novoItem(body.produtoId, body.quantidade, nome))
      return HttpResponse.json(state, { status: 201 })
    }),
    http.delete('*/api/cotacoes/c-1/itens/:itemId', ({ params }) => {
      state.itens = state.itens.filter((i) => i.id !== params.itemId)
      return new HttpResponse(null, { status: 204 })
    }),
    http.post('*/api/cotacoes/c-1/abrir', async ({ request }) => {
      const body = (await request.json()) as { prazo: string }
      prazoRecebido = body.prazo
      chamadas.abrir = (chamadas.abrir ?? 0) + 1
      state.status = 'ABERTA'
      state.prazo = body.prazo
      return HttpResponse.json(state)
    }),
    http.post('*/api/cotacoes/c-1/apurar', () => {
      chamadas.apurar = (chamadas.apurar ?? 0) + 1
      state.status = 'PEDIDOS_GERADOS'
      return HttpResponse.json(state)
    }),
    // Seções ParticipantesSection / RespostasSection (montadas por status)
    http.get('*/api/cotacoes/c-1/participantes', () => HttpResponse.json([])),
    http.get('*/api/empresas', () => HttpResponse.json([])),
    http.get('*/api/cotacoes/c-1/ao-vivo', () =>
      HttpResponse.json({ status: state.status, respondidos: 0, totalParticipantes: 0, itens: [] }),
    ),
    http.post('*/api/cotacoes/c-1/:acao', ({ params }) => {
      chamadas[params.acao as string] = (chamadas[params.acao as string] ?? 0) + 1
      return HttpResponse.json(state)
    }),
  )

  const router = createMemoryRouter(
    [{ path: '/admin/cotacoes/:id', element: <CotacaoDetalhePage /> }],
    { initialEntries: ['/admin/cotacoes/c-1'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return {
    chamadas,
    getPrazoRecebido: () => prazoRecebido,
  }
}

test('3.1 — RASCUNHO mostra só Abrir e Cancelar', async () => {
  setup('RASCUNHO')
  expect(await screen.findByRole('heading', { name: 'Compra semanal' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Abrir' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Encerrar' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Apurar' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()
})

test('3.1 — ABERTA mostra Encerrar e Cancelar, não Abrir', async () => {
  setup('ABERTA')
  expect(await screen.findByRole('button', { name: 'Encerrar' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Abrir' })).not.toBeInTheDocument()
})

test('3.2 — em RASCUNHO adiciona e remove item', async () => {
  setup('RASCUNHO')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
  const dialog = within(screen.getByRole('dialog'))
  // espera o catálogo carregar no <select> do modal
  await dialog.findByRole('option', { name: 'Arroz Tipo 1 5kg' })
  await user.selectOptions(dialog.getByLabelText('Produto'), 'p-1')
  await user.click(dialog.getByRole('button', { name: 'Adicionar' }))

  const linhaItem = await screen.findByRole('cell', { name: 'Arroz Tipo 1 5kg' })
  expect(linhaItem).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Remover' }))
  await waitFor(() => {
    expect(screen.queryByRole('cell', { name: 'Arroz Tipo 1 5kg' })).not.toBeInTheDocument()
  })
})

test('3.5 — cadastra Produto novo no modal aninhado, volta pré-selecionado e adiciona à cotação', async () => {
  setup('RASCUNHO')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
  await user.click(
    within(screen.getByRole('dialog', { name: 'Adicionar item' })).getByRole('button', {
      name: /Cadastrar novo produto/i,
    }),
  )

  // 2º modal (cadastro) empilhado
  const cadastro = () => screen.getByRole('dialog', { name: 'Cadastrar novo produto' })
  await user.type(within(cadastro()).getByLabelText('Nome do produto'), 'Feijão Carioca 1kg')
  const qtd = within(cadastro()).getByLabelText('Qtd. por embalagem')
  await user.clear(qtd)
  await user.type(qtd, '10')
  await user.click(within(cadastro()).getByRole('button', { name: /Salvar/i }))

  // 2º modal fecha; o 1º segue e o novo Produto está pré-selecionado
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Cadastrar novo produto' })).not.toBeInTheDocument(),
  )
  const seletor = within(screen.getByRole('dialog', { name: 'Adicionar item' })).getByLabelText(
    'Produto',
  ) as HTMLSelectElement
  await waitFor(() => expect(seletor.value).toBe('novo-1'))

  await user.click(
    within(screen.getByRole('dialog', { name: 'Adicionar item' })).getByRole('button', {
      name: 'Adicionar',
    }),
  )

  expect(await screen.findByRole('cell', { name: 'Feijão Carioca 1kg' })).toBeInTheDocument()
})

test('3.2 — em ABERTA os controles de item não aparecem', async () => {
  setup('ABERTA', [novoItem('p-1', 5)])
  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.queryByRole('button', { name: 'Adicionar item' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Remover' })).not.toBeInTheDocument()
})

test('3.4 — Apurar só chama a API após confirmação no diálogo', async () => {
  const { chamadas } = setup('ENCERRADA')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Apurar' }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent('não pode ser desfeito')
  expect(chamadas.apurar ?? 0).toBe(0)

  await user.click(within(dialog).getByRole('button', { name: 'Apurar' }))
  await waitFor(() => expect(chamadas.apurar).toBe(1))
})

test('3.4 — Abrir envia o prazo em ISO', async () => {
  const { chamadas, getPrazoRecebido } = setup('RASCUNHO')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Abrir' }))
  const dialog = screen.getByRole('dialog')
  await user.type(within(dialog).getByLabelText('Prazo para respostas'), '2026-09-01T10:00')
  await user.click(within(dialog).getByRole('button', { name: 'Abrir' }))

  await waitFor(() => expect(chamadas.abrir).toBe(1))
  const prazo = getPrazoRecebido()
  expect(prazo).toBeTruthy()
  // ISO-8601 canônico (com offset Z)
  expect(new Date(prazo as string).toISOString()).toBe(prazo)
})

// --- duplicar-cotacao-ui ---

const COPIA = {
  id: 'c-2',
  titulo: 'Compra semanal (cópia)',
  status: 'RASCUNHO' as StatusCotacao,
  prazo: null,
  criadaEm: '2026-08-10T12:00:00Z',
  encerradaEm: null as string | null,
  itens: [] as Item[],
}

test('sem itens omitidos no state, nenhum aviso de duplicação aparece', async () => {
  setup('RASCUNHO')
  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.queryByText(/não copiados nesta duplicação/i)).not.toBeInTheDocument()
})

test('"Duplicar" no sucesso navega para a cópia e mostra o aviso de itens omitidos', async () => {
  setup('RASCUNHO')
  server.use(
    http.get('*/api/analises/produtos/insight', () => HttpResponse.json({})),
    http.post('*/api/cotacoes/c-1/duplicar', () =>
      HttpResponse.json({
        cotacao: COPIA,
        omitidos: [
          { produtoId: 'p-9', nome: 'Feijão 1kg', motivo: 'Produto inativado' },
          { produtoId: 'p-8', nome: 'Óleo 900ml', motivo: 'Produto inativado' },
        ],
      }),
    ),
    http.get('*/api/cotacoes/c-2', () => HttpResponse.json(COPIA)),
    http.get('*/api/cotacoes/c-2/participantes', () => HttpResponse.json([])),
  )
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'Duplicar' }))

  expect(await screen.findByRole('heading', { name: 'Compra semanal (cópia)' })).toBeInTheDocument()
  const aviso = screen.getByRole('status')
  expect(aviso).toHaveTextContent('Feijão 1kg — Produto inativado')
  expect(aviso).toHaveTextContent('Óleo 900ml — Produto inativado')
})

test('"Duplicar" com erro mostra a mensagem em alerta e não navega', async () => {
  setup('RASCUNHO')
  server.use(
    http.get('*/api/analises/produtos/insight', () => HttpResponse.json({})),
    http.post('*/api/cotacoes/c-1/duplicar', () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Conflito', status: 409, detail: 'Não foi possível duplicar.' },
        { status: 409 },
      ),
    ),
  )
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'Duplicar' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível duplicar.')
  expect(screen.getByRole('heading', { name: 'Compra semanal' })).toBeInTheDocument()
})
