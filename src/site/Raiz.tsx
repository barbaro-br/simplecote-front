import { Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/useAuth'
import { useTenant } from '@/shared/tenant/useTenant'
import { ehHostBackoffice } from '@/shared/tenant/slug-do-hostname'
import { RouteLoadingFallback } from '@/shared/components/ui/route-loading'
import { HomePage } from './HomePage'
import { SiteChrome } from './SiteLayout'

/**
 * Porta da raiz `/`, tenant-aware (interage com `tenant-por-subdominio`):
 * - boot de auth em curso → loading (evita piscar home/login);
 * - com sessão → painel (`/admin`; o `AuthGuard` cuida de redirecionar pro
 *   subdomínio da loja quando estiver num host `.simplecote.app`);
 * - sem sessão num subdomínio de loja → `/login` (entra na loja, não mostra o site);
 * - sem sessão no host do backoffice (`backoffice.simplecote.app`) → `/login`
 *   (identidade SimpleCote, não a home de marketing);
 * - sem sessão em host neutro/marketing (`simplecote.com.br`, `app.simplecote.app`,
 *   `localhost`) → a home institucional.
 *
 * Os redirects/loading renderizam SEM a casca do site (não são filhos do
 * `SiteLayout`); só o caso marketing monta `<SiteChrome>`.
 */
export function Raiz() {
  const { isAutenticado, carregando } = useAuth()
  const { slug } = useTenant()

  if (carregando) {
    return <RouteLoadingFallback />
  }

  if (isAutenticado) {
    return <Navigate to="/admin" replace />
  }

  if (slug !== null) {
    return <Navigate to="/login" replace />
  }

  if (ehHostBackoffice(window.location.hostname)) {
    return <Navigate to="/login" replace />
  }

  return (
    <SiteChrome>
      <HomePage />
    </SiteChrome>
  )
}
