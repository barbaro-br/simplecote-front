import { Loader2 } from 'lucide-react'

/**
 * Fallback exibido enquanto o chunk da rota (lazy) ainda está baixando.
 * Usado como `HydrateFallback` nas rotas com filhos lazy (`/admin` e público
 * mobile) para evitar tela em branco no primeiro carregamento.
 */
export function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}
