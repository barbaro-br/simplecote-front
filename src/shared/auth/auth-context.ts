import { createContext } from 'react'

export interface AuthContextValue {
  token: string | null
  isAutenticado: boolean
  carregando: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
