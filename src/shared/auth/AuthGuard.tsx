import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { useTenant } from '@/shared/tenant/useTenant'
import { decodificarClaims } from './jwt'
import { decidirRedirectTenant, ehHostTransicaoLayout } from '@/shared/tenant/slug-do-hostname'
import { RouteLoadingFallback } from '@/shared/components/ui/route-loading'

/**
 * Protege rotas que exigem autenticação e mantém o JWT como autoridade sobre o
 * inquilino: além da sessão, o slug do hostname deve corresponder ao `slug` do
 * JWT. Divergência num host do app (`.simplecote.app`) redireciona pro subdomínio
 * correto (full-page, muda a origem) — nunca renderiza outro painel. Em
 * dev/preview (`localhost`/`*.vercel.app`) e no host de transição do redesign
 * (`novo.simplecote.app`, que serve qualquer inquilino) não há subdomínio a
 * conferir; o back continua escopando por `compradorId`.
 */
export function AuthGuard() {
  const { isAutenticado, carregando, token } = useAuth()
  const { slug: hostnameSlug, ehHostDoApp } = useTenant()
  const claims = decodificarClaims(token)

  // SUPER_ADMIN não tem Comprador — o painel do lojista dá 403 em tudo. Manda pro
  // backoffice. (Em modo suporte o token tem papel=ADMIN, então não cai aqui.)
  // Isso também é o que acontece se um token de suporte salvo (localStorage,
  // AuthContext.tsx) não for encontrado nesta aba num reload — o boot cai no
  // SUPER_ADMIN via cookie e para aqui. Não dá pra distinguir com certeza dos
  // dois casos (SUPER_ADMIN navegando direto pro /admin por engano é raro, mas
  // possível), então o aviso é neutro: explica por que o backoffice apareceu em
  // vez de deixar a troca de painel silenciosa.
  const ehSuperAdminNoAdmin = isAutenticado && !carregando && claims?.papel === 'SUPER_ADMIN'

  useEffect(() => {
    if (ehSuperAdminNoAdmin) {
      toast.warning('Sessão de suporte não encontrada nesta aba — entre novamente pelo backoffice.')
    }
  }, [ehSuperAdminNoAdmin])

  if (carregando) {
    return <RouteLoadingFallback />
  }

  if (!isAutenticado) {
    return <Navigate to="/login" replace />
  }

  if (ehSuperAdminNoAdmin) {
    return <Navigate to="/backoffice" replace />
  }

  const jwtSlug = claims?.slug ?? null
  // `novo.simplecote.app` serve o painel para qualquer inquilino (escopo pelo
  // JWT); tratá-lo como host de loja mandaria o usuário de volta pro subdomínio
  // no layout antigo.
  const hostRedireciona = ehHostDoApp && !ehHostTransicaoLayout(window.location.hostname)
  const decisao = decidirRedirectTenant(hostnameSlug, jwtSlug, hostRedireciona)

  if (decisao.tipo === 'redirecionar') {
    window.location.assign(`${decisao.destino}${window.location.pathname}${window.location.search}`)
    return <RouteLoadingFallback />
  }

  return <Outlet />
}
