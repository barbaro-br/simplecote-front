import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { CREDITO_DESENVOLVEDOR } from '@/shared/creditos-desenvolvedor'
import { Logo } from './Logo'

/**
 * Casca pública do site (cabeçalho + rodapé), reusável com `children` — para
 * que a raiz `/` só monte a casca quando realmente for exibir a home, nunca
 * durante um redirect (o `Raiz` renderiza `<SiteChrome>` só no caso marketing).
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link to="/" aria-label="SimpleCote — página inicial">
            <Logo />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link to="/precos" className="text-sm text-muted-foreground hover:text-foreground">
              Preços
            </Link>
            <Link to="/ajuda" className="text-sm text-muted-foreground hover:text-foreground">
              Ajuda
            </Link>
            <Link to="/login" className="text-sm font-medium hover:underline">
              Entrar
            </Link>
            <Link to="/cadastro" className={buttonClasses({})}>
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Logo />
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
