import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { ItemPedidoAvulsoFormValues, PedidoAvulso } from './pedidos-avulsos.schema'

const chave = ['pedidos-avulsos'] as const

// Cria o Pedido avulso já com o primeiro item (design.md da change `pedido-avulso`
// no simplecote-back - Decisão 5): `POST /api/pedidos/avulsos`.
export function useCriarPedidoAvulso() {
  return useMutation({
    mutationFn: (valores: ItemPedidoAvulsoFormValues) =>
      api.post<PedidoAvulso>('/api/pedidos/avulsos', valores),
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
  })
}
