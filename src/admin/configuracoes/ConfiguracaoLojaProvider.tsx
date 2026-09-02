import { useEffect, type ReactNode } from 'react'
import { useConfiguracaoLoja } from './configuracoes.api'

/**
 * Aplica a cor de marca (`corPrimaria`) como `--primary` no elemento raiz do
 * documento num único ponto de bootstrap — antes das rotas renderizarem.
 * O nome/telefone/layout ficam disponíveis via `useConfiguracaoLoja()`.
 */
export function ConfiguracaoLojaProvider({ children }: { children: ReactNode }) {
  const { data } = useConfiguracaoLoja()

  useEffect(() => {
    if (data?.corPrimaria) {
      document.documentElement.style.setProperty('--primary', data.corPrimaria)
    }
  }, [data?.corPrimaria])

  return <>{children}</>
}
