import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { ApiError } from '@/shared/api/api-client'
import {
  useRepresentantes,
  useCriarRepresentante,
  useAtualizarRepresentante,
} from './representantes.api'

const UUID = '123e4567-e89b-12d3-a456-426614174000'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('representantes.api', () => {
  it('useRepresentantes: GET /api/representantes e valida a lista', async () => {
    server.use(
      http.get('*/api/representantes', () =>
        HttpResponse.json([
          { id: UUID, empresaId: UUID, nome: 'João', email: 'j@x.com', whatsapp: null, ativo: true },
        ]),
      ),
    )

    const { result } = renderHook(() => useRepresentantes(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].nome).toBe('João')
  })

  it('useCriarRepresentante: POST com corpo {empresaId,nome,email,whatsapp}', async () => {
    let corpo: any
    server.use(
      http.post('*/api/representantes', async ({ request }) => {
        corpo = await request.json()
        return HttpResponse.json({ id: 'r2', ...corpo, ativo: true }, { status: 201 })
      }),
    )

    const { result } = renderHook(() => useCriarRepresentante(), { wrapper: createWrapper() })
    await result.current.mutateAsync({
      empresaId: UUID,
      nome: 'Maria',
      email: 'maria@x.com',
      whatsapp: '11999',
    })

    expect(corpo).toEqual({ empresaId: UUID, nome: 'Maria', email: 'maria@x.com', whatsapp: '11999' })
  })

  it('useAtualizarRepresentante: PUT /{id} sem empresaId no corpo', async () => {
    let corpo: any
    server.use(
      http.put('*/api/representantes/:id', async ({ request, params }) => {
        expect(params.id).toBe('r1')
        corpo = await request.json()
        return HttpResponse.json({ id: 'r1', empresaId: UUID, ...corpo, ativo: true })
      }),
    )

    const { result } = renderHook(() => useAtualizarRepresentante(), { wrapper: createWrapper() })
    await result.current.mutateAsync({
      id: 'r1',
      body: { nome: 'Maria Nova', email: 'maria@x.com', whatsapp: undefined },
    })

    expect(corpo).not.toHaveProperty('empresaId')
    expect(corpo.nome).toBe('Maria Nova')
  })

  it('erro 422 do backend vira ApiError com .problem', async () => {
    server.use(
      http.post('*/api/representantes', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Unprocessable Entity', status: 422, detail: 'E-mail já usado' },
          { status: 422, headers: { 'content-type': 'application/problem+json' } },
        ),
      ),
    )

    const { result } = renderHook(() => useCriarRepresentante(), { wrapper: createWrapper() })
    await expect(
      result.current.mutateAsync({ empresaId: UUID, nome: 'X', email: 'x@x.com' }),
    ).rejects.toMatchObject({ name: 'ApiError' })

    try {
      await result.current.mutateAsync({ empresaId: UUID, nome: 'X', email: 'x@x.com' })
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).problem.detail).toBe('E-mail já usado')
    }
  })
})
