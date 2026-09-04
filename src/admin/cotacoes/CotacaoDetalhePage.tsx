import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { dataHoraBr } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ErrorAlert } from '@/shared/components/ui/error-alert'
import { Breadcrumb } from '@/shared/components/ui/breadcrumb'
import { ItensSection } from './ItensSection'
import { GradeAoVivoTabela } from './GradeAoVivoTabela'
import { AdicionarItemModal } from './AdicionarItemModal'
import { ConfirmarDialog } from './ConfirmarDialog'
import { AbrirCotacaoDialog } from './AbrirCotacaoDialog'
import { RepresentantesModal } from './RepresentantesModal'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import type { Produto } from '@/admin/produtos/produtos.schema'
import type { ItemCotacao } from './cotacoes.schema'
import {
  useAbrir,
  useApurar,
  useCancelar,
  useCotacao,
  useEncerrar,
  useReabrir,
  useConvidarEmpresas,
  useGradeAoVivo,
  useGradeAoVivoSSE,
  useParticipantes,
  useFinalizarParticipante
} from './cotacoes.api'

type DialogAberto = 'abrir' | 'apurar' | 'cancelar' | 'encerrar' | null

function GradeAoVivoContainer({ id, status, itens }: { id: string; status: string; itens: ItemCotacao[] }) {
  useGradeAoVivoSSE(id, status)
  const { data: grade, isLoading, error } = useGradeAoVivo(id)

  const [adicionarItemAberto, setAdicionarItemAberto] = useState(false)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | undefined>(undefined)

  function abrirCadastro() {
    setAdicionarItemAberto(false)
    setCadastroAberto(true)
  }

  function abrirEdicao(produto: Produto) {
    setAdicionarItemAberto(false)
    setProdutoParaEditar(produto)
    setCadastroAberto(true)
  }

  function aoCadastrarProduto() {
    setCadastroAberto(false)
    setProdutoParaEditar(undefined)
    setAdicionarItemAberto(true)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Carregando grade ao vivo…</p>
  if (error) return <p className="text-sm text-destructive p-4">Erro ao carregar grade ao vivo: {error.message}</p>
  if (!grade) return null

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Grade de Respostas (Ao Vivo)</h2>
        <div className="flex items-center gap-2">
          {status === 'ABERTA' && (
            <Button size="sm" onClick={() => setAdicionarItemAberto(true)}>
              Adicionar item
            </Button>
          )}
          <span className="text-sm text-muted-foreground font-medium bg-muted px-2.5 py-0.5 rounded-full">
            {grade.respondidos} / {grade.totalParticipantes} respondidos
          </span>
        </div>
      </div>
      <GradeAoVivoTabela cotacaoId={id} grade={grade} />

      <AdicionarItemModal
        cotacaoId={id}
        itens={itens}
        open={adicionarItemAberto}
        onClose={() => setAdicionarItemAberto(false)}
        aoCadastrarProduto={abrirCadastro}
        aoEditarProduto={abrirEdicao}
      />

      <Dialog
        open={cadastroAberto}
        onClose={() => setCadastroAberto(false)}
        size="lg"
        ariaLabel="Cadastrar novo produto"
      >
        <ProdutoForm aoSalvar={aoCadastrarProduto} produtoParaEditar={produtoParaEditar} />
      </Dialog>
    </div>
  )
}

