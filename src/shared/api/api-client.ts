import type { ProblemDetail } from '../domain/tipos-base'
import { decodificarClaims } from '../auth/jwt'

export class ApiError extends Error {
  public problem: ProblemDetail

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title || 'Erro na requisição')
    this.name = 'ApiError'
    this.problem = problem
  }
}

/**
 * Erro sentinela lançado quando o servidor responde `401` numa chamada autenticada.
 * A navegação para `/login` já foi disparada — a UI NÃO deve renderizar esta mensagem
 * (é transitório). Filtre por `instanceof SessaoExpiradaError` onde exibir `error.message`.
 */
export class SessaoExpiradaError extends Error {
  constructor() {
    super('Sessão expirada')
    this.name = 'SessaoExpiradaError'
  }
}

const LOGIN_PATH = '/api/auth/login'
const REFRESH_PATH = '/api/auth/refresh'

let sessaoExpiradaHandler: (() => void) | null = null

// Access token em memória (não em `sessionStorage`). Setter injetável pelo
// `AuthContext`; o refresh também grava aqui o token novo.
let accessToken: string | null = null

// Single-flight do refresh: um único `Promise` compartilhado enquanto houver um
// refresh em voo, para que chamadas concorrentes não disparem N refreshes.
let refreshEmVoo: Promise<string | null> | null = null

/**
 * Registra o handler chamado quando uma chamada autenticada recebe `401`.
 * Injetado por `App.tsx` (dentro do `AuthProvider` + router) para o `api-client`
 * não depender do React Router nem do `AuthContext`. Sem handler registrado,
 * o `fetchWrapper` cai no fallback `window.location.assign('/login')`.
 */
export function configurarSessaoExpirada(handler: () => void): void {
  sessaoExpiradaHandler = handler
}

/**
 * Setter injetável do access token em memória. O `AuthContext` chama no `login`
 * e no `logout`; o `renovarSessao` também grava o token novo por aqui.
 */
export function definirToken(token: string | null): void {
  accessToken = token
}

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || ''

const getToken = (): string | null => accessToken

const limparToken = (): void => {
  accessToken = null
}

type TokenResponse = { token: string }

/**
 * Renova a sessão via `POST /api/auth/refresh` (reapresenta o cookie `httpOnly`
 * do refresh token). Em caso de sucesso grava o novo access token em memória e
 * devolve o token; em qualquer falha devolve `null` (sem lançar — quem chama
 * decide entre repetir a requisição ou sinalizar sessão expirada).
 */
