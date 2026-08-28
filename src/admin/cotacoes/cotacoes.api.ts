import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, baixarArquivo } from '@/shared/api/api-client'
import type {
  AbrirCotacaoValues,
  AdicionarItemValues,
  CotacaoDetalhe,
  CotacaoDuplicada,
  CotacaoResumo,
  CriarCotacaoValues,
  Pedido,
  Resultado,
} from './cotacoes.schema'

const listaKey = ['cotacoes'] as const
const detalheKey = (id: string) => ['cotacao', id] as const
const resultadoKey = (id: string) => ['cotacao', id, 'resultado'] as const
const pedidosKey = (id: string) => ['cotacao', id, 'pedidos'] as const

export function useCotacoes() {
  return useQuery({
    queryKey: listaKey,
    queryFn: () => api.get<CotacaoResumo[]>('/api/cotacoes'),
  })
}

export function useCotacao(id: string) {
  return useQuery({
    queryKey: detalheKey(id),
    queryFn: () => api.get<CotacaoDetalhe>(`/api/cotacoes/${id}`),
  })
}

export function useCriarCotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: CriarCotacaoValues) => api.post<CotacaoDetalhe>('/api/cotacoes', valores),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listaKey }),
  })
}

export function useDuplicarCotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<CotacaoDuplicada>(`/api/cotacoes/${id}/duplicar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listaKey }),
  })
}

export function useAdicionarItem(cotacaoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: AdicionarItemValues) =>
      api.post<CotacaoDetalhe>(`/api/cotacoes/${cotacaoId}/itens`, valores),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: detalheKey(cotacaoId) }),
  })
}

export function useRemoverItem(cotacaoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => api.delete<void>(`/api/cotacoes/${cotacaoId}/itens/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: detalheKey(cotacaoId) }),
  })
}

function useTransicao(cotacaoId: string, acao: 'encerrar' | 'reabrir' | 'cancelar' | 'apurar') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<CotacaoDetalhe>(`/api/cotacoes/${cotacaoId}/${acao}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detalheKey(cotacaoId) })
      queryClient.invalidateQueries({ queryKey: listaKey })
    },
  })
}

export function useAbrir(cotacaoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: AbrirCotacaoValues) =>
      api.post<CotacaoDetalhe>(`/api/cotacoes/${cotacaoId}/abrir`, valores),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detalheKey(cotacaoId) })
      queryClient.invalidateQueries({ queryKey: listaKey })
    },
  })
}

export const useEncerrar = (id: string) => useTransicao(id, 'encerrar')
export const useReabrir = (id: string) => useTransicao(id, 'reabrir')
export const useCancelar = (id: string) => useTransicao(id, 'cancelar')
export const useApurar = (id: string) => useTransicao(id, 'apurar')

export function useResultado(id: string) {
  return useQuery({
    queryKey: resultadoKey(id),
    queryFn: () => api.get<Resultado>(`/api/cotacoes/${id}/resultado`),
  })
}

export function usePedidos(id: string) {
  return useQuery({
    queryKey: pedidosKey(id),
    queryFn: () => api.get<Pedido[]>(`/api/cotacoes/${id}/pedidos`),
  })
}

export function useEnviarPedido(cotacaoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pedidoId: string) => api.post<Pedido>(`/api/pedidos/${pedidoId}/enviar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultadoKey(cotacaoId) })
      queryClient.invalidateQueries({ queryKey: pedidosKey(cotacaoId) })
    },
  })
}

export const baixarResultadoXlsx = (id: string) =>
  baixarArquivo(`/api/cotacoes/${id}/resultado.xlsx`, `resultado-${id}.xlsx`)

export const baixarPedidoPdf = (pedidoId: string) =>
  baixarArquivo(`/api/pedidos/${pedidoId}.pdf`, `pedido-${pedidoId}.pdf`)
