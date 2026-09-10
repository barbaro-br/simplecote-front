import { APP_SUFIXO, dominioDaLoja, slugReservado } from '@/shared/domain/slug'

// Resolução do slug da loja pelo hostname (change tenant-por-subdominio,
// RISCOS-TRANSVERSAIS §0). O slug do hostname é só exibição/roteamento — a
// autoridade sobre o inquilino é o JWT (`compradorId`), nunca o hostname.

function normalizar(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/:\d+$/, '')
}

/** O hostname é do app (`.simplecote.app`): `<slug>.`, `app.`, `www.`, apex, `backoffice.`… */
export function ehHostDoApp(hostname: string): boolean {
  const h = normalizar(hostname)
  return h === APP_SUFIXO || h.endsWith(`.${APP_SUFIXO}`)
}

// Subdomínio antes do `.simplecote.app` ('' para apex, null para host não-app).
function subdominioDoApp(hostname: string): string | null {
  const h = normalizar(hostname)
  if (!ehHostDoApp(h)) return null
  const sufixo = `.${APP_SUFIXO}`
  return h === APP_SUFIXO ? '' : h.slice(0, h.length - sufixo.length)
}

/** O host é o do backoffice (`backoffice.simplecote.app`) — host reservado, sem loja. */
export function ehHostBackoffice(hostname: string): boolean {
  return subdominioDoApp(hostname) === 'backoffice'
}

/**
 * `novo.simplecote.app` — host de transição do redesign (mudança
 * `redesign-painel-dark`). É `.simplecote.app`, mas serve o painel para
 * qualquer inquilino escopado pelo JWT, como um preview da Vercel: o guard
 * slug × JWT NÃO pode redirecionar pro subdomínio da loja, senão joga quem
 * clicou em "Experimentar o novo layout" de volta pro layout antigo.
 */
export function ehHostTransicaoLayout(hostname: string): boolean {
  return subdominioDoApp(hostname) === 'novo'
}

/**
 * Extrai o slug de `<slug>.simplecote.app`. Retorna `null` para host neutro
 * (`app`/`www`/`backoffice`/apex), subdomínio multi-nível, `localhost`, preview
 * da Vercel (`*.vercel.app`) e qualquer outro host sem loja.
 */
export function extrairSlugDoHostname(hostname: string): string | null {
  const sub = subdominioDoApp(hostname)
  if (sub === null || sub === '') return null
  const labels = sub.split('.')
  if (labels.length !== 1) return null
  const label = labels[0]
  if (slugReservado(label)) return null
  return label
}

/**
 * Resolução em runtime: slug do hostname atual + override (`?tenant=` /
 * `VITE_TENANT_SLUG`) **fora de produção** — dev/preview não têm DNS wildcard
 * local. Em produção, o override não existe.
 */
export function resolverSlugDoHostname(): string | null {
  const slug = extrairSlugDoHostname(window.location.hostname)
  if (slug) return slug
  if (!import.meta.env.PROD) {
    const query = new URLSearchParams(window.location.search).get('tenant')
    if (query) return query
    const env = import.meta.env.VITE_TENANT_SLUG
    if (env) return env
  }
  return null
}

export type DecisaoRedirect =
  | { tipo: 'ok' }
  | { tipo: 'redirecionar'; destino: string }

/**
 * Decide o que o `AuthGuard` faz com a relação hostname-slug × JWT-slug:
 * - iguais → ok (painel normal);
 * - divergentes e o host é do app (`.simplecote.app`), com slug no JWT →
 *   redireciona pro subdomínio do JWT (full-page, muda a origem);
 * - divergentes e o JWT não tem slug → ok (o back escopa toda query por
 *   `compradorId` do JWT, independentemente do hostname; um token sem slug só
 *   existe se for anterior ao deploy do cadastro e se auto-corrige no próximo
 *   refresh, quando o guard volta a redirecionar);
 * - divergentes em dev/preview (`localhost`/`*.vercel.app`) → ok (não há
 *   subdomínio para se enganar; o back continua escopando pelo JWT).
 */
export function decidirRedirectTenant(
  hostnameSlug: string | null,
  jwtSlug: string | null,
  hostDoApp: boolean,
): DecisaoRedirect {
  if (hostnameSlug === jwtSlug) return { tipo: 'ok' }
  if (!hostDoApp) return { tipo: 'ok' }
  if (jwtSlug) return { tipo: 'redirecionar', destino: `https://${dominioDaLoja(jwtSlug)}` }
  return { tipo: 'ok' }
}
