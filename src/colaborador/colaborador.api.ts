import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { EstadoColaborador, Produto } from './colaborador.schema'

const estadoKey = (token: string) => ['public-colaborador', token] as const
const produtosKey = (token: string) => ['public-colaborador', token, 'produtos'] as const

export function useEstadoColaborador(token: string) {
  return useQuery({
    queryKey: estadoKey(token),
    queryFn: () => api.get<EstadoColaborador>(`/public/colaborador/${token}`),
    retry: false,
  })
}

export function useProdutosColaborador(token: string) {
  return useQuery({
    queryKey: produtosKey(token),
    queryFn: () => api.get<Produto[]>(`/public/colaborador/${token}/produtos`),
    retry: false,
  })
}

export function useAdicionarItemColaborador(token: string) {
  return useMutation({
    mutationFn: (valores: { produtoId: string; quantidade: number }) =>
      api.post<unknown>(`/public/colaborador/${token}/itens`, valores),
  })
}
