import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import { representanteListaSchema, type Representante } from './representantes.schema'

const chave = ['representantes'] as const

export function useRepresentantes() {
  return useQuery({
    queryKey: chave,
    queryFn: () => api.get('/api/representantes').then((d) => representanteListaSchema.parse(d)),
  })
}

type CriarBody = { empresaId: string; nome: string; email: string; whatsapp?: string }
type AtualizarBody = { nome: string; email: string; whatsapp?: string }

export function useCriarRepresentante() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CriarBody) => api.post<Representante>('/api/representantes', body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useAtualizarRepresentante() {
  const queryClient = useQueryClient()
  return useMutation({
    // PUT /api/representantes/{id} — corpo sem empresaId (o backend não move de empresa).
    mutationFn: ({ id, body }: { id: string; body: AtualizarBody }) =>
      api.put<Representante>(`/api/representantes/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useInativarRepresentante() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/representantes/${id}/inativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}
