import { createContext } from 'react'

export interface AuthContextValue {
  token: string | null
  isAutenticado: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
