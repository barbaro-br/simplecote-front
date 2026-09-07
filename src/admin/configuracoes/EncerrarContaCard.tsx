import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useAuth } from '@/shared/auth/useAuth'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { useConfiguracaoLoja, encerrarOrganizacao } from './configuracoes.api'

/**
 * Encerra a organização (só OWNER). Confirmação forte: digitar o nome da loja.
 * Sucesso → encerra a sessão e leva à tela "conta encerrada".
 */
export function EncerrarContaCard() {
  const { papel, logout } = useAuth()
  const navigate = useNavigate()
  const { data: configuracao } = useConfiguracaoLoja()

  const [aberto, setAberto] = useState(false)
  const [nomeDigitado, setNomeDigitado] = useState('')
  const [pendente, setPendente] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  if (papel !== 'OWNER') return null

  const nomeLoja = configuracao?.nome ?? ''
  const confere = nomeLoja.length > 0 && nomeDigitado.trim() === nomeLoja

  function abrir() {
    setErro(null)
    setNomeDigitado('')
    setAberto(true)
  }

  async function confirmar() {
    setErro(null)
    setPendente(true)
    try {
      await encerrarOrganizacao()
      await logout()
      navigate('/conta-encerrada', { replace: true })
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Erro ao encerrar a conta.')
      setPendente(false)
    }
  }

  return (
    <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-medium ui-uppercase text-destructive">Encerrar a organização</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Encerra a conta da loja: todos os acessos são revogados e os dados são apagados em
          definitivo após um período de carência. Esta ação é irreversível.
        </p>
      </div>
      <Button type="button" variant="destructive" onClick={abrir}>
        Encerrar organização
      </Button>

      {aberto && (
        <Dialog open onClose={() => setAberto(false)} title="Encerrar organização">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ao encerrar, os acessos da loja são revogados e os dados serão apagados após a
              carência. Não há como desfazer.
            </p>
            <div className="space-y-1.5">
              <label htmlFor="confirmar-encerrar" className="text-sm font-medium ui-uppercase">
                Digite <strong>{nomeLoja}</strong> para confirmar
              </label>
              <Input
                id="confirmar-encerrar"
                value={nomeDigitado}
                onChange={(e) => setNomeDigitado(e.target.value)}
                autoComplete="off"
                placeholder={nomeLoja}
              />
            </div>
            {erro && (
              <p role="alert" className="text-[13px] text-destructive">
                {erro}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t pt-3">
              <Button type="button" variant="ghost" onClick={() => setAberto(false)} disabled={pendente}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" disabled={!confere || pendente} onClick={confirmar}>
                {pendente ? 'Encerrando…' : 'Encerrar definitivamente'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
