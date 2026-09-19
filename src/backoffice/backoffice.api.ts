import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api, baixarArquivo, type ResultadoBaixarArquivo } from '@/shared/api/api-client'
import {
  compradorAdminDetalheSchema,
  compradorAdminListaSchema,
  cotacaoResumoListaSchema,
  metricasCatalogoGlobalSchema,
  notaListaSchema,
  paginaCatalogoGlobalSchema,
  resumoSaasSchema,
  timelineListaSchema,
  qrCodeResponseSchema,
  connectionStatusResponseSchema,
  type CompradorAdmin,
  type CompradorAdminDetalhe,
  type CotacaoResumo,
  type Nota,
  type ResumoSaas,
  type TimelineItem,
} from './backoffice.schema'

// Contrato da change backoffice-super-admin do back. Todas as rotas
// `/api/admin/compradores/**` exigem SUPER_ADMIN (barrado antes no back).

const chave = ['admin', 'compradores'] as const

function invalidar(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: chave })
}

export function useCompradores(opts?: { status?: string; busca?: string }) {
  const params = new URLSearchParams()
  if (opts?.status) params.set('status', opts.status)
  if (opts?.busca) params.set('busca', opts.busca)
  const qs = params.toString()
  return useQuery({
    queryKey: ['admin', 'compradores', opts?.status ?? '', opts?.busca ?? ''],
    queryFn: () =>
      api
        .get<CompradorAdmin[]>(`/api/admin/compradores${qs ? `?${qs}` : ''}`)
        .then((d) => compradorAdminListaSchema.parse(d)),
  })
}

export function useResumoSaas() {
  return useQuery({
    queryKey: ['admin', 'resumo'],
    queryFn: () => api.get<ResumoSaas>('/api/admin/resumo').then((d) => resumoSaasSchema.parse(d)),
  })
}

export function useComprador(id: string) {
  return useQuery({
    queryKey: ['admin', 'compradores', id],
    queryFn: () =>
      api.get<CompradorAdminDetalhe>(`/api/admin/compradores/${id}`).then((d) => compradorAdminDetalheSchema.parse(d)),
  })
}

export function useCotacoesDaLoja(id: string) {
  return useQuery({
    queryKey: ['admin', 'compradores', id, 'cotacoes'],
    queryFn: () =>
      api
        .get<CotacaoResumo[]>(`/api/admin/compradores/${id}/cotacoes`)
        .then((d) => cotacaoResumoListaSchema.parse(d)),
  })
}

/** Baixa o relatório CSV de uso da loja (ação imperativa por clique, não `useQuery`). */
export function baixarRelatorio(id: string, slug: string): Promise<ResultadoBaixarArquivo> {
  return baixarArquivo(`/api/admin/compradores/${id}/relatorio`, `${slug}-uso.csv`)
}

export function useSuspenderComprador(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<void>(`/api/admin/compradores/${id}/suspender`),
    onSuccess: () => invalidar(queryClient),
  })
}

export function useReativarComprador(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<void>(`/api/admin/compradores/${id}/reativar`),
    onSuccess: () => invalidar(queryClient),
  })
}

export function useResetarSenhaAdmin(id: string) {
  return useMutation({
    mutationFn: (usuarioId: string) =>
      api.post<void>(`/api/admin/compradores/${id}/resetar-senha-admin`, { usuarioId }),
  })
}

export function useEntrarComoSuporte() {
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      api.post<{ token: string; expiraEm: string }>(`/api/admin/compradores/${id}/suporte`, { motivo }),
  })
}

// Exclusão permanente de uma loja (change backoffice-excluir-comprador): purga
// imediata, sem carência.
export function useExcluirComprador(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<void>(`/api/admin/compradores/${id}/excluir`),
    onSuccess: () => invalidar(queryClient),
  })
}

// Define (ou remove) o prazo de teste de uma loja — `expiraEm` nulo = sem prazo.
export function useDefinirPrazo(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (expiraEm: string | null) => api.post<void>(`/api/admin/compradores/${id}/prazo`, { expiraEm }),
    onSuccess: () => invalidar(queryClient),
  })
}

// Reenvia o e-mail de verificação do OWNER de uma loja (change
// backoffice-reenviar-verificacao). Invalida o detalhe para refletir o novo estado.
export function useReenviarVerificacao(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<void>(`/api/admin/compradores/${id}/reenviar-verificacao`),
    onSuccess: () => invalidar(queryClient),
  })
}

// Notas e timeline (change backoffice-notas-e-auditoria).
function invalidarNotasETimeline(queryClient: QueryClient, id: string) {
  queryClient.invalidateQueries({ queryKey: ['admin', 'compradores', id, 'notas'] })
  queryClient.invalidateQueries({ queryKey: ['admin', 'compradores', id, 'timeline'] })
}

