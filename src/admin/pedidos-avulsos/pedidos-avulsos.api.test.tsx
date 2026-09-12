import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import {
  useCriarPedidoAvulso,
  useAdicionarItemPedidoAvulso,
  useFecharPedidoAvulso,
  usePedidoAvulso,
} from './pedidos-avulsos.api'

const UUID = '123e4567-e89b-12d3-a456-426614174000'
const PRODUTO_ID = '223e4567-e89b-12d3-a456-426614174000'

function pedidoAvulsoDe(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: UUID,
    status: 'ABERTO',
    itens: [],
    quantidadeItens: 0,
    total: 0,
    geradoEm: '2026-09-12T12:00:00Z',
    ...overrides,
  }
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('pedidos-avulsos.api', () => {
  it('useCriarPedidoAvulso: POST /api/pedidos/avulsos com {produtoId,precoEmbalagem,quantidade}', async () => {
    let corpo: any
    server.use(
      http.post('*/api/pedidos/avulsos', async ({ request }) => {
        corpo = await request.json()
        return HttpResponse.json(pedidoAvulsoDe(), { status: 201 })
      }),
    )

    const { result } = renderHook(() => useCriarPedidoAvulso(), { wrapper: createWrapper() })
    const pedido = await result.current.mutateAsync({
      produtoId: PRODUTO_ID,
      precoEmbalagem: 125,
      quantidade: 2,
      empresaId: 'emp-1',
    })

    expect(corpo).toEqual({ produtoId: PRODUTO_ID, precoEmbalagem: 125, quantidade: 2, empresaId: 'emp-1' })
    expect(pedido.id).toBe(UUID)
  })

  it('useAdicionarItemPedidoAvulso: POST /api/pedidos/avulsos/{id}/itens', async () => {
    let corpo: any
    server.use(
      http.post('*/api/pedidos/avulsos/:id/itens', async ({ request, params }) => {
        expect(params.id).toBe(UUID)
        corpo = await request.json()
        return HttpResponse.json(pedidoAvulsoDe({ quantidadeItens: 1, total: 26.7 }))
      }),
    )

    const { result } = renderHook(() => useAdicionarItemPedidoAvulso(UUID), { wrapper: createWrapper() })
    const pedido = await result.current.mutateAsync({
      produtoId: PRODUTO_ID,
      precoEmbalagem: 8.9,
      quantidade: 3,
    })

    expect(corpo).toEqual({ produtoId: PRODUTO_ID, precoEmbalagem: 8.9, quantidade: 3 })
    expect(pedido.quantidadeItens).toBe(1)
  })

  it('useFecharPedidoAvulso: POST /api/pedidos/avulsos/{id}/fechar', async () => {
    server.use(
      http.post('*/api/pedidos/avulsos/:id/fechar', ({ params }) => {
        expect(params.id).toBe(UUID)
        return HttpResponse.json(pedidoAvulsoDe({ status: 'FECHADO' }))
      }),
    )

    const { result } = renderHook(() => useFecharPedidoAvulso(UUID), { wrapper: createWrapper() })
    const pedido = await result.current.mutateAsync()

    expect(pedido.status).toBe('FECHADO')
  })

  it('usePedidoAvulso: GET /api/pedidos/avulsos/{id}', async () => {
    server.use(
      http.get('*/api/pedidos/avulsos/:id', ({ params }) => {
        expect(params.id).toBe(UUID)
        return HttpResponse.json(pedidoAvulsoDe())
      }),
    )

    const { result } = renderHook(() => usePedidoAvulso(UUID), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe(UUID)
  })
})
