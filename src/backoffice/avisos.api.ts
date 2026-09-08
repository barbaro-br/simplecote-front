import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import { avisoAdminListaSchema, type AvisoAdmin, type NivelAviso } from '@/avisos/avisos.schema'

// Gestão de avisos no backoffice (change backoffice-avisos-no-painel). Rotas
// `/api/admin/avisos` exigem SUPER_ADMIN (barrado antes no back).

const chave = ['admin', 'avisos'] as const

function invalidar(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: chave })
}

export function useAvisosAdmin() {
  return useQuery({
    queryKey: chave,
    queryFn: () => api.get<AvisoAdmin[]>('/api/admin/avisos').then((d) => avisoAdminListaSchema.parse(d)),
  })
}

export function useCriarAviso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (novo: { titulo: string; corpo: string; nivel: NivelAviso; expiraEm?: string | null }) =>
      api.post<void>('/api/admin/avisos', novo),
    onSuccess: () => invalidar(queryClient),
  })
}

export function useAlternarAviso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      api.patch<void>(`/api/admin/avisos/${id}`, { ativo }),
    onSuccess: () => invalidar(queryClient),
  })
}

export function useRemoverAviso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/admin/avisos/${id}`),
    onSuccess: () => invalidar(queryClient),
  })
}
