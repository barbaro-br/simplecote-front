import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Building2,
  FileText,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingBag,
} from 'lucide-react'
import { useAuth } from '@/shared/auth/AuthContext'

const SIDEBAR_KEY = 'simplecote:sidebar'

const ITENS = [
  { to: '/admin', label: 'Cotações', Icon: FileText, end: true },
  { to: '/admin/produtos', label: 'Produtos', Icon: Package, end: false },
  { to: '/admin/empresas', label: 'Empresas', Icon: Building2, end: false },
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
    <div className="flex min-h-screen bg-card text-foreground">
      <aside
        className={`${colapsada ? 'w-16' : 'w-64'} border-r bg-background p-4 flex flex-col transition-[width] duration-200`}
      >
        <div className={`flex items-center mb-8 ${colapsada ? 'justify-center' : 'justify-between'}`}>
          {!colapsada && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ShoppingBag className="size-4" aria-hidden />
              </div>
              <span className="truncate text-lg font-semibold tracking-tight">SimpleCote</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setColapsada((v) => !v)}
            aria-label={colapsada ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!colapsada}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {colapsada ? (
              <PanelLeftOpen className="size-4" aria-hidden />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden />
            )}
          </button>
        </div>

        <nav className="space-y-1 flex flex-col flex-1">
          {ITENS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${colapsada ? 'justify-center' : ''}`
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {!colapsada && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          id="sidebar-logout"
          onClick={handleLogout}
          title="Sair"
          aria-label="Sair"
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors mt-4 pt-4 border-t ${
            colapsada ? 'justify-center' : ''
          }`}
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          {!colapsada && <span>Sair</span>}
        </button>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
