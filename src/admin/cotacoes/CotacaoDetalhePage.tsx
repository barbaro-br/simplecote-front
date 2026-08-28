import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { dataHoraBr } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { rotuloStatus } from './CotacoesPage'
import { ItensSection } from './ItensSection'
import { ParticipantesSection } from './ParticipantesSection'
import { RespostasSection } from './RespostasSection'
import { ConfirmarDialog } from './ConfirmarDialog'
import { AbrirCotacaoDialog } from './AbrirCotacaoDialog'
import {
  useAbrir,
  useApurar,
  useCancelar,
  useCotacao,
  useEncerrar,
  useReabrir,
} from './cotacoes.api'

type DialogAberto = 'abrir' | 'apurar' | 'cancelar' | null

export function CotacaoDetalhePage() {
  const { id = '' } = useParams()
  const { data: cotacao, isLoading, error } = useCotacao(id)

  const abrir = useAbrir(id)
  const encerrar = useEncerrar(id)
  const reabrir = useReabrir(id)
  const cancelar = useCancelar(id)
  const apurar = useApurar(id)

  const [dialog, setDialog] = useState<DialogAberto>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    setErroAcao(e instanceof ApiError ? e.message : 'Erro inesperado ao executar a ação.')
  }

  async function executar(fn: () => Promise<unknown>) {
    setErroAcao(null)
    try {
      await fn()
      setDialog(null)
    } catch (e) {
      tratarErro(e)
    }
  }

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando cotação…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar a cotação: {error.message}</p>
  if (!cotacao) return null

  const { status } = cotacao
  const acaoPendente =
    abrir.isPending ||
    encerrar.isPending ||
    reabrir.isPending ||
    cancelar.isPending ||
    apurar.isPending

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{cotacao.titulo}</h1>
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-medium text-foreground">{rotuloStatus(status)}</span>
            {cotacao.prazo && <> · Prazo: {dataHoraBr(cotacao.prazo)}</>}
          </p>
        </div>
        <Link to="/admin" className="text-sm text-primary hover:underline">
          ← Cotações
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {status === 'RASCUNHO' && (
          <>
            <Button onClick={() => setDialog('abrir')}>Abrir</Button>
            <Button variant="destructive" onClick={() => setDialog('cancelar')}>
              Cancelar
            </Button>
          </>
        )}
        {status === 'ABERTA' && (
          <>
            <Button onClick={() => executar(() => encerrar.mutateAsync())} disabled={acaoPendente}>
              Encerrar
            </Button>
            <Button variant="destructive" onClick={() => setDialog('cancelar')}>
              Cancelar
            </Button>
          </>
        )}
        {status === 'ENCERRADA' && (
          <>
            <Button onClick={() => executar(() => reabrir.mutateAsync())} disabled={acaoPendente}>
              Reabrir
            </Button>
            <Button onClick={() => setDialog('apurar')}>Apurar</Button>
            <Button variant="destructive" onClick={() => setDialog('cancelar')}>
              Cancelar
            </Button>
          </>
        )}
        {status === 'PEDIDOS_GERADOS' && (
          <Link
            to={`/admin/cotacoes/${id}/resultado`}
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ver resultado
          </Link>
        )}
      </div>

      {erroAcao && (
        <div role="alert" className="text-sm text-destructive">
          {erroAcao}
        </div>
      )}

      <ItensSection cotacaoId={id} itens={cotacao.itens} editavel={status === 'RASCUNHO'} />

      {status !== 'CANCELADA' && (
        <ParticipantesSection cotacaoId={id} podeConvidar={status === 'RASCUNHO'} />
      )}

      {(status === 'ABERTA' || status === 'ENCERRADA') && <RespostasSection cotacaoId={id} />}

      {dialog === 'abrir' && (
        <AbrirCotacaoDialog
          pendente={abrir.isPending}
          onCancelar={() => setDialog(null)}
          onAbrir={(prazoIso) => executar(() => abrir.mutateAsync({ prazo: prazoIso }))}
        />
      )}
      {dialog === 'apurar' && (
        <ConfirmarDialog
          titulo="Apurar cotação"
          descricao="Apurar não pode ser desfeito. Itens sem nenhum lance ficarão sem vencedor."
          rotuloConfirmar="Apurar"
          pendente={apurar.isPending}
          onCancelar={() => setDialog(null)}
          onConfirmar={() => executar(() => apurar.mutateAsync())}
        />
      )}
      {dialog === 'cancelar' && (
        <ConfirmarDialog
          titulo="Cancelar cotação"
          descricao="Cancelar a cotação é irreversível. Os participantes não poderão mais responder e nenhum pedido será gerado."
          rotuloConfirmar="Cancelar cotação"
          pendente={cancelar.isPending}
          onCancelar={() => setDialog(null)}
          onConfirmar={() => executar(() => cancelar.mutateAsync())}
        />
      )}
    </div>
  )
}
