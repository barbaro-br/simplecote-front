import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { useInsightProdutos } from './analise.api'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  }
}

describe('useInsightProdutos', () => {
  it('não dispara request se ids for vazio', async () => {
    let called = false
    server.use(
      http.get('*/api/analises/produtos/insight', () => {
        called = true
        return HttpResponse.json({})
      })
    )

    const { wrapper } = createWrapper()
    renderHook(() => useInsightProdutos([]), { wrapper })

    await new Promise((r) => setTimeout(r, 100))
    expect(called).toBe(false)
  })

  it('faz 1 request para os ids e popula o cache individual', async () => {
    let callCount = 0
    const id1 = '123e4567-e89b-12d3-a456-426614174001'
    const id2 = '123e4567-e89b-12d3-a456-426614174002'
    const id3 = '123e4567-e89b-12d3-a456-426614174003'
    
    server.use(
      http.get('*/api/analises/produtos/insight', ({ request }) => {
        callCount++
        const url = new URL(request.url)
        expect(url.searchParams.get('ids')).toBe(`${id1},${id2},${id3}`)
        return HttpResponse.json({
          [id1]: { 
            ultimaCompra: null, 
            variacaoPct: null, 
            menorPrecoUnitario: null, 
            precoMedioUnitario90d: null, 
            compras: 0, 
            fornecedoresDistintos: 0, 
            serie: [] 
          },
        })
      })
    )

    const { wrapper, queryClient } = createWrapper()
    const { result } = renderHook(() => useInsightProdutos([id1, id2, id3]), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(callCount).toBe(1)
    
    // Verifica cache individual
    expect(queryClient.getQueryData(['analise', 'insight-produto', id1])).toBeDefined()
    expect(queryClient.getQueryData(['analise', 'insight-produto', id2])).toBe(null)
    expect(queryClient.getQueryData(['analise', 'insight-produto', id3])).toBe(null)
  })
})
