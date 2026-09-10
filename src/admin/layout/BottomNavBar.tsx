import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  ChartBar,
  Buildings,
  FileText,
  SquaresFour,
  SignOut,
  DotsThree,
  Package,
  Gear,
  UserGear,
  Users,
} from '@phosphor-icons/react'

const ITENS_FIXOS = [
  { to: '/admin', label: 'Dashboard', Icon: SquaresFour, end: true },
  { to: '/admin/cotacoes', label: 'Cotações', Icon: FileText, end: false },
  { to: '/admin/produtos', label: 'Produtos', Icon: Package, end: false },
] as const

const ITENS_MAIS = [
  { to: '/admin/empresas', label: 'Empresas', Icon: Buildings, end: false },
  { to: '/admin/usuarios', label: 'Usuários', Icon: UserGear, end: false },
  { to: '/admin/membros', label: 'Membros', Icon: Users, end: false },
  { to: '/admin/analises', label: 'Análises', Icon: ChartBar, end: false },
  { to: '/admin/configuracoes', label: 'Configurações', Icon: Gear, end: false },
] as const

function lerTelaLarga(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(min-width: 768px)').matches
}

export function BottomNavBar({
  onLogout,
  mostrarMembros,
}: {
  onLogout: () => void
  mostrarMembros: boolean
}) {
  const [maisAberto, setMaisAberto] = useState(false)
  const [ehLarga, setEhLarga] = useState<boolean>(lerTelaLarga)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(min-width: 768px)')
    function aoMudar(e: MediaQueryListEvent) {
      setEhLarga(e.matches)
    }
    mql.addEventListener('change', aoMudar)
    return () => mql.removeEventListener('change', aoMudar)
  }, [])

  const itensMais = mostrarMembros ? ITENS_MAIS : ITENS_MAIS.filter((i) => i.to !== '/admin/membros')
  const todosItens = [...ITENS_FIXOS, ...itensMais]

  const itensVisiveis = ehLarga ? todosItens : ITENS_FIXOS

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t bg-card">
        {itensVisiveis.map(({ to, label, Icon, end }) => (
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
            <span className="whitespace-nowrap ui-uppercase">{label}</span>
          </NavLink>
        ))}

        {!ehLarga && (
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
            <DotsThree className="size-6 shrink-0" aria-hidden />
            <span className="whitespace-nowrap ui-uppercase">Mais</span>
          </button>
        )}
      </nav>

      {!ehLarga && maisAberto && (
        <>
          <div
            className="fixed inset-0 z-30"
            aria-hidden
            onClick={() => setMaisAberto(false)}
          />
          <div className="fixed inset-x-0 bottom-20 z-40 px-4">
            <div role="menu" className="mx-auto w-full max-w-sm rounded-xl border bg-popover text-popover-foreground shadow-lg p-2">
              {itensMais.map(({ to, label, Icon, end }) => (
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
                <SignOut className="size-5 shrink-0" aria-hidden />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
