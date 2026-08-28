import type { ProblemDetail } from '../domain/tipos-base'

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

const SESSION_KEY = 'simplecote_token'
const LOGIN_PATH = '/api/auth/login'

let sessaoExpiradaHandler: (() => void) | null = null

/**
 * Registra o handler chamado quando uma chamada autenticada recebe `401`.
 * Injetado por `App.tsx` (dentro do `AuthProvider` + router) para o `api-client`
 * não depender do React Router nem do `AuthContext`. Sem handler registrado,
 * o `fetchWrapper` cai no fallback `window.location.assign('/login')`.
 */
export function configurarSessaoExpirada(handler: () => void): void {
  sessaoExpiradaHandler = handler
}

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || ''

const getToken = (): string | null => {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

const limparToken = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // sessionStorage indisponível — nada a limpar
  }
}

type RequestOptions = RequestInit & { lookup?: boolean }

function isLoginRequest(endpoint: string, method?: string): boolean {
  const path = endpoint.split('?')[0]
  return (method ?? 'GET').toUpperCase() === 'POST' && path.endsWith(LOGIN_PATH)
}

async function fetchWrapper<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { lookup, ...init } = options
  const url = `${getBaseUrl()}${endpoint}`
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string>),
  }

  const response = await fetch(url, { ...init, headers })

  if (!response.ok) {
    // 401 em chamada autenticada → sessão expirada. O 401 de `POST /api/auth/login`
    // (credencial inválida) segue virando ApiError normal.
    if (response.status === 401 && !isLoginRequest(endpoint, init.method)) {
      limparToken()
      if (sessaoExpiradaHandler) {
        sessaoExpiradaHandler()
      } else {
        window.location.assign('/login')
      }
      throw new SessaoExpiradaError()
    }

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

  return response.json()
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
  delete: <T>(endpoint: string, options?: RequestInit) => fetchWrapper<T>(endpoint, { ...options, method: 'DELETE' }),
}

/**
 * Baixa um arquivo binário autenticado (XLSX, PDF) e dispara o download no navegador.
 * Não é `useQuery` — é uma ação imperativa por clique. Mantém a mesma política de
 * `401` do `fetchWrapper` (sessão expirada → handler / redirect).
 */
export async function baixarArquivo(endpoint: string, nomeArquivo: string): Promise<void> {
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
    throw new ApiError({
      type: 'about:blank',
      title: 'Erro no download',
      status: response.status,
      detail: 'Não foi possível baixar o arquivo.',
    })
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
}
