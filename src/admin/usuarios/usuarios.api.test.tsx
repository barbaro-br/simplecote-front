import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { ApiError } from '@/shared/api/api-client'
import {
  useUsuarios,
  useCriarUsuario,
  useAtualizarUsuario,
  useRedefinirSenhaUsuario,
  useInativarUsuario,
} from './usuarios.api'

const UUID = '123e4567-e89b-12d3-a456-426614174000'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('usuarios.api', () => {
  it('useUsuarios: GET /api/usuarios e valida a lista', async () => {
    server.use(
      http.get('*/api/usuarios', () =>
        HttpResponse.json([
          { id: UUID, nome: 'Ana', email: 'ana@x.com', papel: 'ADMIN', ativo: true },
        ]),
      ),
    )

    const { result } = renderHook(() => useUsuarios(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].papel).toBe('ADMIN')
  })

  it('useCriarUsuario: POST com {nome,email,papel,senha}', async () => {
    let corpo: any
    server.use(
      http.post('*/api/usuarios', async ({ request }) => {
        corpo = await request.json()
        return HttpResponse.json({ id: 'u2', nome: corpo.nome, email: corpo.email, papel: corpo.papel, ativo: true }, { status: 201 })
      }),
    )

    const { result } = renderHook(() => useCriarUsuario(), { wrapper: createWrapper() })
    await result.current.mutateAsync({
      nome: 'Bia',
      email: 'bia@x.com',
      papel: 'OPERADOR',
      senha: 'senha1234',
    })

    expect(corpo).toEqual({ nome: 'Bia', email: 'bia@x.com', papel: 'OPERADOR', senha: 'senha1234' })
  })

  it('useAtualizarUsuario: PUT /{id} com {nome,email,papel} (sem senha)', async () => {
    let corpo: any
    server.use(
      http.put('*/api/usuarios/:id', async ({ request, params }) => {
        expect(params.id).toBe('u1')
        corpo = await request.json()
        return HttpResponse.json({ id: 'u1', ...corpo, ativo: true })
      }),
    )

    const { result } = renderHook(() => useAtualizarUsuario(), { wrapper: createWrapper() })
    await result.current.mutateAsync({
      id: 'u1',
      body: { nome: 'Ana Nova', email: 'ana@x.com', papel: 'ADMIN' },
    })

    expect(corpo).toEqual({ nome: 'Ana Nova', email: 'ana@x.com', papel: 'ADMIN' })
    expect(corpo).not.toHaveProperty('senha')
  })

  it('useRedefinirSenhaUsuario: POST /{id}/senha manda só {senha} (não confirmar)', async () => {
    let corpo: any
    server.use(
      http.post('*/api/usuarios/:id/senha', async ({ request, params }) => {
        expect(params.id).toBe('u1')
        corpo = await request.json()
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { result } = renderHook(() => useRedefinirSenhaUsuario(), { wrapper: createWrapper() })
    await result.current.mutateAsync({ id: 'u1', senha: 'senha1234' })

    expect(corpo).toEqual({ senha: 'senha1234' })
    expect(corpo).not.toHaveProperty('confirmar')
  })

  it('useInativarUsuario: POST /{id}/inativar', async () => {
    let chamou = false
    server.use(
      http.post('*/api/usuarios/:id/inativar', ({ params }) => {
        chamou = true
        expect(params.id).toBe('u1')
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { result } = renderHook(() => useInativarUsuario(), { wrapper: createWrapper() })
    await result.current.mutateAsync('u1')
    expect(chamou).toBe(true)
  })

  it('erro 422 vira ApiError', async () => {
    server.use(
      http.post('*/api/usuarios', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Unprocessable Entity', status: 422, detail: 'E-mail já usado' },
          { status: 422, headers: { 'content-type': 'application/problem+json' } },
        ),
      ),
    )

    const { result } = renderHook(() => useCriarUsuario(), { wrapper: createWrapper() })
    try {
      await result.current.mutateAsync({ nome: 'X', email: 'x@x.com', papel: 'ADMIN', senha: 'senha1234' })
      throw new Error('deveria ter rejeitado')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).problem.detail).toBe('E-mail já usado')
    }
  })
})
