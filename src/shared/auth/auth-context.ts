import { createContext } from 'react'
import type { AreaSensivel, Papel } from '@/shared/domain/papel'

export interface AuthContextValue {
  token: string | null
  isAutenticado: boolean
  carregando: boolean
  papel: Papel | null
  podeVer: (area: AreaSensivel) => boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
