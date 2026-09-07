import { Outlet } from 'react-router-dom'
import { useAuth } from '@/shared/auth/useAuth'
import { RouteLoadingFallback } from '@/shared/components/ui/route-loading'

function NaoEncontrado() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight ui-uppercase">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">O endereço acessado não existe.</p>
      </div>
    </div>
  )
}

/**
 * Guarda do backoffice: exige sessão e papel `SUPER_ADMIN`. Qualquer outro caso
 * (sem sessão ou papel de `Comprador`) recebe "não encontrado" — sem revelar a
 * existência da área, sem redirecionar para um login de backoffice.
 */
export function BackofficeGuard() {
  const { isAutenticado, carregando, papel } = useAuth()

  if (carregando) {
    return <RouteLoadingFallback />
  }

  if (!isAutenticado || papel !== 'SUPER_ADMIN') {
    return <NaoEncontrado />
  }

  return <Outlet />
}
