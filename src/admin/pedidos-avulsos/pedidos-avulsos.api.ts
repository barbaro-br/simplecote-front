import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type {
  CondicoesPedidoAvulso,
  EditarItemPedidoAvulsoFormValues,
  ItemPedidoAvulsoFormValues,
  PedidoAvulso,
} from './pedidos-avulsos.schema'

const chave = ['pedidos-avulsos'] as const

// Cria o Pedido avulso vazio (change persistencia-antecipada-de-pedido-avulso
// no simplecote-back): `POST /api/pedidos/avulsos` sem produtoId/precoEmbalagem/
// quantidade — assim que Empresa + condição de pagamento são escolhidos, antes
// de buscar qualquer produto. Dá um id real cedo: um F5 no meio da busca do
// primeiro item recupera o pedido (GET /{id}) em vez de perder tudo. Condição
// de pagamento/prazo de entrega só podem ir aqui — o back não tem endpoint pra
// atualizá-los depois (por isso ficam de fora de `useAdicionarItemPedidoAvulso`).
export function useCriarPedidoAvulso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: CondicoesPedidoAvulso) => api.post<PedidoAvulso>('/api/pedidos/avulsos', valores),
    onSuccess: (pedido) => queryClient.setQueryData([...chave, pedido.id], pedido),
  })
}

// Adiciona um item a um Pedido avulso já criado (ainda `ABERTO`).
export function useAdicionarItemPedidoAvulso(pedidoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: ItemPedidoAvulsoFormValues) =>
      api.post<PedidoAvulso>(`/api/pedidos/avulsos/${pedidoId}/itens`, valores),
    onSuccess: (pedido) => queryClient.setQueryData([...chave, pedidoId], pedido),
  })
}

// Edita preço da embalagem/quantidade de um item já adicionado (ainda `ABERTO`).
export function useEditarItemPedidoAvulso(pedidoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, ...valores }: EditarItemPedidoAvulsoFormValues & { itemId: string }) =>
      api.put<PedidoAvulso>(`/api/pedidos/avulsos/${pedidoId}/itens/${itemId}`, valores),
    onSuccess: (pedido) => queryClient.setQueryData([...chave, pedidoId], pedido),
  })
}

// Remove um item de um Pedido avulso ainda `ABERTO`.
export function useRemoverItemPedidoAvulso(pedidoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => api.delete<PedidoAvulso>(`/api/pedidos/avulsos/${pedidoId}/itens/${itemId}`),
    onSuccess: (pedido) => queryClient.setQueryData([...chave, pedidoId], pedido),
  })
}

// Fecha o Pedido avulso: congela os itens e o total (`FECHADO`, não aceita mais item).
export function useFecharPedidoAvulso(pedidoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<PedidoAvulso>(`/api/pedidos/avulsos/${pedidoId}/fechar`),
    onSuccess: (pedido) => queryClient.setQueryData([...chave, pedidoId], pedido),
  })
}

export function usePedidoAvulso(pedidoId: string | undefined) {
  return useQuery({
    queryKey: [...chave, pedidoId] as const,
    queryFn: () => api.get<PedidoAvulso>(`/api/pedidos/avulsos/${pedidoId}`),
    enabled: !!pedidoId,
    // As mutações (criar/adicionar/editar/remover/fechar item) já escrevem o
    // resultado fresco direto nesta mesma chave — sem isso, cada uma delas
    // dispararia também um refetch imediato e redundante (a página troca de
    // URL logo depois de criar, remontando e assinando a query de novo).
    staleTime: 30_000,
  })
}

// Exclui um Pedido avulso ainda em `ABERTO`.
export function useExcluirPedidoAvulso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pedidoId: string) => api.delete<void>(`/api/pedidos/avulsos/${pedidoId}`),
    onSuccess: (_, pedidoId) => {
      queryClient.removeQueries({ queryKey: [...chave, pedidoId] })
      queryClient.invalidateQueries({ queryKey: ['pedidos-agrupados'] })
    },
  })
}

