import { CircleNotch } from '@phosphor-icons/react'

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
      <CircleNotch className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}
