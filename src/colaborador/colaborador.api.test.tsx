import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLookupProdutoColaborador } from './colaborador.api'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}


describe('colaborador.api', () => {
  describe('useLookupProdutoColaborador', () => {
    it('retorna os dados quando o produto é encontrado (200)', async () => {
      server.use(
        http.get('*/public/colaborador/token-valido/produtos/lookup', ({ request }) => {
          const url = new URL(request.url)
          if (url.searchParams.get('gtin') === '7891010101010') {
            return HttpResponse.json({
              gtin: '7891010101010',
              nome: 'Produto Teste',
              marca: 'Marca Teste',
            })
          }
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
        })
      )

      const { result } = renderHook(() => useLookupProdutoColaborador('token-valido', '7891010101010'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({
        gtin: '7891010101010',
        nome: 'Produto Teste',
        marca: 'Marca Teste',
      })
    })

    it('retorna nulo quando o produto não é encontrado (404)', async () => {
      server.use(
        http.get('*/public/colaborador/token-valido/produtos/lookup', () => {
          return HttpResponse.json({ detail: 'Produto não encontrado' }, { status: 404 })
        })
      )

      const { result } = renderHook(() => useLookupProdutoColaborador('token-valido', '9999999999999'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toBeNull()
    })
  })
})
