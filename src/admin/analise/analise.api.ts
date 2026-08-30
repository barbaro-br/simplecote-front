import { api, ApiError } from '@/shared/api/api-client'
import {
  dashboardSchema,
  insightProdutosMapSchema,
  insightEmpresaSchema,
  type Dashboard,
  type InsightProduto,
  type InsightEmpresa,
} from './analise.schema'

function parseSchema<T>(schema: { parse: (val: unknown) => T }, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    console.error('Schema validation error:', error)
    throw new ApiError({
      type: 'about:blank',
      title: 'Erro de validação',
      status: 500,
      detail: 'Formato de resposta inesperado.',
    })
  }
}

export async function buscarDashboard(): Promise<Dashboard> {
  const data = await api.get('/api/analises/dashboard')
  return parseSchema(dashboardSchema, data)
}

export async function buscarInsightProdutos(ids: string[]): Promise<Record<string, InsightProduto>> {
  if (ids.length === 0) {
    return {}
  }
  const data = await api.get(`/api/analises/produtos/insight?ids=${ids.join(',')}`)
  return parseSchema(insightProdutosMapSchema, data)
}

export async function buscarInsightEmpresa(id: string): Promise<InsightEmpresa> {
  const data = await api.get(`/api/analises/empresas/${id}/insight`)
  return parseSchema(insightEmpresaSchema, data)
}

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useInsightProdutos(ids: string[]) {
  const queryClient = useQueryClient()
  const sortedIds = [...ids].sort()
  
  const query = useQuery({
    queryKey: ['analise', 'insight-produtos-lote', sortedIds],
    queryFn: () => buscarInsightProdutos(ids),
    enabled: ids.length > 0,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (query.data) {
      for (const id of ids) {
        queryClient.setQueryData(['analise', 'insight-produto', id], query.data[id] ?? null)
      }
    }
  }, [query.data, ids, queryClient])

  return query
}

export function useInsightEmpresa(empresaId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['analise', 'insight-empresa', empresaId],
    queryFn: () => buscarInsightEmpresa(empresaId),
    enabled: options?.enabled,
    staleTime: 300_000,
    retry: false,
  })
}
