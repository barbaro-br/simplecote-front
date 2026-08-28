import { Outlet } from 'react-router-dom'

/**
 * Wrapper das rotas do representante (`/cotacao/:token`, `/pedido/:token`):
 * força o tema claro (spec.md §13) via a classe `.tema-claro` (redeclara os
 * tokens claros) + `color-scheme: light`, e ocupa a tela toda em mobile-first.
 */
export function TemaClaro() {
  return (
    <div className="tema-claro min-h-screen bg-background text-foreground [color-scheme:light]">
      <Outlet />
    </div>
  )
}
