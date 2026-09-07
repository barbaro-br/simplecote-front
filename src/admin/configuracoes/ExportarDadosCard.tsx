import { useState } from 'react'
import { DownloadSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useAuth } from '@/shared/auth/useAuth'
import { Button } from '@/shared/components/ui/button'
import { exportarDadosOrganizacao } from './configuracoes.api'

/**
 * Exporta os dados da organização (OWNER/ADMIN). `200` baixa o arquivo; `202`
 * o back gera assíncrono e envia por e-mail.
 */
export function ExportarDadosCard() {
  const { papel } = useAuth()
  const [pendente, setPendente] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  if (papel !== 'OWNER' && papel !== 'ADMIN') return null

  async function exportar() {
    setErro(null)
    setPendente(true)
    try {
      const resultado = await exportarDadosOrganizacao()
      if (resultado === 'assincrono') {
        toast.info('Estamos gerando o arquivo — você receberá por e-mail quando estiver pronto.')
      }
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Erro ao exportar os dados.')
    } finally {
      setPendente(false)
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div>
        <h3 className="text-sm font-medium ui-uppercase">Exportar dados da organização</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Baixe um arquivo com cotações, produtos, empresas, representantes e resultados da sua loja.
        </p>
      </div>
      {erro && (
        <p role="alert" className="text-[13px] text-destructive">
          {erro}
        </p>
      )}
      <Button type="button" variant="outline" onClick={exportar} disabled={pendente}>
        <DownloadSimple className="mr-2 size-4" />
        {pendente ? 'Gerando…' : 'Exportar dados'}
      </Button>
    </div>
  )
}
