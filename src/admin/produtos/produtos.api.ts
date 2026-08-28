import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { Produto, ProdutoFormValues } from './produtos.schema'

const chave = ['produtos'] as const

export function useProdutos() {
  return useQuery({
    queryKey: chave,
    queryFn: () => api.get<Produto[]>('/api/produtos'),
  })
}

export function useCriarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: ProdutoFormValues) => api.post<Produto>('/api/produtos', valores),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useInativarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/produtos/${id}/inativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useAtualizarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, valores }: { id: string, valores: ProdutoFormValues }) => 
      api.put<Produto>(`/api/produtos/${id}`, valores),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export type ProdutoLookupResult = {
  gtin: string
  nome: string
}

export function useLookupProduto() {
  return useMutation({
    mutationFn: (gtin: string) => api.get<ProdutoLookupResult>(`/api/produtos/lookup?gtin=${gtin}`, { lookup: true }),
  })
}
