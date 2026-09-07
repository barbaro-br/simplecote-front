import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'

// Contrato da change onboarding-estado-e-dados-exemplo do back:
// - GET  /api/onboarding → { temProduto, temRepresentante, temCotacao, dispensado, modoTeste }
// - PUT  /api/onboarding/dispensar { dispensado } → 204
// - POST /api/onboarding/dados-exemplo → 204 (só TESTE; senão 422)
// - DELETE /api/onboarding/dados-exemplo → 204

export interface OnboardingEstado {
  temProduto: boolean
  temRepresentante: boolean
  temCotacao: boolean
  dispensado: boolean
  modoTeste: boolean
}

const chave = ['onboarding'] as const

export function useOnboarding() {
  return useQuery({
    queryKey: chave,
    queryFn: () => api.get<OnboardingEstado>('/api/onboarding'),
  })
}

export function useDispensarOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dispensado: boolean) => api.put<void>('/api/onboarding/dispensar', { dispensado }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

// Semear/limpar dados de exemplo mexem no catálogo, empresas e representantes.
const CHAVES_AFETADAS = [chave, ['produtos'], ['representantes'], ['empresas']] as const

export function useSemearDadosExemplo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<void>('/api/onboarding/dados-exemplo'),
    onSuccess: () => {
      for (const k of CHAVES_AFETADAS) queryClient.invalidateQueries({ queryKey: [...k] })
    },
  })
}

export function useLimparDadosExemplo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete<void>('/api/onboarding/dados-exemplo'),
    onSuccess: () => {
      for (const k of CHAVES_AFETADAS) queryClient.invalidateQueries({ queryKey: [...k] })
    },
  })
}
