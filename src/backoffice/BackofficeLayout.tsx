import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingBag } from '@phosphor-icons/react'
import { useAuth } from '@/shared/auth/useAuth'

/**
 * Casca do backoffice — identidade SimpleCote (§I), sem tema/cor de loja.
 * Separada do `AdminLayout` do painel do cliente. Navegação entre "Resumo"
 * (dashboard) e "Lojas" (listagem).
 */
export function BackofficeLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const classeNav = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <div data-painel="dark" className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/backoffice" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ShoppingBag className="size-5" aria-hidden />
              </div>
              <span className="font-bold tracking-tight">SimpleCote</span>
              <span className="text-sm text-muted-foreground">· Backoffice</span>
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink to="/backoffice" end className={classeNav}>
                Resumo
              </NavLink>
              <NavLink to="/backoffice/lojas" className={classeNav}>
                Lojas
              </NavLink>
              <NavLink to="/backoffice/avisos" className={classeNav}>
                Avisos
              </NavLink>
            </nav>
          </div>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
