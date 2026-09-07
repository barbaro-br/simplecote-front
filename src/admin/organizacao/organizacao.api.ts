import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import {
  conviteContextoSchema,
  membroListaSchema,
  type ConvidarValues,
  type ConviteContexto,
  type Membro,
} from './organizacao.schema'

// Contrato da change organizacao-papeis-e-convites do back (section 0 do tasks.md).

const chave = ['organizacao', 'membros'] as const

export function useMembros() {
  return useQuery({
    queryKey: chave,
    queryFn: () =>
      api.get<Membro[]>('/api/organizacao/membros').then((d) => membroListaSchema.parse(d)),
  })
}

export function useConvidar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ConvidarValues) => api.post<{ id: string }>('/api/organizacao/convites', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useReenviarConvite() {
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/organizacao/convites/${id}/reenviar`),
  })
}

export function useRevogarConvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/organizacao/convites/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

// Inativa um membro ATIVO (não-OWNER) reusando POST /api/usuarios/{id}/inativar
// (o back barra OWNER). O id do MembroResponse para um Usuario é o id do Usuario.
export function useInativarMembro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/usuarios/${id}/inativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

// Rota pública do aceite de convite.
export function useContextoConvite(token: string) {
  return useQuery({
    queryKey: ['public', 'convite', token],
    queryFn: () =>
      api.get<ConviteContexto>(`/public/convites/${token}`).then((d) => conviteContextoSchema.parse(d)),
    enabled: token.length > 0,
  })
}

export function useAceitarConvite(token: string) {
  return useMutation({
    mutationFn: (senha: string) => api.post<{ slug: string }>(`/public/convites/${token}`, { senha }),
  })
}
