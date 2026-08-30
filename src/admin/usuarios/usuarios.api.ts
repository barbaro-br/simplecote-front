import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import { usuarioListaSchema, type Papel, type Usuario } from './usuarios.schema'

const chave = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({
    queryKey: chave,
    queryFn: () => api.get('/api/usuarios').then((d) => usuarioListaSchema.parse(d)),
  })
}

type CriarBody = { nome: string; email: string; papel: Papel; senha: string }
type AtualizarBody = { nome: string; email: string; papel: Papel }

export function useCriarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CriarBody) => api.post<Usuario>('/api/usuarios', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useAtualizarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AtualizarBody }) =>
      api.put<Usuario>(`/api/usuarios/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useRedefinirSenhaUsuario() {
  return useMutation({
    // POST /api/usuarios/{id}/senha — só `{ senha }`; `confirmar` fica no cliente.
    mutationFn: ({ id, senha }: { id: string; senha: string }) =>
      api.post<void>(`/api/usuarios/${id}/senha`, { senha }),
  })
}

export function useInativarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/usuarios/${id}/inativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}