export async function renovarSessao(): Promise<string | null> {
  // Token de suporte (impersonação) não é renovável: o refresh pelo cookie
  // devolveria o token do SUPER_ADMIN (só ROLE_SUPER_ADMIN → tudo 403 no /admin).
  // Recusa aqui e deixa o chamador tratar como sessão de suporte expirada.
  if (decodificarClaims(accessToken)?.impersonatedBy) {
    return null
  }
  if (!refreshEmVoo) {
    refreshEmVoo = (async () => {
      try {
        const response = await fetch(`${getBaseUrl()}${REFRESH_PATH}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!response.ok) return null
        const { token } = (await response.json()) as TokenResponse
        accessToken = token
        return token
      } catch {
        return null
      } finally {
        refreshEmVoo = null
      }
    })()
  }
  return refreshEmVoo
}

type RequestOptions = RequestInit & { lookup?: boolean }

function isLoginRequest(endpoint: string, method?: string): boolean {
  const path = endpoint.split('?')[0]
  return (method ?? 'GET').toUpperCase() === 'POST' && path.endsWith(LOGIN_PATH)
}

// Rotas /public/** (colaborador, representante por token) são anônimas por
// design — nunca devem carregar o JWT do admin nem redirecionar pra /login num 401.
function isPublicRequest(endpoint: string): boolean {
  return endpoint.split('?')[0].startsWith('/public/')
}

function montarHeaders(token: string | null, headersIniciais: HeadersInit | undefined): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headersIniciais as Record<string, string>),
  }
}

function sessaoExpirada(): never {
  limparToken()
  if (sessaoExpiradaHandler) {
    sessaoExpiradaHandler()
  } else {
    window.location.assign('/login')
  }
  throw new SessaoExpiradaError()
}

async function fetchWrapper<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { lookup, ...init } = options
  return processarRequisicao<T>(endpoint, init, lookup, false)
}

async function processarRequisicao<T>(
  endpoint: string,
  init: RequestInit,
  lookup: boolean | undefined,
  jaTentouRefresh: boolean,
): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`
  const publico = isPublicRequest(endpoint)
  const token = publico ? null : getToken()
  const headers = montarHeaders(token, init.headers)

  const response = await fetch(url, { ...init, headers })

  // 401 em chamada autenticada → tenta renovar a sessão e repete a requisição
  // UMA única vez. O 401 de `POST /api/auth/login` (credencial inválida) e de
  // rotas /public/** segue virando ApiError normal. O `token` garante que só é
  // "sessão expirada" quando a chamada de fato mandou credencial: um 401 numa
  // chamada anônima (ex: página pública que encostou num endpoint /api/**, como
  // o /api/configuracoes do provider global) é só "precisa logar pra este recurso".
  if (response.status === 401 && !isLoginRequest(endpoint, init.method) && !publico && token) {
    if (jaTentouRefresh) {
      return sessaoExpirada()
    }
    const novoToken = await renovarSessao()
    if (!novoToken) {
      return sessaoExpirada()
    }
    return processarRequisicao<T>(endpoint, init, lookup, true)
  }

  if (!response.ok) {
    // 404 sem ProblemDetail só é "recurso ausente" (null) quando a chamada é um lookup.
    if (
      lookup &&
      response.status === 404 &&
      !response.headers.get('content-type')?.includes('application/problem+json')
    ) {
      return null as T
    }

    try {
      const problem = (await response.json()) as ProblemDetail
      throw new ApiError(problem)
    } catch (e) {
      if (e instanceof ApiError) throw e
      throw new ApiError({
        type: 'about:blank',
        title: 'Erro Inesperado',
        status: response.status,
        detail: 'Ocorreu um erro ao processar a resposta do servidor.',
      })
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  // Sucesso com corpo vazio (ex.: `201` do `POST /public/cadastro`) devolve
  // `undefined`; com corpo, parseia o JSON.
  const texto = await response.text()
  return texto ? (JSON.parse(texto) as T) : (undefined as T)
}

function apiGet<T>(endpoint: string, options: RequestInit & { lookup: true }): Promise<T | null>
function apiGet<T>(endpoint: string, options?: RequestInit & { lookup?: false }): Promise<T>
function apiGet<T>(endpoint: string, options?: RequestOptions): Promise<T | null> {
  return fetchWrapper<T>(endpoint, { ...options, method: 'GET' })
}

export const api = {
  get: apiGet,
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    fetchWrapper<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    fetchWrapper<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    fetchWrapper<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string, options?: RequestInit) => fetchWrapper<T>(endpoint, { ...options, method: 'DELETE' }),
}

/**
 * Baixa um arquivo binário autenticado (XLSX, PDF) e dispara o download no navegador.
 * Não é `useQuery` — é uma ação imperativa por clique. Mantém a mesma política de
 * `401` do `fetchWrapper` (sessão expirada → handler / redirect).
 */
export type ResultadoBaixarArquivo = 'baixado' | 'assincrono'

export async function baixarArquivo(endpoint: string, nomeArquivo: string): Promise<ResultadoBaixarArquivo> {
  const token = getToken()
  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    if (response.status === 401) {
      limparToken()
      if (sessaoExpiradaHandler) {
        sessaoExpiradaHandler()
      } else {
        window.location.assign('/login')
      }
      throw new SessaoExpiradaError()
    }
    // tenta ler o ProblemDetail para exibir a mensagem pt-BR do back; sem corpo,
    // cai na mensagem genérica.
    try {
      const problem = (await response.json()) as ProblemDetail
      throw new ApiError(problem)
    } catch (e) {
      if (e instanceof ApiError) throw e
      throw new ApiError({
        type: 'about:blank',
        title: 'Erro no download',
        status: response.status,
        detail: 'Não foi possível baixar o arquivo.',
      })
    }
  }

  // 202 = o servidor aceitou mas vai gerar assíncrono (ex.: exportação grande,
  // enviada por e-mail quando pronta) — não há arquivo para baixar agora.
  if (response.status === 202) {
    return 'assincrono'
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  return 'baixado'
}
