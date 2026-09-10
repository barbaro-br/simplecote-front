// Slug do Comprador (change `cadastro-publico-self-service`, design.md). Espelha
// `SlugComprador` e `SlugReservado` do back (`simplecote-back`) — a fonte da
// verdade é o back (RISCOS-TRANSVERSAIS §G); aqui é só pré-check de UX.
// Compartilhado com `tenant-por-subdominio` (parsing de hostname + reserva).

export const SLUG_FORMATO_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
export const SLUG_MIN = 3
export const SLUG_MAX = 40

// Hosts sem loja (app, www, backoffice — §0), rotas de auth/marketing e infra.
// Espelha `SlugReservado.RESERVADOS` do back.
export const SLUGS_RESERVADOS: ReadonlySet<string> = new Set([
  'app', 'www', 'api', 'admin', 'login', 'mail', 'backoffice',
  'static', 'assets', 'cdn', 'status',
  'auth', 'cadastro', 'registro', 'signup', 'register',
  'help', 'suporte', 'support', 'dashboard', 'painel',
  'webhook', 'webhooks', 'billing', 'pagamento', 'account', 'conta',
  'system', 'sistema', 'root', 'admin-api', 'docs', 'api-docs',
  // `novo` hospeda o layout novo durante a transição do redesign
  // (`novo.simplecote.app`) — não é loja. TODO: espelhar no back.
  'novo',
])

export function slugReservado(slug: string): boolean {
  return SLUGS_RESERVADOS.has(slug)
}

/** Formato válido (`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, 3–40) — sem checar reservado. */
export function slugFormatoValido(slug: string): boolean {
  return (
    slug.length >= SLUG_MIN &&
    slug.length <= SLUG_MAX &&
    SLUG_FORMATO_REGEX.test(slug)
  )
}

/**
 * Slugify canônico: minúsculas, sem acento (NFD), não-alfanumérico → hífen,
 * colapsa hífens, trunca em 40. Nomes curtos/simbólicos podem produzir vazio —
 * quem consome valida o resultado.
 */
// App autenticado em `<slug>.simplecote.app` (RISCOS-TRANSVERSAIS §0).
export const APP_SUFIXO = 'simplecote.app'

export function dominioDaLoja(slug: string): string {
  return `${slug}.${APP_SUFIXO}`
}

export function urlLoginDaLoja(slug: string): string {
  return `https://${dominioDaLoja(slug)}/login`
}

export function nomeParaSlug(nome: string): string {
  let slug = nome
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (slug.length > SLUG_MAX) {
    slug = slug.slice(0, SLUG_MAX).replace(/-$/g, '')
  }
  return slug
}
