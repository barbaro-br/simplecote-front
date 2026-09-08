import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api, baixarArquivo, type ResultadoBaixarArquivo } from '@/shared/api/api-client'
import {
  compradorAdminDetalheSchema,
  compradorAdminListaSchema,
  cotacaoResumoListaSchema,
  resumoSaasSchema,
  type CompradorAdmin,
  type CompradorAdminDetalhe,
  type CotacaoResumo,
  type ResumoSaas,
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
