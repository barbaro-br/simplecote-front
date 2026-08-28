import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { CotacaoPorToken, LancePatch } from './cotacao-token.schema'

const cotacaoKey = (token: string) => ['public-cotacao', token] as const

export function useCotacaoPorToken(token: string) {
  return useQuery({
    queryKey: cotacaoKey(token),
    queryFn: () => api.get<CotacaoPorToken>(`/public/cotacoes/${token}`),
    retry: false,
  })
}

/**
 * Envia UM item por vez (spec.md §10.2). A API aceita lista; o front sempre
 * manda `{ lances: [umItem] }` para o feedback ser por célula.
 */
export function useEnviarLance(token: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (item: LancePatch) =>
      api.put<CotacaoPorToken>(`/public/cotacoes/${token}/lances`, { lances: [item] }),
    onSuccess: (data) => {
      queryClient.setQueryData(cotacaoKey(token), data)
    },
  })
}

export function useFinalizar(token: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<void>(`/public/cotacoes/${token}/finalizar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cotacaoKey(token) }),
  })
}
