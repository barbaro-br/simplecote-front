import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { CondicaoPagamento, CondicaoPagamentoFormValues } from './condicoes-pagamento.schema'

const chave = ['condicoes-pagamento'] as const

// Por padrão só as ativas (`queryKey ['condicoes-pagamento']`) — o que os
// combobox de Cotação/resposta do representante/Pedido avulso esperam. A
// tela de Condições de Pagamento passa `{ incluirInativos: true }`.
export function useCondicoesPagamento(opts?: { incluirInativos?: boolean }) {
  const incluirInativos = opts?.incluirInativos ?? false
  return useQuery({
    queryKey: incluirInativos ? ([...chave, { incluirInativos: true }] as const) : chave,
    queryFn: () =>
      api.get<CondicaoPagamento[]>(`/api/condicoes-pagamento${incluirInativos ? '?incluirInativos=true' : ''}`),
  })
}

export function useCriarCondicaoPagamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: CondicaoPagamentoFormValues) =>
      api.post<CondicaoPagamento>('/api/condicoes-pagamento', valores),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useInativarCondicaoPagamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/condicoes-pagamento/${id}/inativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useAtivarCondicaoPagamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/condicoes-pagamento/${id}/ativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}
