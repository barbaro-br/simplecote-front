import { useState } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { dataHoraBr } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { ItensSection } from './ItensSection'
import { GradeAoVivoTabela } from './GradeAoVivoTabela'
import { ConfirmarDialog } from './ConfirmarDialog'
import { AbrirCotacaoDialog } from './AbrirCotacaoDialog'
import { RepresentantesModal } from './RepresentantesModal'
import type { ItemOmitido } from './cotacoes.schema'
import {
  useAbrir,
  useApurar,
  useCancelar,
  useCotacao,
  useDuplicarCotacao,
  useEncerrar,
  useReabrir,
  useConvidarEmpresas,
  useGradeAoVivo,
  useGradeAoVivoSSE
} from './cotacoes.api'

type DialogAberto = 'abrir' | 'apurar' | 'cancelar' | null

function GradeAoVivoContainer({ id, status }: { id: string; status: string }) {
  useGradeAoVivoSSE(id, status)
  const { data: grade, isLoading, error } = useGradeAoVivo(id)

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Carregando grade ao vivo…</p>
  if (error) return <p className="text-sm text-destructive p-4">Erro ao carregar grade ao vivo: {error.message}</p>
  if (!grade) return null

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Grade de Respostas (Ao Vivo)</h2>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-2.5 py-0.5 rounded-full">
          {grade.respondidos} / {grade.totalParticipantes} respondidos
        </span>
      </div>
      <GradeAoVivoTabela cotacaoId={id} grade={grade} />
    </div>
  )
}

export function CotacaoDetalhePage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: cotacao, isLoading, error } = useCotacao(id)

  const abrir = useAbrir(id)
  const encerrar = useEncerrar(id)
  const reabrir = useReabrir(id)
  const cancelar = useCancelar(id)
  const apurar = useApurar(id)
  const duplicar = useDuplicarCotacao()
  const convidar = useConvidarEmpresas(id)

  const [dialog, setDialog] = useState<DialogAberto>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [modalConviteAberto, setModalConviteAberto] = useState(false)
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([])

  // Itens que a duplicação não conseguiu copiar chegam via `state` da navegação.
  // Deriva no render (a rota `/admin/cotacoes/:id` não remonta ao trocar de id) e
  // guarda só a `key` da navegação dispensada, pra o aviso voltar numa duplicação nova.
  const [dispensadoKey, setDispensadoKey] = useState<string | null>(null)
  const omitidos: ItemOmitido[] =
    dispensadoKey === location.key
      ? []
      : ((location.state as { omitidos?: ItemOmitido[] } | null)?.omitidos ?? [])

  function aoDuplicar() {
    setErroAcao(null)
    duplicar.mutate(id, {
      onSuccess: (data) =>
        navigate(`/admin/cotacoes/${data.cotacao.id}`, { state: { omitidos: data.omitidos } }),
      onError: tratarErro,
    })
  }

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
    apurar.isPending ||
    duplicar.isPending ||
    convidar.isPending

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="sticky top-0 bg-background z-10 pb-4 pt-4 border-b border-border shadow-sm mb-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{cotacao.titulo}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <StatusBadge status={status} />
              {cotacao.prazo && <span>· Prazo: {dataHoraBr(cotacao.prazo)}</span>}
            </p>
          </div>
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">
            ← Cotações
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90"
            >
              Ver resultado
            </Link>
          )}

          <Button variant="secondary" onClick={aoDuplicar} disabled={acaoPendente}>
            {duplicar.isPending ? 'Duplicando…' : 'Duplicar'}
          </Button>

          {status !== 'CANCELADA' && (
            <Button variant="outline" onClick={() => setModalConviteAberto(true)}>
              Representantes
            </Button>
          )}
        </div>
      </div>

      {omitidos.length > 0 && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm"
        >
          <div>
            <p className="font-medium">Itens não copiados nesta duplicação:</p>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {omitidos.map((o) => (
                <li key={o.produtoId}>
                  {o.nome} — {o.motivo}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setDispensadoKey(location.key)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dispensar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {erroAcao && (
        <div role="alert" className="text-sm text-destructive font-medium">
          {erroAcao}
        </div>
      )}

      <div className="space-y-6">
        {(status === 'RASCUNHO' || status === 'CANCELADA' || status === 'PEDIDOS_GERADOS') && (
          <ItensSection cotacaoId={id} itens={cotacao.itens} editavel={status === 'RASCUNHO'} />
        )}

        {(status === 'ABERTA' || status === 'ENCERRADA') && <GradeAoVivoContainer id={id} status={status} />}
      </div>

      {dialog === 'abrir' && (
        <AbrirCotacaoDialog
          pendente={abrir.isPending || convidar.isPending}
          onCancelar={() => setDialog(null)}
          onAbrir={async (prazoIso) => {
            setErroAcao(null)
            try {
              if (empresasSelecionadas.length > 0) {
                await convidar.mutateAsync(empresasSelecionadas)
                setEmpresasSelecionadas([])
              }
              await abrir.mutateAsync({ prazo: prazoIso })
              setDialog(null)
            } catch (e) {
              tratarErro(e)
            }
          }}
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

      <RepresentantesModal
        cotacaoId={id} status={status}
        open={modalConviteAberto}
        onClose={() => setModalConviteAberto(false)}
        selecionadas={empresasSelecionadas}
        onToggle={(empresaId) => setEmpresasSelecionadas(s => s.includes(empresaId) ? s.filter(x => x !== empresaId) : [...s, empresaId])}
      />
    </div>
  )
}
