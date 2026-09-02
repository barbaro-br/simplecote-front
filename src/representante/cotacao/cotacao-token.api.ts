import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { CotacaoPorToken } from './cotacao-token.schema'

export const cotacaoKey = (token: string) => ['public-cotacao', token] as const

export function useCotacaoPorToken(token: string) {
  return useQuery({
    queryKey: cotacaoKey(token),
    queryFn: () => api.get<CotacaoPorToken>(`/public/cotacoes/${token}`),
    retry: false,
  })
}

export function useFinalizar(token: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<void>(`/public/cotacoes/${token}/finalizar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cotacaoKey(token) }),
  })
}
