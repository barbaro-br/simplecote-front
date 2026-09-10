import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Warning, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { dataHoraBr, moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import {
  Superficie,
  SecaoCabecalho,
  SubFaixa,
  RodapeAcao,
  CampoEstat,
  Selo,
  type TomSelo,
  BotaoPrimario,
  BotaoFantasma,
} from '@/shared/ui'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ErrorAlert } from '@/shared/components/ui/error-alert'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Breadcrumb } from '@/shared/components/ui/breadcrumb'
import { ItensSection } from './ItensSection'
import { GradeAoVivoTabela } from './GradeAoVivoTabela'
import { AdicionarItemModal } from './AdicionarItemModal'
import { ConfirmarDialog } from './ConfirmarDialog'
import { AbrirCotacaoDialog } from './AbrirCotacaoDialog'
import { RepresentantesModal } from './RepresentantesModal'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import { useEmpresas } from '@/admin/empresas/empresas.api'
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
  useParticipantes,
  useFinalizarParticipante,
  useDesconvidarParticipante,
  usePreviaApuracao
} from './cotacoes.api'

type DialogAberto = 'abrir' | 'apurar' | 'cancelar' | 'encerrar' | null

function GradeAoVivoContainer({ id, status, itens }: { id: string; status: string; itens: ItemCotacao[] }) {
  const { data: grade, isLoading, error } = useGradeAoVivo(id, status)

  const [adicionarItemAberto, setAdicionarItemAberto] = useState(false)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | undefined>(undefined)

  function abrirCadastro() {
    setCadastroAberto(true)
  }

  function abrirEdicao(produto: Produto) {
    setProdutoParaEditar(produto)
    setCadastroAberto(true)
  }

  function aoCadastrarProduto() {
    setCadastroAberto(false)
    setProdutoParaEditar(undefined)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Carregando grade ao vivo…</p>
  if (error) return <p className="text-sm text-destructive p-4">Erro ao carregar grade ao vivo: {error.message}</p>
  if (!grade) return null

  return (
    <div className="border-t border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))] px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--pnl-txt,#fff)]">
          <span className="relative flex size-2 shrink-0">
            {status === 'ABERTA' && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--pnl-acento,#57bf8e)]/70" />
            )}
            <span className="relative inline-flex size-2 rounded-full bg-[var(--pnl-acento,#57bf8e)]" />
          </span>
          Grade de respostas · ao vivo
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            {grade.respondidos} de {grade.totalParticipantes} responderam
          </span>
          {status === 'ABERTA' && (
            <BotaoFantasma onClick={() => setAdicionarItemAberto(true)}>Adicionar item</BotaoFantasma>
          )}
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
  const desconvidar = useDesconvidarParticipante(id)
  const participantes = useParticipantes(id)
  const gradeAoVivo = useGradeAoVivo(id, cotacao?.status)
  const finalizarParticipante = useFinalizarParticipante(id)
  const { data: empresas } = useEmpresas()

  const [dialog, setDialog] = useState<DialogAberto>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [modalConviteAberto, setModalConviteAberto] = useState(false)
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([])
  const [finalizandoMassa, setFinalizandoMassa] = useState(false)

  const previaApuracao = usePreviaApuracao(id, { enabled: dialog === 'apurar' })

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

  const totalParticipantesConvite = (participantes.data ?? []).length
  const convitesEntregues = (participantes.data ?? []).filter(
    (p) => p.conviteStatus === 'ENVIADO',
  ).length

  // Em RASCUNHO os fornecedores ainda não viraram participantes — a seleção
  // vive em `empresasSelecionadas` e o convite só é disparado no "Abrir".
  // Ainda assim mostramos os escolhidos como chips (com × pra tirar) para o
  // Comprador não precisar reabrir o modal só pra lembrar quem marcou.
  const emRascunho = status === 'RASCUNHO'
  const fornecedoresSelecionados = emRascunho
    ? empresasSelecionadas.map((eid) => ({
        id: eid,
        nome: (empresas ?? []).find((e) => e.id === eid)?.nome ?? 'Fornecedor',
      }))
    : []
  const totalFornecedoresExibido = emRascunho
    ? empresasSelecionadas.length
    : totalParticipantesConvite

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

  const totalItens = cotacao.itens.length
  const podeMontar = status === 'RASCUNHO'
  const podeConvidar = status === 'RASCUNHO' || status === 'ABERTA'

  // Economia estimada da disputa: soma, por item, de quanto o menor lance atual
  // ficou abaixo da referência de última compra (× quantidade). Sem referência
  // de última compra, usa o spread entre o maior e o menor lance do item.
  const economiaEstimada = (gradeAoVivo.data?.itens ?? []).reduce((soma, it) => {
    const menor = it.menorPrecoUnitario
    if (menor == null) return soma
    const cotados = it.precos
      .filter((c) => c.status === 'COTADO' && c.precoUnitario != null)
      .map((c) => c.precoUnitario as number)
    const referencia =
      it.ultimoPrecoUnitario != null
        ? it.ultimoPrecoUnitario
        : cotados.length >= 2
          ? Math.max(...cotados)
          : null
    if (referencia == null) return soma
    return soma + Math.max(0, referencia - menor) * it.quantidadeSolicitada
  }, 0)

  const SELO_TOM: Record<string, TomSelo> = {
    RASCUNHO: 'neutro',
    ABERTA: 'info',
    ENCERRADA: 'atencao',
    PEDIDOS_GERADOS: 'sucesso',
    CANCELADA: 'perigo',
  }
  const SELO_LABEL: Record<string, string> = {
    RASCUNHO: 'Rascunho',
    ABERTA: 'Aberta',
    ENCERRADA: 'Encerrada',
    PEDIDOS_GERADOS: 'Pedidos gerados',
    CANCELADA: 'Cancelada',
  }

  return (
    <div data-painel="dark" className="min-h-screen">
      <PageContainer maxWidth="4xl" className="space-y-4 py-6">
        <Breadcrumb
          items={[
            { label: 'Cotações', to: '/admin/cotacoes' },
            { label: cotacao.titulo },
          ]}
        />

        {erroAcao && <ErrorAlert>{erroAcao}</ErrorAlert>}

        <Superficie>
          <SecaoCabecalho
            titulo={cotacao.titulo}
            nivelTitulo={1}
            pulso={status === 'ABERTA'}
            acao={
              <>
                <Selo tom={SELO_TOM[status]}>{SELO_LABEL[status]}</Selo>
                {status !== 'CANCELADA' && (
                  <BotaoFantasma onClick={() => setModalConviteAberto(true)}>
                    Representantes
                  </BotaoFantasma>
                )}
              </>
            }
          />

          <SubFaixa
            esquerda={`${totalItens} ${totalItens === 1 ? 'item' : 'itens'}${
              totalFornecedoresExibido > 0
                ? ` · ${totalFornecedoresExibido} ${totalFornecedoresExibido === 1 ? 'fornecedor' : 'fornecedores'}`
                : ''
            }`}
            direita={cotacao.prazo ? `Prazo: ${dataHoraBr(cotacao.prazo)}` : undefined}
          />

          {(podeConvidar || (participantes.data ?? []).length > 0) && (
            <div className="space-y-2 border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center gap-1.5">
                {fornecedoresSelecionados.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]"
                  >
                    {f.nome}
                    <button
                      type="button"
                      aria-label={`Remover ${f.nome} da cotação`}
                      onClick={() =>
                        setEmpresasSelecionadas((s) => s.filter((x) => x !== f.id))
                      }
                      className="-mr-1 rounded-full p-0.5 text-[var(--pnl-txt-3,rgba(255,255,255,0.45))] hover:text-[var(--pnl-perigo,#ff6b6b)]"
                    >
                      <X className="size-3" weight="bold" aria-hidden />
                    </button>
                  </span>
                ))}
                {(participantes.data ?? []).map((p) => (
                  <span
                    key={p.participanteId}
                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]"
                  >
                    {p.empresaNome}
                    {status === 'ABERTA' && p.conviteStatus !== 'ENVIADO' && (
                      <span title="convite não entregue" className="text-[var(--pnl-atencao,#e0a030)]">
                        !
                      </span>
                    )}
                    {podeConvidar && p.participanteStatus !== 'RESPONDIDO' && (
                      <button
                        type="button"
                        aria-label={`Remover ${p.empresaNome} da cotação`}
                        disabled={desconvidar.isPending}
                        onClick={() =>
                          desconvidar.mutateAsync(p.participanteId).catch((e) => tratarErro(e))
                        }
                        className="-mr-1 rounded-full p-0.5 text-[var(--pnl-txt-3,rgba(255,255,255,0.45))] hover:text-[var(--pnl-perigo,#ff6b6b)]"
                      >
                        <X className="size-3" weight="bold" aria-hidden />
                      </button>
                    )}
                  </span>
                ))}
                {podeConvidar && (
                  <button
                    type="button"
                    onClick={() => setModalConviteAberto(true)}
                    className="rounded-full px-2 py-1 text-[11px] font-medium text-[var(--pnl-acento-hi,#6fe6ac)] hover:underline"
                  >
                    + convidar
                  </button>
                )}
              </div>
              {(status === 'ABERTA' || status === 'ENCERRADA') && totalParticipantesConvite > 0 && (
                <p className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                  {convitesEntregues} de {totalParticipantesConvite}{' '}
                  {totalParticipantesConvite === 1 ? 'convite entregue' : 'convites entregues'}
                  {convitesEntregues < totalParticipantesConvite && (
                    <button
                      type="button"
                      onClick={() => setModalConviteAberto(true)}
                      className="ml-1 text-[var(--pnl-acento-hi,#6fe6ac)] hover:underline"
                    >
                      ver
                    </button>
                  )}
                </p>
              )}
            </div>
          )}

          {status === 'ABERTA' && cotacao.prazoVencido && (
            <div
              role="alert"
              className="flex items-center gap-3 border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-[var(--pnl-atencao,#e0a030)]/10 px-4 py-3 text-sm sm:px-5"
            >
              <Warning className="size-5 shrink-0 text-[var(--pnl-atencao,#e0a030)]" aria-hidden />
              <span className="font-medium text-[var(--pnl-atencao,#e0a030)]">
                Prazo vencido — os representantes não podem mais responder. Encerre para apurar.
              </span>
            </div>
          )}

          {(status === 'RASCUNHO' || status === 'CANCELADA' || status === 'PEDIDOS_GERADOS') && (
            <ItensSection cotacaoId={id} itens={cotacao.itens} editavel={podeMontar} />
          )}
          {(status === 'ABERTA' || status === 'ENCERRADA') && (
            <GradeAoVivoContainer id={id} status={status} itens={cotacao.itens} />
          )}

          <RodapeAcao
            esquerda={
              (status === 'ABERTA' || status === 'ENCERRADA') && economiaEstimada > 0 ? (
                <CampoEstat inline rotulo="Economia estimada até agora" valor={moeda(economiaEstimada)} />
              ) : (
                <CampoEstat
                  inline
                  rotulo={status === 'PEDIDOS_GERADOS' ? 'Cotação apurada' : 'Itens na cotação'}
                  valor={totalItens}
                />
              )
            }
            direita={
              <div className="flex items-center gap-2">
                {(status === 'RASCUNHO' || status === 'ABERTA') && (
                  <BotaoFantasma
                    className="text-[var(--pnl-perigo,#ff6b6b)]"
                    onClick={() => setDialog('cancelar')}
                  >
                    Cancelar
                  </BotaoFantasma>
                )}
                {status === 'ENCERRADA' && (
                  <BotaoFantasma
                    onClick={() => executar(() => reabrir.mutateAsync())}
                    disabled={acaoPendente}
                  >
                    Reabrir
                  </BotaoFantasma>
                )}
                {status === 'RASCUNHO' && (
                  <BotaoPrimario onClick={() => setDialog('abrir')}>Abrir</BotaoPrimario>
                )}
                {status === 'ABERTA' && (
                  <BotaoPrimario onClick={() => setDialog('encerrar')} disabled={acaoPendente}>
                    Encerrar
                  </BotaoPrimario>
                )}
                {status === 'ENCERRADA' && (
                  <BotaoPrimario onClick={() => setDialog('apurar')}>Apurar</BotaoPrimario>
                )}
                {status === 'PEDIDOS_GERADOS' && (
                  <Link
                    to={`/admin/cotacoes/${id}/resultado`}
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--pnl-acento,#57bf8e)] px-3 py-1.5 text-xs font-semibold text-[var(--pnl-superficie,#12263f)] hover:brightness-110"
                  >
                    Ver resultado
                  </Link>
                )}
              </div>
            }
          />
        </Superficie>

      {dialog === 'abrir' && (
        <AbrirCotacaoDialog
          pendente={abrir.isPending || convidar.isPending}
          totalItens={totalItens}
          totalFornecedores={empresasSelecionadas.length}
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
          {previaApuracao.isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          {previaApuracao.error && <ErrorAlert>{previaApuracao.error.message}</ErrorAlert>}
          {previaApuracao.data && (
            <div className="space-y-3 rounded-md border bg-muted/30 p-3 text-sm">
              {previaApuracao.data.pedidos.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Prévia do resultado:</p>
                  {previaApuracao.data.pedidos.map((pedido) => (
                    <div key={pedido.id} className="rounded-md border bg-card p-2">
                      <div className="flex items-center justify-between gap-2 font-medium">
                        <span>{pedido.empresaNome}</span>
                        <span className="shrink-0">{moeda(pedido.total)}</span>
                      </div>
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {pedido.itens.map((item) => (
                          <li key={item.id}>
                            {item.nomeSnapshot} — {item.quantidade} × {moeda(item.precoUnitario)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {previaApuracao.data.itensSemVencedor.length > 0 && (
                <div>
                  <p className="font-medium">Itens sem vencedor:</p>
                  <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                    {previaApuracao.data.itensSemVencedor.map((item) => (
                      <li key={item.id}>{item.nomeSnapshot}</li>
                    ))}
                  </ul>
                </div>
              )}
              {previaApuracao.data.pedidos.length === 0 &&
                previaApuracao.data.itensSemVencedor.length === 0 && (
                  <p className="text-muted-foreground">Nenhum item será apurado.</p>
                )}
            </div>
          )}
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
    </div>
  )
}
