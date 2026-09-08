import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'
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
  const ultimoY = useRef(0)

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
        className={`sticky top-0 z-30 border-b backdrop-blur-md transition-all duration-300 ${
          escondido ? '-translate-y-full' : 'translate-y-0'
        } ${
          noTopo
            ? 'border-transparent bg-background/70 supports-[backdrop-filter]:bg-background/60'
            : 'border-border bg-background/80 shadow-sm supports-[backdrop-filter]:bg-background/70'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link to="/" aria-label="SimpleCote — página inicial" data-cursor="mais">
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link to="/precos" className="text-sm text-muted-foreground hover:text-foreground">
              Preços
            </Link>
            <Link to="/ajuda" className="text-sm text-muted-foreground hover:text-foreground">
              Ajuda
            </Link>
            <Link to="/login" className="text-sm font-medium hover:underline" data-cursor="mais">
              Entrar
            </Link>
            <Link to="/cadastro" className={buttonClasses({})} data-cursor="mais">
              Criar conta
            </Link>
          </nav>
        </div>
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
