import { useEffect } from 'react'
import { toast } from 'sonner'
import { configurarSessaoExpirada } from '@/shared/api/api-client'
import { routes } from '@/routes'
import { useAuth } from './useAuth'

/**
 * Fia o handler de sessão expirada do `api-client` ao `AuthContext` + router.
 * Renderizado dentro de `<AuthProvider>`. Quando uma chamada autenticada recebe
 * `401`:
 * - em modo suporte (token com `impersonatedBy`), o token de suporte expirou e
 *   NÃO é renovável — sai do modo suporte (restaura/renova a sessão de
 *   SUPER_ADMIN) e volta ao backoffice, com aviso;
 * - caso contrário, desloga e leva para `/login`.
 */
export function SessaoExpiradaBridge() {
  const { logout, sairModoSuporte, modoSuporte } = useAuth()

  useEffect(() => {
    configurarSessaoExpirada(() => {
      if (modoSuporte) {
        void sairModoSuporte().then(() => {
          toast.error('Sessão de suporte expirada.')
          void routes.navigate('/backoffice', { replace: true })
        })
        return
      }
      logout()
      void routes.navigate('/login', { replace: true })
    })
  }, [logout, sairModoSuporte, modoSuporte])

  return null
}
