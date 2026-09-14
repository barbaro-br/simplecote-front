export type Papel = 'OWNER' | 'ADMIN' | 'OPERADOR' | 'SUPER_ADMIN'

export interface ClaimsSessao {
  papel: Papel | null
  slug: string | null
  compradorId: string | null
  sub: string | null
  exp: number | null
}

const PAPEIS: readonly Papel[] = ['OWNER', 'ADMIN', 'OPERADOR', 'SUPER_ADMIN']

function ehPapel(valor: unknown): valor is Papel {
  return typeof valor === 'string' && (PAPEIS as readonly string[]).includes(valor)
}

// Decodifica o payload do JWT sem verificar assinatura — o papel é
// enforçado no backend, isto é só espelho pra UI (mostrar/esconder telas).
export function decodificarClaims(token: string | null): ClaimsSessao | null {
  if (!token) return null
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const json = JSON.parse(atob(base64 + padding))
    return {
      papel: ehPapel(json.papel) ? json.papel : null,
      slug: typeof json.slug === 'string' ? json.slug : null,
      compradorId: typeof json.compradorId === 'string' ? json.compradorId : null,
      sub: typeof json.sub === 'string' ? json.sub : null,
      exp: typeof json.exp === 'number' ? json.exp : null,
    }
  } catch {
    return null
  }
}
