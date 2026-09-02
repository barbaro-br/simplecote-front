import { useEffect, useState } from 'react'
import { NavLink, ScrollRestoration, useNavigate } from 'react-router-dom'
import { RouteTransition } from '@/shared/components/ui/route-transition'
import {
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingBag,
  UserCog,
} from 'lucide-react'
import { useAuth } from '@/shared/auth/AuthContext'

const SIDEBAR_KEY = 'simplecote:sidebar'

const ITENS = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/cotacoes', label: 'Cotações', Icon: FileText, end: false },
  { to: '/admin/produtos', label: 'Produtos', Icon: Package, end: false },
  { to: '/admin/empresas', label: 'Empresas', Icon: Building2, end: false },
  { to: '/admin/usuarios', label: 'Usuários', Icon: UserCog, end: false },
  { to: '/admin/analises', label: 'Análises', Icon: BarChart3, end: false },
] as const

function lerColapsada(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

export function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [colapsada, setColapsada] = useState<boolean>(lerColapsada)
  const [isHovered, setIsHovered] = useState(false)

  const isExpanded = !colapsada || isHovered

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, colapsada ? '1' : '0')
    } catch {
      // localStorage indisponível — o estado fica só em memória nesta sessão
    }
  }, [colapsada])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-card text-foreground">
      <ScrollRestoration />
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${
          isExpanded ? 'w-64' : 'w-20'
        } sticky top-0 h-screen border-r bg-background p-4 flex flex-col transition-all duration-300 ease-in-out relative z-20`}
      >
        <div className={`flex items-center mb-8 h-10 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          <div
            className={`flex items-center gap-2.5 overflow-hidden transition-all duration-300 ${
              isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShoppingBag className="size-6" aria-hidden />
            </div>
            <span className="truncate text-xl font-bold tracking-tight">SimpleCote</span>
          </div>

          <button
            type="button"
            onClick={() => setColapsada((v) => !v)}
            aria-label={colapsada ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!colapsada}
            className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
              !isExpanded && 'absolute'
            }`}
          >
            {colapsada ? (
              <PanelLeftOpen className="size-5" aria-hidden />
            ) : (
              <PanelLeftClose className="size-5" aria-hidden />
            )}
          </button>
        </div>

        <nav className="space-y-2 flex flex-col flex-1 mt-4">
          {ITENS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={!isExpanded ? label : undefined}
              aria-label={label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-3 text-base transition-colors overflow-hidden ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${!isExpanded ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="size-6 shrink-0" aria-hidden />
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'
                }`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <button
          id="sidebar-logout"
          onClick={handleLogout}
          title={!isExpanded ? 'Sair' : undefined}
          aria-label="Sair"
          className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:text-destructive transition-colors mt-4 pt-4 border-t overflow-hidden ${
            !isExpanded ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="size-6 shrink-0" aria-hidden />
          <span
            className={`whitespace-nowrap transition-all duration-300 ${
              isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'
            }`}
          >
            Sair
          </span>
        </button>
      </aside>
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-8">
          <RouteTransition />
        </div>
      </main>
    </div>
  )
}
