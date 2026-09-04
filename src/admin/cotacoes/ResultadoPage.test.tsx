import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { ResultadoPage } from './ResultadoPage'

const criarObjectURL = vi.fn(() => 'blob:mock')

let clickSpy: ReturnType<typeof vi.spyOn>

beforeAll(() => {
  ;(URL as unknown as { createObjectURL: unknown }).createObjectURL = criarObjectURL
  ;(URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn()
  clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})
afterAll(() => {
  delete (URL as unknown as { createObjectURL?: unknown }).createObjectURL
  delete (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL
  clickSpy.mockRestore()
})

function item(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ip1',
    itemCotacaoId: 'ic1',
    lanceId: 'l1',
    nomeSnapshot: 'Arroz Tipo 1 5kg',
    unidadeSnapshot: 'Fardo',
    quantidadePorEmbalagemSnapshot: 1,
    quantidade: 10,
    precoEmbalagem: 10,
    precoUnitario: 2,
    subtotal: 100,
    ...overrides,
  }
}

function pedido(status: string, decididoPorDesempate?: boolean, itens: ReturnType<typeof item>[] = [item()]) {
  return {
    id: 'p1',
    cotacaoId: 'c-1',
    participanteId: 'part-1',
    empresaNome: 'Atacadão Central',
    status,
    observacao: null,
    geradoEm: '2026-08-28T12:00:00Z',
    enviadoEm: null,
    confirmadoEm: null,
    total: 100,
    itens: itens.map((i) => (decididoPorDesempate === undefined ? i : { ...i, decididoPorDesempate })),
  }
}

let enviarBody = ''

function setup(
  decididoPorDesempate?: boolean,
  itensSemVencedor: Array<{ id: string; nomeSnapshot: string }> = [],
  itens: ReturnType<typeof item>[] = [item()],
) {
  const state = { status: 'GERADO' }
  let xlsxChamado = false
  enviarBody = ''
  server.use(
    http.get('*/api/cotacoes/c-1/resultado', () =>
      HttpResponse.json({
        pedidos: [pedido(state.status, decididoPorDesempate, itens)],
        itensSemVencedor,
      }),
    ),
    http.get('*/api/cotacoes/c-1', () =>
      HttpResponse.json({
        id: 'c-1',
        titulo: 'Compra semanal',
        status: 'PEDIDOS_GERADOS',
        prazo: null,
        criadaEm: '2026-08-01T12:00:00Z',
        encerradaEm: null,
        itens: [],
      }),
    ),
    http.get('*/api/cotacoes/c-1/pedidos', () =>
      HttpResponse.json([pedido(state.status, decididoPorDesempate, itens)]),
    ),
    http.post('*/api/pedidos/p1/enviar', async ({ request }) => {
      enviarBody = await request.text()
      state.status = 'ENVIADO'
      return HttpResponse.json(pedido('ENVIADO', decididoPorDesempate, itens))
    }),
    http.get('*/api/cotacoes/c-1/resultado.xlsx', () => {
      xlsxChamado = true
      return new HttpResponse(new Blob(['xlsx']), {
        headers: { 'Content-Type': 'application/octet-stream' },
      })
    }),
  )
  const router = createMemoryRouter(
    [{ path: '/admin/cotacoes/:id/resultado', element: <ResultadoPage /> }],
    { initialEntries: ['/admin/cotacoes/c-1/resultado'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { getXlsxChamado: () => xlsxChamado, getEnviarBody: () => enviarBody }
}

test('renderiza um só card de pedidos, sem "Vencedor por item" separado', async () => {
  setup()
  expect(await screen.findByText('Pedidos Gerados')).toBeInTheDocument()
  expect(screen.getByText('Atacadão Central')).toBeInTheDocument()
  expect(screen.queryByText('Vencedor por item')).not.toBeInTheDocument()
})

test('expandir um pedido mostra seus itens e recolher esconde de novo', async () => {
  setup()
  const user = userEvent.setup()

  await screen.findByText('Atacadão Central')
  expect(screen.queryByText('Arroz Tipo 1 5kg')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Expandir itens de Atacadão Central' }))
  expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Recolher itens de Atacadão Central' }))
  await waitFor(() => {
    expect(screen.queryByText('Arroz Tipo 1 5kg')).not.toBeInTheDocument()
  })
})

test('breadcrumb mostra Cotações › título › Resultado, com Cotações apontando para /admin/cotacoes', async () => {
  setup()
  expect(await screen.findByRole('link', { name: 'Cotações' })).toHaveAttribute('href', '/admin/cotacoes')
  expect(screen.getByRole('link', { name: 'Compra semanal' })).toHaveAttribute(
    'href',
    '/admin/cotacoes/c-1',
  )
  expect(screen.getByText('Resultado')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Resultado' })).not.toBeInTheDocument()
})

test('item com decididoPorDesempate true renderiza o badge Empate na linha expandida', async () => {
  setup(true)
  const user = userEvent.setup()

  await screen.findByText('Atacadão Central')
  expect(screen.queryByText('Empate')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Expandir itens de Atacadão Central' }))
  expect(await screen.findByText('Empate')).toBeInTheDocument()
})

test('item com decididoPorDesempate false não renderiza o badge Empate', async () => {
  setup(false)
  const user = userEvent.setup()

  await screen.findByText('Atacadão Central')
  await user.click(screen.getByRole('button', { name: 'Expandir itens de Atacadão Central' }))
  expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.queryByText('Empate')).not.toBeInTheDocument()
})

test('item sem decididoPorDesempate não renderiza o badge Empate', async () => {
  setup()
  const user = userEvent.setup()

  await screen.findByText('Atacadão Central')
  await user.click(screen.getByRole('button', { name: 'Expandir itens de Atacadão Central' }))
  expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.queryByText('Empate')).not.toBeInTheDocument()
})

test('"Itens sem vencedor" aparece independente da expansão dos pedidos', async () => {
  setup(undefined, [{ id: 'isv1', nomeSnapshot: 'Feijão Carioca 1kg' }])
  const user = userEvent.setup()

  expect(await screen.findByText('Itens sem vencedor:')).toBeInTheDocument()
  expect(screen.getByText('Feijão Carioca 1kg')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Expandir itens de Atacadão Central' }))
  expect(screen.getByText('Feijão Carioca 1kg')).toBeInTheDocument()
})

test('"Enviar" atualiza o status do pedido', async () => {
  setup()
  const user = userEvent.setup()
  await screen.findByRole('button', { name: 'Enviar' })

  await user.click(screen.getByRole('button', { name: 'Enviar' }))

  await waitFor(() => {
    expect(screen.queryByRole('button', { name: 'Enviar' })).not.toBeInTheDocument()
  })
  expect(screen.getAllByText('Enviado').length).toBeGreaterThan(0)
})

test('"Baixar XLSX" chama o endpoint binário', async () => {
  const { getXlsxChamado } = setup()
  const user = userEvent.setup()
  await screen.findByRole('button', { name: 'Baixar XLSX' })

  await user.click(screen.getByRole('button', { name: 'Baixar XLSX' }))

  await waitFor(() => expect(getXlsxChamado()).toBe(true))
  expect(criarObjectURL).toHaveBeenCalled()
})

test('margem global calcula o preço de venda dos itens (precoUnitario × 1,30 para "30")', async () => {
  setup()
  const user = userEvent.setup()
  await screen.findByText('Atacadão Central')

  await user.type(screen.getByLabelText('Margem de lucro (%)'), '30')
  await user.click(screen.getByRole('button', { name: 'Expandir itens de Atacadão Central' }))

  expect(screen.getByText(/2,60/)).toBeInTheDocument()
})

test('sem nenhuma margem, a coluna de preço de venda mostra "—"', async () => {
  setup()
  const user = userEvent.setup()
  await screen.findByText('Atacadão Central')

  await user.click(screen.getByRole('button', { name: 'Expandir itens de Atacadão Central' }))
  await screen.findByText('Arroz Tipo 1 5kg')

  expect(screen.getByText('—')).toBeInTheDocument()
})

const doisItens = [
  item({ id: 'ip1', nomeSnapshot: 'Arroz Tipo 1 5kg', precoUnitario: 2, precoEmbalagem: 10, subtotal: 100 }),
  item({ id: 'ip2', nomeSnapshot: 'Feijão Carioca 1kg', precoUnitario: 4, precoEmbalagem: 20, subtotal: 100 }),
]

test('margem por item sobrescreve a global sem afetar os demais itens', async () => {
  setup(undefined, [], doisItens)
  const user = userEvent.setup()
  await screen.findByText('Atacadão Central')

  await user.type(screen.getByLabelText('Margem de lucro (%)'), '30')
  await user.click(screen.getByRole('button', { name: 'Expandir itens de Atacadão Central' }))

  expect(screen.getByText(/2,60/)).toBeInTheDocument()
  expect(screen.getByText(/5,20/)).toBeInTheDocument()

  await user.clear(screen.getByLabelText('Margem (%) de Arroz Tipo 1 5kg'))
  await user.type(screen.getByLabelText('Margem (%) de Arroz Tipo 1 5kg'), '50')

  expect(screen.getByText(/3,00/)).toBeInTheDocument()
  expect(screen.getByText(/5,20/)).toBeInTheDocument()
})

test('mudar a margem global depois de customizar um item não afeta esse item', async () => {
  setup(undefined, [], doisItens)
  const user = userEvent.setup()
  await screen.findByText('Atacadão Central')

  await user.type(screen.getByLabelText('Margem de lucro (%)'), '30')
  await user.click(screen.getByRole('button', { name: 'Expandir itens de Atacadão Central' }))

  await user.clear(screen.getByLabelText('Margem (%) de Arroz Tipo 1 5kg'))
  await user.type(screen.getByLabelText('Margem (%) de Arroz Tipo 1 5kg'), '50')

  expect(screen.getByText(/3,00/)).toBeInTheDocument()
  expect(screen.getByText(/5,20/)).toBeInTheDocument()

  await user.clear(screen.getByLabelText('Margem de lucro (%)'))
  await user.type(screen.getByLabelText('Margem de lucro (%)'), '40')

  expect(screen.getByText(/3,00/)).toBeInTheDocument()
  expect(screen.getByText(/5,60/)).toBeInTheDocument()
  expect(screen.queryByText(/5,20/)).not.toBeInTheDocument()
})

test('a margem não é enviada na chamada de enviar pedido', async () => {
  const { getEnviarBody } = setup()
  const user = userEvent.setup()
  await screen.findByText('Atacadão Central')

  await user.type(screen.getByLabelText('Margem de lucro (%)'), '30')
  await user.click(screen.getByRole('button', { name: 'Enviar' }))

  await waitFor(() => expect(screen.queryByRole('button', { name: 'Enviar' })).not.toBeInTheDocument())
  expect(getEnviarBody()).not.toContain('margem')
})
