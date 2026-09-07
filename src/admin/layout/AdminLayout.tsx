import { useEffect, useState } from 'react'
import { NavLink, ScrollRestoration, useNavigate } from 'react-router-dom'
import { RouteTransition } from '@/shared/components/ui/route-transition'
import {
  ChartBar,
  Buildings,
  FileText,
  SquaresFour,
  SignOut,
  Package,
  Sidebar as SidebarIcon,
  SidebarSimple,
  Gear,
  ShoppingBag,
  UserGear,
  Users,
} from '@phosphor-icons/react'
import { useAuth } from '@/shared/auth/useAuth'
import { useConfiguracaoLoja } from '../configuracoes/configuracoes.api'
import { CREDITO_DESENVOLVEDOR } from '@/shared/creditos-desenvolvedor'
import { BottomNavBar } from './BottomNavBar'
import { BotaoAjudaFlutuante } from '../ajuda/BotaoAjudaFlutuante'

const SIDEBAR_KEY = 'simplecote:sidebar'

const ITENS = [
  { to: '/admin', label: 'Dashboard', Icon: SquaresFour, end: true },
  { to: '/admin/cotacoes', label: 'Cotações', Icon: FileText, end: false },
  { to: '/admin/produtos', label: 'Produtos', Icon: Package, end: false },
  { to: '/admin/empresas', label: 'Empresas', Icon: Buildings, end: false },
  { to: '/admin/usuarios', label: 'Usuários', Icon: UserGear, end: false },
  { to: '/admin/membros', label: 'Membros', Icon: Users, end: false },
  { to: '/admin/analises', label: 'Análises', Icon: ChartBar, end: false },
  { to: '/admin/configuracoes', label: 'Configurações', Icon: Gear, end: false },
] as const

type ItemNav = (typeof ITENS)[number]

