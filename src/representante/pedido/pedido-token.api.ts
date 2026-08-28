import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, baixarArquivo } from '@/shared/api/api-client'

export type ItemPedido = {
  id: string
  itemCotacaoId: string
  lanceId: string | null
  nomeSnapshot: string
  unidadeSnapshot: string
  quantidadePorEmbalagemSnapshot: number
  quantidade: number
  precoEmbalagem: number
  precoUnitario: number
  subtotal: number
}

export type PedidoPorToken = {
  id: string
  cotacaoId: string
  participanteId: string
  empresaNome: string
  status: string
  observacao: string | null
  geradoEm: string
  enviadoEm: string | null
  confirmadoEm: string | null
  itens: ItemPedido[]
  total: number
}

const pedidoKey = (token: string) => ['public-pedido', token] as const

export function usePedidoPorToken(token: string) {
  return useQuery({
    queryKey: pedidoKey(token),
    queryFn: () => api.get<PedidoPorToken>(`/public/pedidos/${token}`),
    retry: false,
  })
}

export function useConfirmarPedido(token: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (observacao?: string) =>
      api.post<PedidoPorToken>(`/public/pedidos/${token}/confirmar`, observacao ? { observacao } : {}),
    onSuccess: (data) => queryClient.setQueryData(pedidoKey(token), data),
  })
}

export const baixarPedidoPdfPublico = (token: string) =>
  baixarArquivo(`/public/pedidos/${token}.pdf`, `pedido-${token}.pdf`)
