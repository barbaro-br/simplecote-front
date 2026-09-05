import { useEffect, type ReactNode } from 'react'
import { useConfiguracaoLoja } from './configuracoes.api'
import { useAuth } from '@/shared/auth/useAuth'

/**
 * Aplica a cor de marca (`corPrimaria`) como `--primary` no elemento raiz do
 * documento num único ponto de bootstrap — antes das rotas renderizarem.
 * O nome/telefone/layout ficam disponíveis via `useConfiguracaoLoja()`.
 *
 * Só busca `/api/configuracoes` (rota ADMIN) quando há sessão autenticada —
 * nas rotas públicas (colaborador/representante) não há token e a busca é
 * desligada, evitando o `401` que levava o visitante ao `/login`.
 */
export function ConfiguracaoLojaProvider({ children }: { children: ReactNode }) {
  const { isAutenticado } = useAuth()
  const { data } = useConfiguracaoLoja({ enabled: isAutenticado })

  useEffect(() => {
    if (data?.corPrimaria) {
      document.documentElement.style.setProperty('--primary', data.corPrimaria)
    }
  }, [data?.corPrimaria])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', data?.tema === 'ESCURO')
  }, [data?.tema])

  return <>{children}</>
}