export function CotacaoDetalhePage() {
  const { id = '' } = useParams()
  const { data: cotacao, isLoading, error } = useCotacao(id)

  const abrir = useAbrir(id)
  const encerrar = useEncerrar(id)
  const reabrir = useReabrir(id)
  const cancelar = useCancelar(id)
  const apurar = useApurar(id)
  const convidar = useConvidarEmpresas(id)
  const participantes = useParticipantes(id)
  const gradeAoVivo = useGradeAoVivo(id)
  const finalizarParticipante = useFinalizarParticipante(id)

  const [dialog, setDialog] = useState<DialogAberto>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [modalConviteAberto, setModalConviteAberto] = useState(false)
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([])
  const [finalizandoMassa, setFinalizandoMassa] = useState(false)

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
    convidar.isPending

  const pendentesVisualizou = (participantes.data ?? []).filter(
    (p) => p.participanteStatus === 'VISUALIZOU',
  )

  const participantesComLanceCotado = (participantes.data ?? []).filter((p) => {
    if (p.participanteStatus === 'RESPONDIDO') return false
    const temLanceCotado = (gradeAoVivo.data?.itens ?? []).some((item) =>
      item.precos.some((c) => c.participanteId === p.participanteId && c.status === 'COTADO'),
    )
    return temLanceCotado
  })

  async function finalizarTodosAntesDeEncerrar() {
    const alvos = participantesComLanceCotado
    if (alvos.length === 0) return
    setFinalizandoMassa(true)
    const toastId = toast.loading('Finalizando respostas...')
    const resultados = await Promise.allSettled(
      alvos.map((p) => finalizarParticipante.mutateAsync(p.participanteId)),
    )
    setFinalizandoMassa(false)
    const sucessos = resultados.filter((r) => r.status === 'fulfilled').length
    const falhas = resultados.filter((r) => r.status === 'rejected').length
    if (falhas === 0) {
      toast.success(`${sucessos} resposta(s) finalizada(s).`, { id: toastId })
    } else if (sucessos === 0) {
      toast.error(`Falha ao finalizar ${falhas} resposta(s).`, { id: toastId })
    } else {
      toast.warning(`${sucessos} resposta(s) finalizada(s), mas ${falhas} falharam.`, { id: toastId })
    }
  }

  return (
    <PageContainer maxWidth="4xl" className="space-y-6">
      <div className="sticky top-0 bg-background z-10 pb-4 pt-4 border-b border-border mb-6 space-y-4">
        <Breadcrumb
          items={[
            { label: 'Cotações', to: '/admin/cotacoes' },
            { label: cotacao.titulo },
          ]}
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{cotacao.titulo}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <StatusBadge status={status} />
            {cotacao.prazo && <span>· Prazo: {dataHoraBr(cotacao.prazo)}</span>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status === 'RASCUNHO' && (
            <>
              <Button onClick={() => setDialog('abrir')}>Abrir</Button>
            </>
          )}
          {status === 'ABERTA' && (
            <>
              <Button onClick={() => setDialog('encerrar')} disabled={acaoPendente}>
                Encerrar
              </Button>
            </>
          )}
          {status === 'ENCERRADA' && (
            <>
              <Button onClick={() => executar(() => reabrir.mutateAsync())} disabled={acaoPendente}>
                Reabrir
              </Button>
              <Button onClick={() => setDialog('apurar')}>Apurar</Button>
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

          {status !== 'CANCELADA' && (
            <Button variant="outline" onClick={() => setModalConviteAberto(true)}>
              Representantes
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            {(status === 'RASCUNHO' || status === 'ABERTA') && (
              <Button
                variant="outline"
                className="text-destructive border-destructive/40 hover:bg-destructive/10"
                onClick={() => setDialog('cancelar')}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      {erroAcao && <ErrorAlert>{erroAcao}</ErrorAlert>}

      <div className="space-y-6">
        {(status === 'RASCUNHO' || status === 'CANCELADA' || status === 'PEDIDOS_GERADOS') && (
          <ItensSection cotacaoId={id} itens={cotacao.itens} editavel={status === 'RASCUNHO'} />
        )}

        {(status === 'ABERTA' || status === 'ENCERRADA') && <GradeAoVivoContainer id={id} status={status} itens={cotacao.itens} />}
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
        >
          {pendentesVisualizou.length > 0 && (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
              <p className="font-medium text-warning">Participantes que não finalizaram a resposta:</p>
              <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                {pendentesVisualizou.map((p) => (
                  <li key={p.participanteId}>{p.empresaNome}</li>
                ))}
              </ul>
            </div>
          )}
        </ConfirmarDialog>
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
      {dialog === 'encerrar' && (
        <Dialog open onClose={() => setDialog(null)} title="Encerrar cotação">
          <p className="text-sm text-muted-foreground">
            A cotação deixará de aceitar novas respostas dos representantes. Você pode reabri-la depois.
          </p>
          {participantesComLanceCotado.length > 0 && (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm space-y-2">
              <p className="font-medium text-warning">
                Representantes que preencheram preço mas não finalizaram a resposta:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground">
                {participantesComLanceCotado.map((p) => (
                  <li key={p.participanteId}>{p.empresaNome}</li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                disabled={finalizandoMassa}
                onClick={finalizarTodosAntesDeEncerrar}
              >
                {finalizandoMassa ? 'Finalizando…' : 'Finalizar todos antes de encerrar'}
              </Button>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialog(null)} disabled={encerrar.isPending}>
              Voltar
            </Button>
            <Button onClick={() => executar(() => encerrar.mutateAsync())} disabled={encerrar.isPending} autoFocus>
              {encerrar.isPending ? 'Processando…' : 'Encerrar'}
            </Button>
          </div>
        </Dialog>
      )}

      <RepresentantesModal
        cotacaoId={id} status={status}
        open={modalConviteAberto}
        onClose={() => setModalConviteAberto(false)}
        selecionadas={empresasSelecionadas}
        onToggle={(empresaId) => setEmpresasSelecionadas(s => s.includes(empresaId) ? s.filter(x => x !== empresaId) : [...s, empresaId])}
      />
    </PageContainer>
  )
}
