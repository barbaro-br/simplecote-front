import { createContext } from 'react'

export interface TenantContextValue {
  /** Slug da loja resolvido do hostname (null = host sem loja). */
  slug: string | null
  /** true/false quando o slug existe e o check resolveu; null sem slug ou verificando. */
  existe: boolean | null
  /** true enquanto `GET /public/compradores/{slug}/existe` está em voo. */
  verificando: boolean
  /** O host atual é do app (`.simplecote.app`) — base da guarda slug × JWT. */
  ehHostDoApp: boolean
}

export const TenantContext = createContext<TenantContextValue | null>(null)
