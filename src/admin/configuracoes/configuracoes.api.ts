import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Configuracao, ConfiguracaoFormValues } from './configuracoes.schema'
import { api } from '@/shared/api/api-client'

const chave = ['configuracao-loja'] as const

export async function buscarConfiguracao(): Promise<Configuracao> {
  return api.get<Configuracao>('/api/configuracoes')
}

export async function salvarConfiguracao(valores: ConfiguracaoFormValues): Promise<Configuracao> {
  return api.put<Configuracao>('/api/configuracoes', valores)
}

export function useConfiguracaoLoja(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: chave,
    queryFn: buscarConfiguracao,
    enabled: opts?.enabled ?? true,
  })
}

export function useAtualizarConfiguracao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: salvarConfiguracao,
    onSuccess: (nova) => {
      queryClient.setQueryData(chave, nova)
      queryClient.invalidateQueries({ queryKey: chave })
    },
  })
}
