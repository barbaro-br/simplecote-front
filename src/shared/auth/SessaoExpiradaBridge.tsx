import { useEffect } from 'react'
import { configurarSessaoExpirada } from '@/shared/api/api-client'
import { routes } from '@/routes'
import { useAuth } from './useAuth'

/**
 * Fia o handler de sessão expirada do `api-client` ao `AuthContext` + router.
 * Renderizado dentro de `<AuthProvider>`. Quando uma chamada autenticada recebe
 * `401`, o `api-client` chama este handler: limpa o token em memória (`logout`)
 * e leva o usuário para `/login` (`replace`).
 */
export function SessaoExpiradaBridge() {
  const { logout } = useAuth()

  useEffect(() => {
    configurarSessaoExpirada(() => {
      logout()
      void routes.navigate('/login', { replace: true })
    })
  }, [logout])

  return null
}