function lerColapsada(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

function lerTelaEstreita(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(max-width: 767px)').matches
}

function Sidebar({ nome, onLogout, itens }: { nome: string; onLogout: () => void; itens: readonly ItemNav[] }) {
  const [colapsada, setColapsada] = useState<boolean>(lerColapsada)
  const [isHovered, setIsHovered] = useState(false)
  const [ehEstreita, setEhEstreita] = useState<boolean>(lerTelaEstreita)

  const isExpanded = !ehEstreita && (!colapsada || isHovered)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, colapsada ? '1' : '0')
    } catch {
      // localStorage indisponível — o estado fica só em memória nesta sessão
    }
  }, [colapsada])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(max-width: 767px)')
    function aoMudar(e: MediaQueryListEvent) {
      setEhEstreita(e.matches)
    }
    mql.addEventListener('change', aoMudar)
    return () => mql.removeEventListener('change', aoMudar)
  }, [])

  return (
    <aside
      onMouseEnter={() => {
        if (!ehEstreita) setIsHovered(true)
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={`${
        isExpanded ? 'w-64' : 'w-20'
      } sticky top-0 h-screen border-r bg-background p-4 flex flex-col transition-all duration-300 ease-in-out relative z-20`}
    >
      <div className={`flex items-center mb-8 h-10 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        <div
          className={`flex items-center gap-2.5 overflow-hidden transition-all duration-300 ${
            isExpanded ? 'flex-1 min-w-0 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShoppingBag className="size-6" aria-hidden />
          </div>
          <span title={nome} className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight">{nome}</span>
        </div>

        {!ehEstreita && (
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
              <SidebarSimple className="size-5" aria-hidden />
            ) : (
              <SidebarIcon className="size-5" aria-hidden />
            )}
          </button>
        )}
      </div>

      <nav className="space-y-2 flex flex-col flex-1 mt-4">
        {itens.map(({ to, label, Icon, end }) => (
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
              className={`ui-uppercase whitespace-nowrap transition-all duration-300 ${
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
        onClick={onLogout}
        title={!isExpanded ? 'Sair' : undefined}
        aria-label="Sair"
        className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:text-destructive transition-colors mt-4 pt-4 border-t overflow-hidden ${
          !isExpanded ? 'justify-center px-0' : ''
        }`}
      >
        <SignOut className="size-6 shrink-0" aria-hidden />
        <span
          className={`ui-uppercase whitespace-nowrap transition-all duration-300 ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'
          }`}
        >
          Sair
        </span>
      </button>

      <div
        className={`overflow-hidden whitespace-nowrap transition-all duration-300 text-[11px] text-muted-foreground/60 ${
          isExpanded ? 'opacity-100 translate-x-0 mt-2' : 'opacity-0 -translate-x-4 w-0 mt-0'
        }`}
      >
        {CREDITO_DESENVOLVEDOR.href ? (
          <a href={CREDITO_DESENVOLVEDOR.href} target="_blank" rel="noopener noreferrer">
            {CREDITO_DESENVOLVEDOR.texto}
          </a>
        ) : (
          CREDITO_DESENVOLVEDOR.texto
        )}
      </div>
    </aside>
  )
}

import { List, X } from '@phosphor-icons/react'

// ... (keep the same imports and initial setup) ...

function SidebarMobile({ nome, onLogout, aberta, aoFechar, itens }: { nome: string; onLogout: () => void; aberta: boolean; aoFechar: () => void; itens: readonly ItemNav[] }) {
  return (
    <>
      {aberta && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={aoFechar}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm border-r bg-background p-4 flex flex-col shadow-lg transition-transform duration-300 ease-in-out md:hidden ${
          aberta ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8 h-10">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShoppingBag className="size-6" aria-hidden />
            </div>
            <span title={nome} className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight">{nome}</span>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Fechar menu"
          >
            <X className="size-6" />
          </button>
        </div>

        <nav className="space-y-2 flex flex-col flex-1">
          {itens.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={aoFechar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-3 text-base transition-colors overflow-hidden ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon className="size-6 shrink-0" aria-hidden />
              <span className="ui-uppercase">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => {
            aoFechar()
            onLogout()
          }}
          className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:text-destructive transition-colors mt-4 pt-4 border-t"
        >
          <SignOut className="size-6 shrink-0" aria-hidden />
          <span className="ui-uppercase">Sair</span>
        </button>
      </aside>
    </>
  )
}

export function AdminLayout() {
  const { logout, podeVer } = useAuth()
  const { data: configuracao } = useConfiguracaoLoja()
  const navigate = useNavigate()

  const [ehEstreita, setEhEstreita] = useState<boolean>(lerTelaEstreita)
  const [drawerAberto, setDrawerAberto] = useState(false)

  // Membros é área sensível: OPERADOR não vê o item no menu (o back barra a rota).
  const mostrarMembros = podeVer('membros')
  const itens = mostrarMembros ? ITENS : ITENS.filter((i) => i.to !== '/admin/membros')

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(max-width: 767px)')
    function aoMudar(e: MediaQueryListEvent) {
      setEhEstreita(e.matches)
      if (!e.matches) setDrawerAberto(false)
    }
    mql.addEventListener('change', aoMudar)
    return () => mql.removeEventListener('change', aoMudar)
  }, [])

  const estilo = configuracao?.estiloNavegacao ?? 'LATERAL'
  // BottomNav só aparece se estilo for INFERIOR, mas em telas mobile usamos topbar + drawer
  // A spec diz: abaixo de 768px a sidebar vira um drawer oculto aberto por botão hamburger numa topbar
  // O BottomNavBar de `estiloNavegacao` continua intocado? Sim, mas o drawer mobile substitui a sidebar.
  // Vamos preservar a regra: se for INFERIOR, usa BottomNavBar e não tem drawer. Se for LATERAL e mobile, usa TopBar + Drawer.
  const ehInferior = estilo === 'INFERIOR'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const nomeLoja = configuracao?.nome ?? ''

  return (
    <div className="flex h-screen overflow-hidden bg-card text-foreground flex-col md:flex-row">
      <ScrollRestoration />
      
      {/* Mobile Topbar */}
      {ehEstreita && !ehInferior && (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm md:hidden shrink-0">
          <button
            type="button"
            onClick={() => setDrawerAberto(true)}
            className="inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted p-2 -ml-2"
            aria-label="Abrir menu"
          >
            <List className="size-6" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
              <ShoppingBag className="size-4" aria-hidden />
            </div>
            <span className="truncate font-bold tracking-tight">{nomeLoja}</span>
          </div>
        </header>
      )}

      {/* Drawer Mobile */}
      {ehEstreita && !ehInferior && (
        <SidebarMobile
          nome={nomeLoja}
          onLogout={handleLogout}
          aberta={drawerAberto}
          aoFechar={() => setDrawerAberto(false)}
          itens={itens}
        />
      )}

      {/* Navegação */}
      {ehInferior ? (
        <BottomNavBar onLogout={handleLogout} mostrarMembros={mostrarMembros} />
      ) : !ehEstreita ? (
        <Sidebar nome={nomeLoja} onLogout={handleLogout} itens={itens} />
      ) : null}

      <main className={`flex-1 min-w-0 h-full overflow-y-auto ${ehInferior ? 'pb-20' : ''}`}>
        <div className="mx-auto w-full px-4 md:px-6 py-6 max-w-full">
          <RouteTransition />
        </div>
      </main>
      <BotaoAjudaFlutuante />
    </div>
  )
}
