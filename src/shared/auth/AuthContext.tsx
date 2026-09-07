import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { api, definirToken, renovarSessao } from '@/shared/api/api-client'
import { podeVerArea, type AreaSensivel } from '@/shared/domain/papel'
import { definirCompradorTag, limparCompradorTag } from '@/shared/observability/sentry'
import { decodificarClaims } from './jwt'
import { AuthContext } from './auth-context'

interface TokenResponse {
  token: string
}

interface AuthState {
  token: string | null
}

// Token do SUPER_ADMIN guardado ao entrar no modo suporte, para restaurar ao sair.
let tokenSuperAdminGuardado: string | null = null

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
    tokenSuperAdminGuardado = null
    definirToken(null)
    setAuth({ token: null })
  }, [])

  const entrarComoSuporte = useCallback(
    (tokenSuporte: string) => {
      // guarda o token de SUPER_ADMIN (para restaurar) e assume o de suporte.
      if (auth.token) tokenSuperAdminGuardado = auth.token
      definirToken(tokenSuporte)
      setAuth({ token: tokenSuporte })
    },
    [auth.token],
  )

  const sairModoSuporte = useCallback(async () => {
    const anterior = tokenSuperAdminGuardado
    tokenSuperAdminGuardado = null
    let token: string | null = anterior
    if (!token) {
      // token guardado perdido (reload) → renova pelo cookie do SUPER_ADMIN,
      // que continua válido (o cookie não é do token de suporte).
      token = await renovarSessao()
    }
    definirToken(token)
    setAuth({ token })
  }, [])

  // `papel`/`modoSuporte` derivam do token atual (decodificado em memória) e são
  // recomputados a cada render — quando `login`/`renovarSessao`/`entrarComoSuporte`
  // trocam o token, acompanham.
  const claims = decodificarClaims(auth.token)
  const papel = claims?.papel ?? null
  const modoSuporte = claims?.impersonatedBy != null
  const podeVer = useCallback((area: AreaSensivel) => podeVerArea(papel, area), [papel])

  // Tag de inquilino no Sentry: reflete o `compradorId` da sessão corrente. Vazio
  // (sem sessão, SUPER_ADMIN) limpa — rotas públicas por token nunca setam.
  const compradorId = claims?.compradorId ?? null
  useEffect(() => {
    if (compradorId) {
      definirCompradorTag(compradorId)
    } else {
      limparCompradorTag()
    }
  }, [compradorId])

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        isAutenticado: auth.token !== null,
        carregando,
        papel,
        modoSuporte,
        podeVer,
        login,
        logout,
        entrarComoSuporte,
        sairModoSuporte,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
