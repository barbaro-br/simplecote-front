export {
  api,
  ApiError,
  SessaoExpiradaError,
  definirToken,
  renovarSessao as restaurarSessao,
  baixarArquivo,
} from '@/shared/api/api-client'
import type { ClaimsSessao } from './jwt'

export function getToken(): string | null {
  return null
}

export function getClaims(): ClaimsSessao | null {
  return null
}

export function configurarSessaoExpirada(_handler: () => void) {}

export async function login(_email: string, _senha: string): Promise<ClaimsSessao> {
  throw new Error('Use o AuthContext padrão do SimpleCote')
}

export async function logout(): Promise<void> {}
