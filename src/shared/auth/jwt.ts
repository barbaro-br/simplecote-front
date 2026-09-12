import type { Papel } from '@/shared/domain/papel'

// Decodificação do access token em memória (decisão §E do RISCOS-TRANSVERSAIS):
// `atob` do payload do JWT, SEM lib e SEM verificar assinatura. É só decisão de
// UI — a segurança é do servidor (papel é enforçado no back, o front só espelha).
// Claims emitidos pelo back (AuthService): `papel`, `slug`, `compradorId`; e
// `impersonatedBy` no token de suporte (change backoffice-do-saas).

export interface ClaimsSessao {
  papel: Papel | null
  slug: string | null
  compradorId: string | null
  impersonatedBy: string | null
  exp: number | null
}

const PAPEIS: readonly Papel[] = ['OWNER', 'ADMIN', 'OPERADOR', 'SUPER_ADMIN']

function ehPapel(valor: unknown): valor is Papel {
  return typeof valor === 'string' && (PAPEIS as readonly string[]).includes(valor)
}

export function decodificarClaims(token: string | null): ClaimsSessao | null {
  if (!token) return null
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    // base64url → base64 (troca -_ por +/ e completa o padding de '=').
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const json = JSON.parse(atob(base64 + padding))
    return {
      papel: ehPapel(json.papel) ? json.papel : null,
      slug: typeof json.slug === 'string' ? json.slug : null,
      compradorId: typeof json.compradorId === 'string' ? json.compradorId : null,
      impersonatedBy: typeof json.impersonatedBy === 'string' ? json.impersonatedBy : null,
      exp: typeof json.exp === 'number' ? json.exp : null,
    }
  } catch {
    return null
  }
}
