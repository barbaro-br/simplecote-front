import { render, screen, waitFor, within } from '@testing-library/react'
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

function pedido(status: string, decididoPorDesempate?: boolean) {
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
    itens: [
      {
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
        ...(decididoPorDesempate === undefined ? {} : { decididoPorDesempate }),
      },
    ],
  }
}

function setup(decididoPorDesempate?: boolean) {
  const state = { status: 'GERADO' }
  let xlsxChamado = false
  server.use(
    http.get('*/api/cotacoes/c-1/resultado', () =>
      HttpResponse.json({
        pedidos: [pedido(state.status, decididoPorDesempate)],
        itensSemVencedor: [],
      }),
    ),
    http.get('*/api/cotacoes/c-1/pedidos', () =>
      HttpResponse.json([pedido(state.status, decididoPorDesempate)]),
    ),
    http.post('*/api/pedidos/p1/enviar', () => {
      state.status = 'ENVIADO'
      return HttpResponse.json(pedido('ENVIADO'))
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
  return { getXlsxChamado: () => xlsxChamado }
}

test('renderiza o vencedor por item pelo nome da Empresa', async () => {
  setup()
  const linha = (await screen.findByRole('cell', { name: 'Arroz Tipo 1 5kg' })).closest('tr')!
  expect(within(linha).getByText('Atacadão Central')).toBeInTheDocument()
})

test('item com decididoPorDesempate true renderiza o badge Empate', async () => {
  setup(true)
  expect(await screen.findByText('Empate')).toBeInTheDocument()
})

test('item com decididoPorDesempate false não renderiza o badge Empate', async () => {
  setup(false)
  await screen.findByRole('cell', { name: 'Arroz Tipo 1 5kg' })
  expect(screen.queryByText('Empate')).not.toBeInTheDocument()
})

test('item sem decididoPorDesempate não renderiza o badge Empate', async () => {
  setup()
  await screen.findByRole('cell', { name: 'Arroz Tipo 1 5kg' })
  expect(screen.queryByText('Empate')).not.toBeInTheDocument()
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
