import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { Pedido } from '@/admin/cotacoes/cotacoes.schema'
import type { PedidosAgrupados } from './pedidos.schema'

const chave = ['pedidos'] as const

// Agregado novo (change aba-pedidos-e-condicao-pagamento): o back já agrupa
// por Cotação e separa os avulsos — o front não reagrupa nada.
export function usePedidosAgregados() {
  return useQuery({
    queryKey: chave,
    queryFn: () => api.get<PedidosAgrupados>('/api/pedidos'),
  })
}

// Reenvia o e-mail do pedido ao representante vencedor (mesmo endpoint que o
// envio inicial, `POST /{id}/enviar` — reenviar é só chamar de novo).
export function useReenviarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pedidoId: string) => api.post<Pedido>(`/api/pedidos/${pedidoId}/enviar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}
