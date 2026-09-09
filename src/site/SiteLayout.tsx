import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { List, X } from '@phosphor-icons/react'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { CREDITO_DESENVOLVEDOR } from '@/shared/creditos-desenvolvedor'
import { BrandLogo } from './BrandLogo'
import { CursorMais } from './tech/CursorMais'
import { useSmoothScroll } from './tech/useSmoothScroll'
import { useDeveAnimar } from './tech/useReduzirMovimento'

/**
 * Casca pública do site (cabeçalho + rodapé), reusável com `children` — para
 * que a raiz `/` só monte a casca quando realmente for exibir a home, nunca
 * durante um redirect (o `Raiz` renderiza `<SiteChrome>` só no caso marketing).
 *
 * É aqui que o smooth-scroll (Lenis) e o cursor custom vivem: só no site, nunca
 * no `/admin` nem nas rotas por token. O wrapper raiz usa `overflow-x: clip`
 * para nunca haver scroll horizontal.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const deveAnimar = useDeveAnimar()
  const [noTopo, setNoTopo] = useState(true)
  const [escondido, setEscondido] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const ultimoY = useRef(0)

  // Fecha o menu mobile com Escape (a troca de rota é fechada no onClick dos links).
  useEffect(() => {
    if (!menuAberto) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuAberto(false)
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [menuAberto])

  useEffect(() => {
    const aoRolar = () => {
      const y = window.scrollY
      setNoTopo(y < 8)
      if (deveAnimar) {
        if (y > ultimoY.current && y > 96) setEscondido(true)
        else if (y < ultimoY.current) setEscondido(false)
      }
      ultimoY.current = y
    }
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [deveAnimar])

  useSmoothScroll()

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip text-foreground">
      <CursorMais />
      <header
        className={`sticky top-0 z-30 border-b transition-all duration-300 ${
          escondido ? '-translate-y-full' : 'translate-y-0'
        } ${
          noTopo
            ? 'border-transparent bg-transparent'
            : 'border-border bg-background/80 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/70'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link
            to="/"
            aria-label="SimpleCote — página inicial"
            data-cursor="mais"
            onClick={() => setMenuAberto(false)}
          >
            <BrandLogo tom={noTopo ? 'claro' : 'auto'} />
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="hidden items-center gap-6 sm:flex">
              <Link
                to="/precos"
                className={`text-sm transition-colors ${noTopo ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Preços
              </Link>
              <Link
                to="/ajuda"
                className={`text-sm transition-colors ${noTopo ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Ajuda
              </Link>
              <Link
                to="/login"
                className={`text-sm font-medium hover:underline ${noTopo ? 'text-white' : ''}`}
                data-cursor="mais"
              >
                Entrar
              </Link>
            </nav>

            <Link
              to="/cadastro"
              className={buttonClasses({ className: 'max-sm:px-3 max-sm:text-xs' })}
              data-cursor="mais"
            >
              Criar conta
            </Link>

            <button
              type="button"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuAberto}
              aria-controls="menu-mobile"
              className={`flex size-9 items-center justify-center rounded-md transition-colors sm:hidden ${
                noTopo ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'
              }`}
            >
              {menuAberto ? <X className="size-5" /> : <List className="size-5" />}
            </button>
          </div>
        </div>

        {menuAberto && (
          <div
            id="menu-mobile"
            className="absolute inset-x-0 top-full border-b border-border bg-background/95 shadow-lg backdrop-blur-md sm:hidden"
          >
            <nav className="mx-auto flex max-w-6xl flex-col px-4 py-1">
              {[
                ['/precos', 'Preços'],
                ['/ajuda', 'Ajuda'],
                ['/login', 'Entrar'],
              ].map(([to, rotulo]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuAberto(false)}
                  className="border-b border-border/40 py-3 text-sm font-medium text-foreground last:border-0"
                >
                  {rotulo}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="relative overflow-hidden border-t bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <BrandLogo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Cotações competitivas simplificadas para supermercados.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
            <Link to="/precos" className="hover:text-foreground">
              Preços
            </Link>
            <Link to="/ajuda" className="hover:text-foreground">
              Ajuda
            </Link>
            <Link to="/login" className="hover:text-foreground">
              Entrar
            </Link>
            <Link to="/cadastro" className="hover:text-foreground">
              Criar conta
            </Link>
          </nav>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground/70">
          {CREDITO_DESENVOLVEDOR.href ? (
            <a href={CREDITO_DESENVOLVEDOR.href} target="_blank" rel="noopener noreferrer">
              {CREDITO_DESENVOLVEDOR.texto}
            </a>
          ) : (
            <span>{CREDITO_DESENVOLVEDOR.texto}</span>
          )}
        </div>
      </footer>
    </div>
  )
}

export function SiteLayout() {
  return (
    <SiteChrome>
      <Outlet />
    </SiteChrome>
  )
}
