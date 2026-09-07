import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useTenant } from '@/shared/tenant/useTenant'
import { decodificarClaims } from './jwt'
import { decidirRedirectTenant } from '@/shared/tenant/slug-do-hostname'
import { RouteLoadingFallback } from '@/shared/components/ui/route-loading'

/**
 * Protege rotas que exigem autenticação e mantém o JWT como autoridade sobre o
 * inquilino: além da sessão, o slug do hostname deve corresponder ao `slug` do
 * JWT. Divergência num host do app (`.simplecote.app`) redireciona pro subdomínio
 * correto (full-page, muda a origem) — nunca renderiza outro painel. Em
 * dev/preview (`localhost`/`*.vercel.app`) não há subdomínio a conferir; o back
 * continua escopando por `compradorId`.
 */
export function AuthGuard() {
  const { isAutenticado, carregando, token } = useAuth()
  const { slug: hostnameSlug, ehHostDoApp } = useTenant()

  if (carregando) {
    return <RouteLoadingFallback />
  }

  if (!isAutenticado) {
    return <Navigate to="/login" replace />
  }

  const jwtSlug = decodificarClaims(token)?.slug ?? null
  const decisao = decidirRedirectTenant(hostnameSlug, jwtSlug, ehHostDoApp)

  if (decisao.tipo === 'redirecionar') {
    window.location.assign(`${decisao.destino}${window.location.pathname}${window.location.search}`)
    return <RouteLoadingFallback />
  }

  return <Outlet />
}
