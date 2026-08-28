import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * Protege rotas que exigem autenticação.
 * Se não há token → redireciona para /login.
 */
export function AuthGuard() {
  const { isAutenticado } = useAuth()

  if (!isAutenticado) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
