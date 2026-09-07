import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Configuracao, ConfiguracaoFormValues } from './configuracoes.schema'
import { api, baixarArquivo, type ResultadoBaixarArquivo } from '@/shared/api/api-client'

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

export async function enviarLinkColaborador({ email }: { email: string }): Promise<void> {
  return api.post<void>('/api/configuracoes/colaborador/enviar-link', { email })
}

export function useEnviarLinkColaborador() {
  return useMutation({
    mutationFn: enviarLinkColaborador,
  })
}

// Exportação dos dados da organização (change observabilidade-e-conformidade-por-tenant).
// 200 → download direto; 202 → o back gera assíncrono e envia por e-mail.
export function exportarDadosOrganizacao(): Promise<ResultadoBaixarArquivo> {
  return baixarArquivo('/api/organizacao/exportacao', 'exportacao-simplecote.xlsx')
}

// Encerramento da organização: soft-delete + revogação de sessões (OWNER-only no back).
export function encerrarOrganizacao(): Promise<void> {
  return api.delete<void>('/api/organizacao')
}
