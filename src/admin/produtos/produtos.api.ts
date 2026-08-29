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

/** Shape de `DadosProdutoExternoDTO` (200 do provedor externo). */
export type ProdutoLookupResult = {
  gtin: string
  nome: string
}

// Consulta externa por Código de Barras (GTIN) — requisito `admin/produtos`.
// `{ lookup: true }` faz o `404` do provedor (não encontrado, normal) virar
// `null` em vez de `ApiError`; o retorno é `ProdutoLookupResult | null`.
export function useLookupProdutoPorGtin() {
  return useMutation({
    mutationFn: (gtin: string) =>
      api.get<ProdutoLookupResult>(`/api/produtos/lookup?gtin=${encodeURIComponent(gtin)}`, {
        lookup: true,
      }),
  })
}
