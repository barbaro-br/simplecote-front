import { useEffect } from 'react'
import { configurarAcessoBloqueado } from '@/shared/api/api-client'
import { routes } from '@/routes'

/**
 * Fia o handler de acesso bloqueado do `api-client` ao router. Renderizado
 * dentro de `<AuthProvider>`. Quando uma chamada autenticada volta `403` de
 * bloqueio (suspensão ou prazo de teste vencido), navega para `/conta-bloqueada`
 * SEM deslogar — a sessão fica viva para o botão "Sair" da tela poder deslogar.
 */
export function AcessoBloqueadoBridge() {
  useEffect(() => {
    configurarAcessoBloqueado(({ motivo, detail }) => {
      void routes.navigate('/conta-bloqueada', { replace: true, state: { motivo, detail } })
    })
  }, [])

  return null
}
