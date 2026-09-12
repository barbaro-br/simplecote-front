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

// O token de suporte (impersonação) não é renovável pelo cookie — um reload
// perdia essa variável de módulo e o boot normal restaurava o SUPER_ADMIN via
// `renovarSessao`, jogando o admin de volta pro backoffice no meio do
// atendimento. Guardamos uma cópia fora do estado do React só pra sobreviver
// ao reload: se o token já tiver expirado, a 1ª chamada autenticada cai no 401
// tratado por `SessaoExpiradaBridge` (sairModoSuporte + volta ao backoffice
// com aviso) — mesmo caminho de sempre.
//
// Era `sessionStorage` (escopo da aba, some ao fechar) — mas os logs do back
// mostraram sessões de suporte trocando pro SUPER_ADMIN sozinhas em pleno F5,
// bem antes dos 30min de expiração do token (ex.: 19min, 26min, 42min depois
// de "entrar como suporte"), sempre no mesmo padrão: refresh pelo cookie do
// SUPER_ADMIN tendo sucesso (`renovarSessao` só recusa esse cookie quando o
// token de impersonação ainda está em memória) seguido de `AuthGuard`
// mandando o SUPER_ADMIN de volta pro `/backoffice`. Ou seja, o `sessionStorage`
// não estava sendo lido de volta num F5 real — consistente com o Chrome
// descartando a aba em segundo plano (memory saver) e recarregando-a como uma
// navegação nova, o que na prática zera o `sessionStorage` apesar da aba
// continuar "a mesma" pro usuário.
//
// `localStorage` sobrevive a isso, mas é compartilhado entre abas — trocar
// direto pra `localStorage` faria duas abas de suporte em lojas diferentes
// pisarem uma na chave da outra (um F5 na aba mais antiga passaria a mostrar a
// loja da aba mais nova). Pra ter a durabilidade do `localStorage` sem esse
// vazamento entre abas, a chave é sufixada por um id de aba guardado em
// `window.name`: diferente do `sessionStorage`, `window.name` é uma
// propriedade do próprio *browsing context* (a aba), não da página, e
// sobrevive a navegações/reloads dessa aba — é a mesma técnica usada há muito
// tempo por bibliotecas como transporte entre reloads (window.name transport)
// justamente por ser mais resiliente que `sessionStorage` nesses casos.
// O token continua de curta duração (TTL do backend) e é limpo explicitamente
// ao sair do modo suporte, fazer logout ou expirar; `limparTokensExpirados`
// varre entradas de outras abas (ou desta, se `window.name` foi perdido) que
// já expiraram, pra não acumular lixo indefinidamente no `localStorage`.
const PREFIXO_CHAVE_TOKEN_SUPORTE = 'simplecote:token-suporte:'
const PREFIXO_ID_ABA = 'simplecote-aba:'

function idDaAba(): string {
  try {
    if (window.name.startsWith(PREFIXO_ID_ABA)) return window.name.slice(PREFIXO_ID_ABA.length)
    const id = crypto.randomUUID()
    window.name = `${PREFIXO_ID_ABA}${id}`
    return id
  } catch {
    // `window.name` inacessível (raríssimo) — sem id estável, cada leitura
    // "própria" desta função vira uma aba nova; só afeta a sobrevivência ao
    // reload, não a segurança (a chave nunca colide com a de outra aba real).
    return crypto.randomUUID()
  }
}

function chaveTokenSuporte(): string {
  return `${PREFIXO_CHAVE_TOKEN_SUPORTE}${idDaAba()}`
}

function limparTokensExpirados(): void {
  try {
    const agora = Date.now()
    for (const chave of Object.keys(localStorage)) {
      if (!chave.startsWith(PREFIXO_CHAVE_TOKEN_SUPORTE)) continue
      const claims = decodificarClaims(localStorage.getItem(chave))
      if (!claims?.exp || claims.exp * 1000 <= agora) {
        localStorage.removeItem(chave)
      }
    }
  } catch {
    // storage indisponível — nada a limpar
  }
}

function lerTokenSuporteSalvo(): string | null {
  try {
    return localStorage.getItem(chaveTokenSuporte())
  } catch {
    return null
  }
}

function salvarTokenSuporte(token: string | null): void {
  try {
    if (token) localStorage.setItem(chaveTokenSuporte(), token)
    else localStorage.removeItem(chaveTokenSuporte())
    limparTokensExpirados()
  } catch {
    // modo privado / storage indisponível — só não sobrevive a um reload
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado inicial derivado direto (não num efeito): se havia um token de
  // suporte salvo (reload em modo suporte), o primeiro render já nasce com
  // ele — sem passar por `renovarSessao`, que devolveria o SUPER_ADMIN.
  const [auth, setAuth] = useState<AuthState>(() => {
    const tokenSuporteSalvo = lerTokenSuporteSalvo()
    if (tokenSuporteSalvo) definirToken(tokenSuporteSalvo)
    return { token: tokenSuporteSalvo }
  })
  const [carregando, setCarregando] = useState(() => lerTokenSuporteSalvo() === null)

  // Boot sem token de suporte salvo: tenta restaurar a sessão normal via
  // `POST /api/auth/refresh` (o navegador reapresenta o cookie `httpOnly` do
  // refresh). Enquanto resolve, `carregando` é `true` para o `AuthGuard` não
  // mandar o usuário pro `/login` cedo demais (evita flash a cada reload).
  useEffect(() => {
    if (lerTokenSuporteSalvo()) return // já restaurado no estado inicial acima
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
    salvarTokenSuporte(null)
    definirToken(null)
    setAuth({ token: null })
  }, [])

  const entrarComoSuporte = useCallback(
    (tokenSuporte: string) => {
      // guarda o token de SUPER_ADMIN (para restaurar) e assume o de suporte.
      if (auth.token) tokenSuperAdminGuardado = auth.token
      definirToken(tokenSuporte)
      salvarTokenSuporte(tokenSuporte)
      setAuth({ token: tokenSuporte })
    },
    [auth.token],
  )

  const sairModoSuporte = useCallback(async () => {
    const anterior = tokenSuperAdminGuardado
    tokenSuperAdminGuardado = null
    salvarTokenSuporte(null)
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
