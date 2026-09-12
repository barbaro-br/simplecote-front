import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
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
