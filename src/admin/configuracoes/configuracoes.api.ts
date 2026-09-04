import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/api-client'
import type { Configuracao, ConfiguracaoFormValues } from './configuracoes.schema'

const chave = ['configuracao-loja'] as const

export const CONFIGURACAO_SEED: Configuracao = {
  nome: 'Sara Supermercado',
  corPrimaria: '#0f766e',
  telefone: '(11) 4002-8922',
  layoutEmail: 'Olá {representante},\n\nSegue o convite para a cotação. Acesse o link para enviar seus preços.',
  estiloNavegacao: 'LATERAL',
  tema: 'CLARO',
  linkColaboradorToken: 'link-colaborador-exemplo',
}

// ---- MOCK local (substituir pelas chamadas reais a GET/PUT /api/configuracoes na task 4.1) ----
let valorEmMemoria: Configuracao = { ...CONFIGURACAO_SEED }
let falhaAoSalvar: string | null = null

export function definirFalhaAoSalvar(mensagem: string | null): void {
  falhaAoSalvar = mensagem
}

export function definirConfiguracaoMock(parcial: Partial<Configuracao>): void {
  valorEmMemoria = { ...valorEmMemoria, ...parcial }
}

export function resetarMock(): void {
  valorEmMemoria = { ...CONFIGURACAO_SEED }
  falhaAoSalvar = null
}

function aguardar(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 50))
}

export async function buscarConfiguracao(): Promise<Configuracao> {
  await aguardar()
  return { ...valorEmMemoria }
}

export async function salvarConfiguracao(valores: ConfiguracaoFormValues): Promise<Configuracao> {
  await aguardar()
  if (falhaAoSalvar) {
    throw new ApiError({ type: 'about:blank', title: 'Erro', status: 400, detail: falhaAoSalvar })
  }
  // Merge (não substituição): preserva campos somente-leitura como
  // `linkColaboradorToken`, que não fazem parte do formulário de submit.
  valorEmMemoria = { ...valorEmMemoria, ...valores }
  return { ...valorEmMemoria }
}
// ------------------------------------------------------------------------------------------------

export function useConfiguracaoLoja() {
  return useQuery({
    queryKey: chave,
    queryFn: buscarConfiguracao,
  })
}

export function useAtualizarConfiguracao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: salvarConfiguracao,
    onSuccess: (nova) => queryClient.setQueryData(chave, nova),
  })
}
