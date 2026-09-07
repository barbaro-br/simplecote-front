import { useEffect, type ReactNode } from 'react'
import { useConfiguracaoLoja } from './configuracoes.api'
import { useAuth } from '@/shared/auth/useAuth'

/**
 * Aplica a cor de marca (`corPrimaria`) como `--primary` no elemento raiz do
 * documento num único ponto de bootstrap — antes das rotas renderizarem.
 * O nome/telefone/layout ficam disponíveis via `useConfiguracaoLoja()`.
 * O título da aba segue a identidade: "SimpleCote" antes/depois da sessão e
 * "<nome da loja> · SimpleCote" quando autenticado com a config carregada.
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

  // Título da aba: identidade da loja só depois do login; antes/depois da
  // sessão (logout ou sessão expirada) volta ao título base do produto.
  useEffect(() => {
    if (isAutenticado && data?.nome) {
      document.title = `${data.nome} · SimpleCote`
    } else {
      document.title = 'SimpleCote'
    }
  }, [isAutenticado, data?.nome])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', data?.tema === 'ESCURO')
  }, [data?.tema])

  return <>{children}</>
}
