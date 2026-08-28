import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import type { Empresa, EmpresaFormValues } from './empresas.schema'

const chave = ['empresas'] as const

export function useEmpresas() {
  return useQuery({
    queryKey: chave,
    queryFn: () => api.get<Empresa[]>('/api/empresas'),
  })
}

export function useCriarEmpresa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (valores: EmpresaFormValues) => api.post<Empresa>('/api/empresas', valores),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useInativarEmpresa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/empresas/${id}/inativar`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export function useAtualizarEmpresa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, valores }: { id: string, valores: { nome: string } }) => 
      api.put<Empresa>(`/api/empresas/${id}`, valores),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

export type CriarRepresentanteRequest = {
  empresaId: string
  nome: string
  email: string
  whatsapp?: string
}

export function useCriarRepresentante() {
  return useMutation({
    mutationFn: (valores: CriarRepresentanteRequest) => 
      api.post<any>('/api/representantes', valores),
  })
}