export function useNotas(id: string) {
  return useQuery({
    queryKey: ['admin', 'compradores', id, 'notas'],
    queryFn: () =>
      api.get<Nota[]>(`/api/admin/compradores/${id}/notas`).then((d) => notaListaSchema.parse(d)),
  })
}

export function useTimeline(id: string) {
  return useQuery({
    queryKey: ['admin', 'compradores', id, 'timeline'],
    queryFn: () =>
      api
        .get<TimelineItem[]>(`/api/admin/compradores/${id}/timeline`)
        .then((d) => timelineListaSchema.parse(d)),
  })
}

export function useAdicionarNota(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (texto: string) => api.post<void>(`/api/admin/compradores/${id}/notas`, { texto }),
    onSuccess: () => invalidarNotasETimeline(queryClient, id),
  })
}

export function useRemoverNota(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notaId: string) => api.delete<void>(`/api/admin/compradores/${id}/notas/${notaId}`),
    onSuccess: () => invalidarNotasETimeline(queryClient, id),
  })
}

// Catálogo global — revisão e métrica de uso (change revisao-e-metrica-catalogo-global).
const chaveCatalogoGlobal = ['admin', 'catalogo-global'] as const

export function useCatalogoGlobal(opts: { q?: string; apenasNaoRevisados?: boolean; pagina?: number; tamanho?: number }) {
  const { q = '', apenasNaoRevisados = false, pagina = 0, tamanho = 30 } = opts
  const params = new URLSearchParams()
  if (q.trim()) params.set('q', q.trim())
  if (apenasNaoRevisados) params.set('apenasNaoRevisados', 'true')
  params.set('pagina', String(pagina))
  params.set('tamanho', String(tamanho))
  return useQuery({
    queryKey: [...chaveCatalogoGlobal, q.trim(), apenasNaoRevisados, pagina, tamanho],
    queryFn: () =>
      api.get<unknown>(`/api/admin/catalogo-global?${params}`).then((d) => paginaCatalogoGlobalSchema.parse(d)),
  })
}

export function useMetricasCatalogoGlobal() {
  return useQuery({
    queryKey: [...chaveCatalogoGlobal, 'metricas'],
    queryFn: () =>
      api.get<unknown>('/api/admin/catalogo-global/metricas').then((d) => metricasCatalogoGlobalSchema.parse(d)),
  })
}

export function useCorrigirCatalogoGlobal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nome, marca }: { id: string; nome: string; marca: string | null }) =>
      api.put<void>(`/api/admin/catalogo-global/${id}`, { nome, marca }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveCatalogoGlobal }),
  })
}

export function useMarcarRevisadoCatalogoGlobal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/admin/catalogo-global/${id}/revisar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveCatalogoGlobal }),
  })
}

// Gerenciamento de WhatsApp Próprio via Evolution API
export function useAlternarWhatsAppProprio(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (usa: boolean) => api.post<void>(`/api/admin/compradores/${id}/whatsapp-proprio?usa=${usa}`),
    onSuccess: () => invalidar(queryClient),
  })
}

export function useQrCodeWhatsApp(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'compradores', id, 'whatsapp', 'qr-code'],
    queryFn: () => api.get<unknown>(`/api/admin/compradores/${id}/whatsapp/qr-code`).then((d) => qrCodeResponseSchema.parse(d)),
    enabled,
    refetchInterval: false,
  })
}

export function useStatusWhatsApp(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'compradores', id, 'whatsapp', 'status'],
    queryFn: () => api.get<unknown>(`/api/admin/compradores/${id}/whatsapp/status`).then((d) => connectionStatusResponseSchema.parse(d)),
    enabled,
    refetchInterval: false,
  })
}

export function useDesconectarWhatsApp(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<void>(`/api/admin/compradores/${id}/whatsapp/disconnect`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'compradores', id, 'whatsapp'] })
    },
  })
}

export function useGlobalQrCodeWhatsApp() {
  return useQuery({
    queryKey: ['backoffice', 'whatsapp', 'qr-code'],
    queryFn: () => api.get<{ base64: string }>('/api/admin/whatsapp/qr-code'),
    enabled: false,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useGlobalStatusWhatsApp(enabled: boolean) {
  return useQuery({
    queryKey: ['backoffice', 'whatsapp', 'status'],
    queryFn: () => api.get<{ state: string }>('/api/admin/whatsapp/status'),
    enabled,
    refetchInterval: (q) => (q.state.data?.state === 'open' ? false : 3000),
  })
}

export function useGlobalDesconectarWhatsApp() {
  return useMutation({
    mutationFn: () => api.post<void>('/api/admin/whatsapp/disconnect'),
  })
}
