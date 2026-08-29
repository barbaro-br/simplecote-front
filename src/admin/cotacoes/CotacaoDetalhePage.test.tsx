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

function novoItem(produtoId: string, quantidade: number): Item {
  return {
    id: `item-${Math.random().toString(36).slice(2, 8)}`,
    produtoId,
    nomeSnapshot: 'Arroz Tipo 1 5kg',
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

  server.use(
    http.get('*/api/cotacoes/c-1', () => HttpResponse.json(state)),
    http.get('*/api/produtos', () =>
      HttpResponse.json([
        { id: 'p-1', nome: 'Arroz Tipo 1 5kg', codigoBarras: null, unidade: 'Fardo', quantidadePorEmbalagem: 1, ativo: true },
      ]),
    ),
    http.post('*/api/cotacoes/c-1/itens', async ({ request }) => {
      const body = (await request.json()) as { produtoId: string; quantidade: number }
      state.itens.push(novoItem(body.produtoId, body.quantidade))
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
