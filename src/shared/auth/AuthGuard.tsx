import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { RouteLoadingFallback } from '@/shared/components/ui/route-loading'

/**
 * Protege rotas que exigem autenticação.
 * Enquanto o boot do `AuthContext` resolve (refresh da sessão), renderiza o
 * `RouteLoadingFallback`; só decide redirecionar para /login depois.
 */
export function AuthGuard() {
  const { isAutenticado, carregando } = useAuth()

  if (carregando) {
    return <RouteLoadingFallback />
  }

  if (!isAutenticado) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
