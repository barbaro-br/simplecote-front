import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/useAuth'

/**
 * Tarja permanente do modo suporte (impersonação). Renderizada no topo do
 * `AdminLayout` quando a sessão tem o claim `impersonatedBy`. O nome do
 * `Comprador` impersonado vem da config da loja (que, em modo suporte, reflete o
 * alvo). "Sair do modo suporte" restaura a sessão de SUPER_ADMIN e volta ao
 * backoffice.
 */
export function ModoSuporteBanner({ nomeComprador }: { nomeComprador: string }) {
  const { modoSuporte, sairModoSuporte } = useAuth()
  const navigate = useNavigate()

  if (!modoSuporte) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-warning/20 px-4 py-2 text-sm text-foreground">
      <span className="font-medium">
        Modo suporte{nomeComprador ? ` — ${nomeComprador}` : ''}
      </span>
      <button
        type="button"
        onClick={async () => {
          await sairModoSuporte()
          navigate('/backoffice', { replace: true })
        }}
        className="font-medium underline hover:no-underline"
      >
        Sair do modo suporte
      </button>
    </div>
  )
}
