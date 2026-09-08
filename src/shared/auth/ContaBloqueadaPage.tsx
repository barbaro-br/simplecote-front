import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/shared/auth/useAuth'
import type { MotivoBloqueio } from '@/shared/api/api-client'

const TITULO: Record<MotivoBloqueio, string> = {
  suspensao: 'Conta suspensa',
  prazo: 'Período de teste encerrado',
}

/**
 * Tela cheia de "acesso bloqueado" (identidade SimpleCote). Mostra o título
 * conforme o motivo (suspensão ou prazo vencido), o `detail` do backend e um
 * botão "Sair" que desloga e leva ao `/login`. Chega-se aqui via
 * `AcessoBloqueadoBridge` (estado do router), não por rota direta.
 */
export function ContaBloqueadaPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const state = location.state as { motivo?: MotivoBloqueio; detail?: string } | null
  const motivo = state?.motivo ?? 'suspensao'
  const detail = state?.detail ?? ''

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-4 px-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight ui-uppercase">{TITULO[motivo]}</h1>
        {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
        <Button
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          Sair
        </Button>
      </div>
    </div>
  )
}
