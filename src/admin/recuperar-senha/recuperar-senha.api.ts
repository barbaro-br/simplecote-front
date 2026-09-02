import { useMutation } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/api-client'

// ---- MOCK local (substituir pelas chamadas reais aos endpoints na task 3.1) ----
// POST /api/auth/esqueci-senha  → sempre 200 genérico (anti-enumeration)
// POST /api/auth/redefinir-senha → 200 em sucesso, 4xx se o token for inválido/expirado

const TOKEN_VALIDO = 'token-valido'

function aguardar(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 50))
}

export async function solicitarRecuperacao(_email: string): Promise<void> {
  await aguardar()
  // Sempre retorna sucesso genérico: o front NÃO deve distinguir e-mail
  // existente de inexistente (a distinção é responsabilidade do back, que
  // não deve expô-la).
}

export async function redefinirSenha({
  token,
}: {
  token: string
  novaSenha: string
}): Promise<void> {
  await aguardar()
  if (token !== TOKEN_VALIDO) {
    throw new ApiError({
      type: 'about:blank',
      title: 'Link inválido',
      status: 400,
      detail: 'O link de redefinição é inválido ou expirou. Solicite um novo link.',
    })
  }
}
// ------------------------------------------------------------------------------------------------

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
