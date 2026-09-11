import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { Produto, ProdutoFormValues } from './produtos.schema'

const chave = ['produtos'] as const

// Padrão: só ativos (`queryKey ['produtos']`), que é o que o seletor de
// "adicionar item" espera. A tela de Produtos passa `{ incluirInativos: true }`.
export function useProdutos(opts?: { incluirInativos?: boolean }) {
  const incluirInativos = opts?.incluirInativos ?? false
  return useQuery({
    queryKey: incluirInativos ? ([...chave, { incluirInativos: true }] as const) : chave,
    queryFn: () =>
      api.get<Produto[]>(`/api/produtos${incluirInativos ? '?incluirInativos=true' : ''}`),
  })
}

export function useCriarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: ProdutoFormValues) => api.post<Produto>('/api/produtos', valores),
    onSuccess: (novo) => {
      // Insere na hora para o catálogo já refletir (ex.: pré-seleção no
      // "adicionar item"); o invalidate reconcilia com o servidor depois.
      queryClient.setQueryData<Produto[]>(chave, (old) => [...(old ?? []), novo])
      queryClient.invalidateQueries({ queryKey: chave })
    },
  })
}

export function useInativarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/produtos/${id}/inativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useAtivarProduto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/produtos/${id}/ativar`),
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

/** Shape de `SugestaoCatalogoGlobalDTO` — nunca traz embalagem/quantidade (spec.md §10.6). */
export type SugestaoCatalogoGlobal = {
  codigoBarras: string
  nome: string
  marca: string | null
}

/** Shape de `SugestoesCadastroDTO` (change catalogo-global-de-produtos). */
export type SugestoesCadastro = {
  doProprioCatalogo: Produto[]
  doCatalogoGlobal: SugestaoCatalogoGlobal[]
}

// Sugestão ao digitar no cadastro (produto/sugestao-de-cadastro): nome ou
// trecho de código de barras. `enabled` corta a chamada com texto curto demais
// (evita busca a cada tecla) — o back também recusa dígitos com <4 caracteres,
// mas aqui evita a viagem de rede pra qualquer texto de 0-1 caractere.
export function useSugestoesCadastro(q: string) {
  const termo = q.trim()
  return useQuery({
    queryKey: [...chave, 'sugestoes', termo] as const,
    queryFn: () => api.get<SugestoesCadastro>(`/api/produtos/sugestoes?q=${encodeURIComponent(termo)}`),
    enabled: termo.length >= 2,
    staleTime: 30_000,
  })
}
