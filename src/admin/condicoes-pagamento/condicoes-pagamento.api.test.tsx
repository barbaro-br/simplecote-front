import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import {
  useCondicoesPagamento,
  useCriarCondicaoPagamento,
  useInativarCondicaoPagamento,
  useAtivarCondicaoPagamento,
} from './condicoes-pagamento.api'

const UUID = '123e4567-e89b-12d3-a456-426614174000'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('condicoes-pagamento.api', () => {
  it('useCondicoesPagamento: GET /api/condicoes-pagamento', async () => {
    server.use(
      http.get('*/api/condicoes-pagamento', () =>
        HttpResponse.json([{ id: UUID, descricao: '14/21/28', ativo: true }]),
      ),
    )

    const { result } = renderHook(() => useCondicoesPagamento(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].descricao).toBe('14/21/28')
  })

  it('useCriarCondicaoPagamento: POST com {descricao}', async () => {
    let corpo: any
    server.use(
      http.post('*/api/condicoes-pagamento', async ({ request }) => {
        corpo = await request.json()
        return HttpResponse.json({ id: UUID, ...corpo, ativo: true }, { status: 201 })
      }),
    )

    const { result } = renderHook(() => useCriarCondicaoPagamento(), { wrapper: createWrapper() })
    await result.current.mutateAsync({ descricao: '30 dias' })

    expect(corpo).toEqual({ descricao: '30 dias' })
  })

  it('useInativarCondicaoPagamento: POST /{id}/inativar', async () => {
    server.use(
      http.post('*/api/condicoes-pagamento/:id/inativar', ({ params }) => {
        expect(params.id).toBe(UUID)
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { result } = renderHook(() => useInativarCondicaoPagamento(), { wrapper: createWrapper() })
    await result.current.mutateAsync(UUID)
  })

  it('useAtivarCondicaoPagamento: POST /{id}/ativar', async () => {
    server.use(
      http.post('*/api/condicoes-pagamento/:id/ativar', ({ params }) => {
        expect(params.id).toBe(UUID)
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { result } = renderHook(() => useAtivarCondicaoPagamento(), { wrapper: createWrapper() })
    await result.current.mutateAsync(UUID)
  })
})
