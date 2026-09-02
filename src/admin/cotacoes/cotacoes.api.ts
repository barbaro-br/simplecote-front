import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, baixarArquivo } from '@/shared/api/api-client'
import type {
  AbrirCotacaoValues,
  AdicionarItemValues,
  CorrecaoLance,
  CotacaoDetalhe,
  CotacaoDuplicada,
  CotacaoResumo,
  CriarCotacaoValues,
  GridAoVivo,
  ParticipanteDaCotacao,
  Pedido,
  Resultado,
} from './cotacoes.schema'

const listaKey = ['cotacoes'] as const
const detalheKey = (id: string) => ['cotacao', id] as const
const resultadoKey = (id: string) => ['cotacao', id, 'resultado'] as const
const pedidosKey = (id: string) => ['cotacao', id, 'pedidos'] as const
const participantesKey = (id: string) => ['cotacao', id, 'participantes'] as const
const aoVivoKey = (id: string) => ['cotacao', id, 'ao-vivo'] as const
const correcoesKey = (id: string) => ['cotacao', id, 'correcoes'] as const

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

export function useExcluirCotacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/cotacoes/${id}`),
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

export function useAtualizarQuantidadeItem(cotacaoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, quantidade }: { itemId: string; quantidade: number }) =>
      api.patch<void>(`/api/cotacoes/${cotacaoId}/itens/${itemId}/quantidade`, { quantidade }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detalheKey(cotacaoId) })
      queryClient.invalidateQueries({ queryKey: aoVivoKey(cotacaoId) })
    },
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

// --- Participantes e respostas (change admin-cotacoes-participantes-respostas) ---

export function useParticipantes(cotacaoId: string) {
  return useQuery({
    queryKey: participantesKey(cotacaoId),
    queryFn: () => api.get<ParticipanteDaCotacao[]>(`/api/cotacoes/${cotacaoId}/participantes`),
  })
}

export function useConvidarEmpresas(cotacaoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (empresaIds: string[]) =>
      api.post<unknown>(`/api/cotacoes/${cotacaoId}/participantes`, { empresaIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: participantesKey(cotacaoId) }),
  })
}

export function useReenviarConvite(cotacaoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (participanteId: string) =>
      api.post<unknown>(`/api/participantes/${participanteId}/reenviar-convite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: participantesKey(cotacaoId) }),
  })
}

// Leitura pontual da grade — sem refetchInterval.
export function useAoVivo(cotacaoId: string) {
  return useQuery({
    queryKey: aoVivoKey(cotacaoId),
    queryFn: () => api.get<GridAoVivo>(`/api/cotacoes/${cotacaoId}/ao-vivo`),
  })
}

// Grade da tela de acompanhamento (agora consumida via SSE se ABERTA)
export function useGradeAoVivo(cotacaoId: string) {
  return useQuery({
    queryKey: aoVivoKey(cotacaoId),
    queryFn: () => api.get<GridAoVivo>(`/api/cotacoes/${cotacaoId}/ao-vivo`),
  })
}

export function useGradeAoVivoSSE(cotacaoId: string, status?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (status !== 'ABERTA') {
      return
    }

    const eventSource = new EventSource(`/api/cotacoes/${cotacaoId}/ao-vivo/stream`)

    eventSource.addEventListener('LanceAtualizado', () => {
      queryClient.invalidateQueries({ queryKey: aoVivoKey(cotacaoId) })
    })
    
    eventSource.addEventListener('Conectado', () => {
      // Ignorar
    })

    eventSource.onerror = () => {
      // Reconexão é tratada automaticamente pelo EventSource
    }

    return () => {
      eventSource.close()
    }
  }, [cotacaoId, status, queryClient])
}

export function useCorrecoes(cotacaoId: string) {
  return useQuery({
    queryKey: correcoesKey(cotacaoId),
    queryFn: () => api.get<CorrecaoLance[]>(`/api/cotacoes/${cotacaoId}/correcoes`),
  })
}

type CorrigirLanceArgs = {
  participanteId: string
  itemId: string
  preco?: number
  naoCotado?: boolean
}

export function useCorrigirLance(cotacaoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ participanteId, itemId, preco, naoCotado }: CorrigirLanceArgs) =>
      api.put<void>(`/api/participantes/${participanteId}/lances/${itemId}`, { preco, naoCotado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aoVivoKey(cotacaoId) })
      queryClient.invalidateQueries({ queryKey: correcoesKey(cotacaoId) })
    },
  })
}

export function useReabrirParticipante(cotacaoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (participanteId: string) =>
      api.post<void>(`/api/participantes/${participanteId}/reabrir`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantesKey(cotacaoId) })
      queryClient.invalidateQueries({ queryKey: aoVivoKey(cotacaoId) })
    },
  })
}
