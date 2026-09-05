import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { 
  EstadoColaborador, 
  Produto, 
  ProdutoExternoLookup, 
  CadastrarItemBipadoValores 
} from './colaborador.schema'

const estadoKey = (token: string) => ['public-colaborador', token] as const
const produtosKey = (token: string) => ['public-colaborador', token, 'produtos'] as const
const lookupKey = (token: string, gtin: string) => ['public-colaborador', token, 'lookup', gtin] as const

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
    mutationFn: (valores: { cotacaoId: string; produtoId: string; quantidade: number }) =>
      api.post<unknown>(`/public/colaborador/${token}/itens`, valores),
  })
}

export function useLookupProdutoColaborador(token: string, gtin: string) {
  return useQuery({
    queryKey: lookupKey(token, gtin),
    queryFn: () => api.get<ProdutoExternoLookup>(`/public/colaborador/${token}/produtos/lookup?gtin=${gtin}`, { lookup: true }),
    enabled: !!gtin,
    retry: false, // 404 is a valid result, not an error
  })
}

export function useCadastrarItemBipadoColaborador(token: string) {
  return useMutation({
    mutationFn: (valores: CadastrarItemBipadoValores) =>
      api.post<unknown>(`/public/colaborador/${token}/produtos/bipado`, valores),
  })
}

