import { Navigate, Outlet } from 'react-router-dom'
import type { AreaSensivel } from '@/shared/domain/papel'
import { useAuth } from './useAuth'

/**
 * Segunda camada de UX (nunca a única barreira — o back enforça o papel): barra
 * rotas de área sensível para quem não pode vê-las. Renderizado DENTRO do
 * `AuthGuard`, então o `carregando` do boot já resolveu aqui.
 */
export function RoleGuard({ area }: { area: AreaSensivel }) {
  const { podeVer } = useAuth()

  if (!podeVer(area)) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
