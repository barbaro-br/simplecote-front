import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Package,
  Settings,
  UserCog,
} from 'lucide-react'

const ITENS_FIXOS = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/cotacoes', label: 'Cotações', Icon: FileText, end: false },
  { to: '/admin/produtos', label: 'Produtos', Icon: Package, end: false },
] as const

const ITENS_MAIS = [
  { to: '/admin/empresas', label: 'Empresas', Icon: Building2, end: false },
  { to: '/admin/usuarios', label: 'Usuários', Icon: UserCog, end: false },
  { to: '/admin/analises', label: 'Análises', Icon: BarChart3, end: false },
  { to: '/admin/configuracoes', label: 'Configurações', Icon: Settings, end: false },
] as const

export function BottomNavBar({ onLogout }: { onLogout: () => void }) {
  const [maisAberto, setMaisAberto] = useState(false)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t bg-background">
        {ITENS_FIXOS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon className="size-6 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">{label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setMaisAberto((v) => !v)}
          aria-label="Mais"
          aria-haspopup="menu"
          aria-expanded={maisAberto}
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
            maisAberto ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MoreHorizontal className="size-6 shrink-0" aria-hidden />
          <span className="whitespace-nowrap">Mais</span>
        </button>
      </nav>

      {maisAberto && (
        <>
          <div
            className="fixed inset-0 z-30"
            aria-hidden
            onClick={() => setMaisAberto(false)}
          />
          <div className="fixed inset-x-0 bottom-20 z-40 px-4">
            <div role="menu" className="mx-auto w-full max-w-sm rounded-xl border bg-popover text-popover-foreground shadow-lg p-2">
              {ITENS_MAIS.map(({ to, label, Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  role="menuitem"
                  onClick={() => setMaisAberto(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  {label}
                </NavLink>
              ))}
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="size-5 shrink-0" aria-hidden />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
