import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { api, definirToken, renovarSessao } from '@/shared/api/api-client'
import { AuthContext } from './auth-context'

interface TokenResponse {
  token: string
}

interface AuthState {
  token: string | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: null })
  const [carregando, setCarregando] = useState(true)

  // Boot: tenta restaurar a sessão uma vez via `POST /api/auth/refresh` (o
  // navegador reapresenta o cookie `httpOnly` do refresh). Enquanto resolve,
  // `carregando` é `true` para o `AuthGuard` não mandar o usuário pro `/login`
  // cedo demais (evita flash da tela de login a cada reload).
  useEffect(() => {
    let ativo = true
    renovarSessao().then((token) => {
      if (!ativo) return
      setAuth({ token })
      setCarregando(false)
    })
    return () => {
      ativo = false
    }
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const { token } = await api.post<TokenResponse>(
      '/api/auth/login',
      { email, senha },
      { credentials: 'include' },
    )
    definirToken(token)
    setAuth({ token })
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', undefined, { credentials: 'include' })
    } catch {
      // best effort — o estado local é limpo mesmo se o servidor falhar
    }
    definirToken(null)
    setAuth({ token: null })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        isAutenticado: auth.token !== null,
        carregando,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
