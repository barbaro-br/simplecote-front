import { createContext } from 'react'
import type { AreaSensivel, Papel } from '@/shared/domain/papel'

export interface AuthContextValue {
  token: string | null
  isAutenticado: boolean
  carregando: boolean
  papel: Papel | null
  /** true quando a sessão é de suporte (token com claim `impersonatedBy`). */
  modoSuporte: boolean
  podeVer: (area: AreaSensivel) => boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  /** Troca a sessão pelo token de suporte, guardando o token atual para restaurar. */
  entrarComoSuporte: (tokenSuporte: string) => void
  /** Restaura a sessão de SUPER_ADMIN (guarda ou renova pelo cookie). */
  sairModoSuporte: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
