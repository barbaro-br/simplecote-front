import { useState, useCallback, type ReactNode } from 'react'
import { api } from '@/shared/api/api-client'
import { AuthContext } from './auth-context'

interface TokenResponse {
  token: string
}

interface AuthState {
  token: string | null
}

const SESSION_KEY = 'simplecote_token'

function lerTokenDaSessao(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function salvarTokenNaSessao(token: string): void {
  try {
    sessionStorage.setItem(SESSION_KEY, token)
  } catch {
    // sessionStorage indisponível — token só fica em memória
  }
}

function removerTokenDaSessao(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignorar
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => ({
    token: lerTokenDaSessao(),
  }))

  const login = useCallback(async (email: string, senha: string) => {
    const { token } = await api.post<TokenResponse>('/api/auth/login', { email, senha })
    salvarTokenNaSessao(token)
    setAuth({ token })
  }, [])

  const logout = useCallback(() => {
    removerTokenDaSessao()
    setAuth({ token: null })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        isAutenticado: auth.token !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
