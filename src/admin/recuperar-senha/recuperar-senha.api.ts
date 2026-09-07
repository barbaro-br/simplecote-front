import { useMutation } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'

// Endpoints reais em /api/auth/** (liberados no SecurityConfig do back).
// - POST /api/auth/esqueci-senha  → 200 com mensagem genérica, exista ou não o
//   e-mail (anti-enumeration é responsabilidade do back; o front nunca distingue).
// - POST /api/auth/redefinir-senha → 200 em sucesso; 422 (ApiError) quando o
//   código está errado/expirou/estourou tentativas (mesma resposta para e-mail
//   inexistente). O contrato com `{ email, codigo, novaSenha }` é da change
//   `recuperar-senha-por-codigo` do back.

type MensagemResponse = { mensagem: string }

export async function solicitarRecuperacao(email: string): Promise<void> {
  await api.post<MensagemResponse>('/api/auth/esqueci-senha', { email })
}

export async function redefinirSenha({
  email,
  codigo,
  novaSenha,
}: {
  email: string
  codigo: string
  novaSenha: string
}): Promise<void> {
  await api.post<MensagemResponse>('/api/auth/redefinir-senha', { email, codigo, novaSenha })
}

export function useSolicitarRecuperacao() {
  return useMutation({
    mutationFn: solicitarRecuperacao,
  })
}

export function useRedefinirSenha() {
  return useMutation({
    mutationFn: redefinirSenha,
  })
}
