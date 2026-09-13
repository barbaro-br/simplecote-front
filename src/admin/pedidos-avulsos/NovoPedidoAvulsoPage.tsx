import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Plus } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Combobox } from '@/shared/components/ui/combobox'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CabecalhoPagina, SecaoCabecalho, SubFaixa, Superficie } from '@/shared/ui'
import { RouteLoadingFallback } from '@/shared/components/ui/route-loading'
import { ConfirmarDialog } from '@/admin/cotacoes/ConfirmarDialog'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { moeda } from '@/shared/format/formatters'
import { useCondicoesPagamento, useCriarCondicaoPagamento } from '@/admin/condicoes-pagamento/condicoes-pagamento.api'
import { useEmpresas } from '@/admin/empresas/empresas.api'
import { useRepresentantes } from '@/admin/representantes/representantes.api'
import { useCriarPedidoAvulso, useFecharPedidoAvulso, usePedidoAvulso } from './pedidos-avulsos.api'
import type { ItemPedidoAvulso, PedidoAvulso } from './pedidos-avulsos.schema'
import { AdicionarItemPedidoAvulsoModal } from './AdicionarItemPedidoAvulsoModal'
import { EditarItemPedidoAvulsoModal } from './EditarItemPedidoAvulsoModal'

// Tela de montagem de um Pedido avulso (venda fechada por telefone, sem
// Cotação por trás) — rota própria, não modal (design.md - Decisão 1): o
// fluxo dura minutos e um fechamento acidental do modal perderia o progresso.
//
// Persistência antecipada (change persistencia-antecipada-de-pedido-avulso):
// assim que Empresa + condição de pagamento são escolhidos, cria o pedido
// vazio no back e troca a URL de /novo pro id real — antes disso, tudo era
// estado local da página, e um F5 no meio da busca do primeiro item perdia a
// Empresa escolhida e o progresso inteiro, sem nada pra recuperar (achado
// real). Com o id na URL, um F5 recarrega via usePedidoAvulso(id) — a linha
// abaixo é o único componente que serve tanto `/novo` (rotaId indefinido)
// quanto `/:id` (rotaId presente): as duas rotas apontam pra ele.
//
// A adição de item em si (busca → preço/quantidade → confirmar) vive em
// AdicionarItemPedidoAvulsoModal, mesmo esqueleto do AdicionarItemModal de
// Cotação — a lista de sugestões precisa de espaço de sobra pra rolar sem
// brigar com o cabeçalho fixo da tabela de itens logo abaixo dela.
export function NovoPedidoAvulsoPage() {
  const { id: rotaId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // `pedidoOverride`: resultado da mutação mais recente (criar/adicionar/
  // editar/remover/fechar item) — tem prioridade sobre o que a query buscou,
  // pra não esperar um refetch pra refletir a própria ação do usuário. Sem
  // override (ex.: acabou de montar num F5), cai pro que `usePedidoAvulso`
  // trouxe. Derivado direto no render (não copiado via effect) — não tem por
  // que os dois nunca divergirem de propósito.
  const [pedidoOverride, setPedido] = useState<PedidoAvulso | null>(null)
  const pedidoQuery = usePedidoAvulso(rotaId)
  // Ignora o override se ele for de outro pedido (ex.: voltou pra lista e
  // abriu um pedido diferente sem a página remontar) — só vale pro id atual.
  const pedido =
    pedidoOverride && (!rotaId || pedidoOverride.id === rotaId) ? pedidoOverride : (pedidoQuery.data ?? null)

  const pedidoId = pedido?.id
  const fechado = pedido?.status === 'FECHADO'

  const criar = useCriarPedidoAvulso()
  const fechar = useFecharPedidoAvulso(pedidoId ?? '')

  const [confirmandoFechar, setConfirmandoFechar] = useState(false)
  const [modalItemAberto, setModalItemAberto] = useState(false)
  const [itemEmEdicao, setItemEmEdicao] = useState<ItemPedidoAvulso | null>(null)

  // Navegação por teclado nas linhas da tabela (seta cima/baixo move o foco
  // entre linhas, Enter/Espaço abre a edição) — mesma ideia de outras listas
  // navegáveis do painel, adaptada pra `<tr>` em vez de `<button>`.
  const linhaRefs = useRef<(HTMLTableRowElement | null)[]>([])
  function aoTeclarNaLinha(e: React.KeyboardEvent<HTMLTableRowElement>, indice: number, item: ItemPedidoAvulso) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      linhaRefs.current[indice + 1]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      linhaRefs.current[indice - 1]?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setItemEmEdicao(item)
    }
  }

  // Condição de pagamento/prazo de entrega: só dá pra mandar no `POST` que cria
  // o pedido (o back não tem endpoint pra atualizar depois) — por isso só
  // ficam editáveis até o pedido ser criado; a partir daí viram leitura do
  // que já foi salvo (`pedido.condicaoPagamento`/`prazoEntregaEstimado`).
  const { data: condicoesPagamento } = useCondicoesPagamento()
  const criarCondicao = useCriarCondicaoPagamento()
  const [condicaoPagamentoId, setCondicaoPagamentoId] = useState('')
  const [prazoEntregaEstimado, setPrazoEntregaEstimado] = useState('')

  const { data: empresas } = useEmpresas()
  const { data: representantes } = useRepresentantes()
  const [empresaId, setEmpresaId] = useState('')
  const representante = empresaId ? representantes?.find((r) => r.empresaId === empresaId) : null

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    toast.error(e instanceof ApiError ? e.message : 'Não foi possível completar a operação. Tente novamente.')
  }

  // Combobox com criação inline (Combobox - onCriarNova): não digita "ad-hoc"
  // por fora do catálogo — toda condição nova já nasce cadastrada, pra ficar
  // disponível pra próxima cotação/pedido também (é global pra loja inteira).
  function aoCriarCondicaoPagamento(descricao: string) {
    criarCondicao.mutate(
      { descricao },
      {
        onSuccess: (criada) => setCondicaoPagamentoId(criada.id),
        onError: (e) => tratarErro(e),
      },
    )
  }

  // Cria o pedido (vazio) na hora de abrir o modal de item, se ainda não
  // existir — é o "post antes de cair na tela de busca" (achado real: sem
  // isso, um F5 durante a busca do primeiro item perdia tudo).
  async function aoClicarAdicionarItem() {
    if (pedidoId) {
      setModalItemAberto(true)
      return
    }
    if (!empresaId || !condicaoPagamentoId) {
      toast.error('Escolha a Empresa e a condição de pagamento antes de adicionar itens.')
      return
    }
    try {
      const novoPedido = await criar.mutateAsync({
        empresaId,
        condicaoPagamentoId,
        ...(prazoEntregaEstimado.trim() && { prazoEntregaEstimado: prazoEntregaEstimado.trim() }),
      })
      setPedido(novoPedido)
      navigate(`/admin/pedidos-avulsos/${novoPedido.id}`, { replace: true })
      setModalItemAberto(true)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      tratarErro(e)
    }
  }

  async function aoFechar() {
    try {
      const resultado = await fechar.mutateAsync()
      setPedido(resultado)
      setConfirmandoFechar(false)
    } catch (e) {
      setConfirmandoFechar(false)
      tratarErro(e)
    }
  }

  const itens = pedido?.itens ?? []
  const quantidadeItens = pedido?.quantidadeItens ?? itens.length
  const total = pedido?.total ?? 0

  // Recarregando um pedido já criado (F5 com id na URL): evita mostrar o
  // formulário de "escolher Empresa" por um instante antes dos dados chegarem.
  if (rotaId && pedidoQuery.isLoading) {
    return <RouteLoadingFallback />
  }

  if (rotaId && pedidoQuery.isError) {
    return (
      <PageContainer maxWidth="lg" className="space-y-6">
        <CabecalhoPagina titulo="Pedido não encontrado" />
        <Superficie className="p-6 text-center text-sm text-muted-foreground">
          Não foi possível carregar esse pedido — ele pode ter sido removido, ou não pertence à sua loja.
          <div className="pt-4">
            <Link to="/admin/pedidos">
              <Button variant="outline">Voltar pra Pedidos</Button>
            </Link>
          </div>
        </Superficie>
      </PageContainer>
    )
  }

  if (fechado && pedido) {
    return (
      <PageContainer maxWidth="lg" className="space-y-6">
        <CabecalhoPagina titulo="Pedido fechado" />
        <Superficie className="p-6 space-y-3 text-center">
          <p className="text-sm text-muted-foreground">Pedido registrado com sucesso.</p>
          <p className="text-3xl font-semibold tracking-tight">{moeda(total)}</p>
          <p className="text-sm text-muted-foreground">
            {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'} · pedido {pedido.id}
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Link to="/admin">
              <Button variant="outline">Ir para o Dashboard</Button>
            </Link>
            <Link to="/admin/pedidos-avulsos/novo" reloadDocument>
              <Button>Novo pedido</Button>
            </Link>
          </div>
        </Superficie>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full" className="flex h-full min-h-0 flex-col gap-3 py-2">
      <CabecalhoPagina
        titulo="Novo pedido"
        subtitulo="Venda fechada por telefone com um Representante, fora do fluxo de cotação."
        acao={
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft className="size-4 shrink-0" />
            Cancelar
          </Link>
        }
      />

      {/* Cockpit: cabeçalho e rodapé fixos, só a tabela de itens rola por
          dentro — mesmo padrão da grade ao vivo de Cotação
          (GradeAoVivoTabela), pra não repetir o "tranco" de rolagem que essa
          tela tinha com cartões empilhados. */}
      <Superficie className="flex min-h-0 flex-1 flex-col">
        <SecaoCabecalho
          titulo="Itens do pedido"
          acao={
            <>
              <Button
                type="button"
                size="sm"
                onClick={aoClicarAdicionarItem}
                disabled={criar.isPending}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                {criar.isPending ? 'Criando pedido…' : 'Adicionar item'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={itens.length === 0 || fechar.isPending}
                onClick={() => setConfirmandoFechar(true)}
              >
                Fechar pedido
              </Button>
            </>
          }
        />

        {/* Barra de contexto: condição de pagamento/prazo (editável só até o
            pedido ser criado, depois vira leitura do que já foi salvo) — o
            gatilho de adicionar item já mora no cabeçalho acima, junto do
            "Fechar pedido" (achado real: os dois empilhados em linhas
            separadas, os dois botões verdes um em cima do outro, pareciam
            quebrados). */}
        <div className="flex flex-wrap items-end gap-4 border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] px-4 py-3 sm:px-5">
          {pedidoId ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span>
                Empresa: <strong className="text-foreground">{pedido?.empresaNome ?? '—'}</strong>
              </span>
              {pedido?.representanteNome && (
                <span>
                  Representante: <strong className="text-foreground">{pedido.representanteNome}</strong>
                </span>
              )}
              <span>
                Cond. pagamento: <strong className="text-foreground">{pedido?.condicaoPagamento ?? '—'}</strong>
              </span>
              <span>
                Prazo de entrega: <strong className="text-foreground">{pedido?.prazoEntregaEstimado ?? '—'}</strong>
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:min-w-[520px]">
              <div className="space-y-1.5">
                <label htmlFor="empresa" className="text-xs font-medium ui-uppercase text-muted-foreground">
                  Empresa
                </label>
                <Combobox
                  id="empresa"
                  options={(empresas ?? []).map((e) => ({ value: e.id, label: e.nome }))}
                  value={empresaId}
                  onChange={setEmpresaId}
                  placeholder="Selecione..."
                  emptyMessage="Nenhuma empresa encontrada"
                />
                {representante && (
                  <p className="text-[13px] text-muted-foreground truncate">
                    Rep: {representante.nome}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="condicaoPagamento" className="text-xs font-medium ui-uppercase text-muted-foreground">
                  Condição de pagamento
                </label>
                <Combobox
                  id="condicaoPagamento"
                  options={(condicoesPagamento ?? []).map((c) => ({ value: c.id, label: c.descricao }))}
                  value={condicaoPagamentoId}
                  onChange={setCondicaoPagamentoId}
                  onCriarNova={aoCriarCondicaoPagamento}
                  placeholder="Nenhuma"
                  emptyMessage="Nenhuma condição de pagamento cadastrada"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="prazoEntrega" className="text-xs font-medium ui-uppercase text-muted-foreground">
                  Prazo de entrega
                </label>
                <Input
                  id="prazoEntrega"
                  autoComplete="off"
                  value={prazoEntregaEstimado}
                  onChange={(e) => setPrazoEntregaEstimado(e.target.value)}
                  placeholder="Ex: 3 dias úteis"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabela de itens — mesmo padrão visual/estrutural da grade ao vivo
            de Cotação: cabeçalho fixo, só o corpo rola. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
              <colgroup>
                <col />
                <col className="w-40" />
                <col className="w-32" />
                <col className="w-28" />
                <col className="w-32" />
              </colgroup>
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="sticky top-0 z-10 border-b bg-[var(--pnl-superficie,#12263f)] px-4 py-2 font-medium ui-uppercase">
                    Nome item
                  </th>
                  <th className="sticky top-0 z-10 border-b bg-[var(--pnl-superficie,#12263f)] px-2 py-2 text-right font-medium ui-uppercase">
                    Emb./Quant.
                  </th>
                  <th className="sticky top-0 z-10 border-b bg-[var(--pnl-superficie,#12263f)] px-2 py-2 text-right font-medium ui-uppercase">
                    Quant. pedido
                  </th>
                  <th className="sticky top-0 z-10 border-b bg-[var(--pnl-superficie,#12263f)] px-2 py-2 text-right font-medium ui-uppercase">
                    Unitário
                  </th>
                  <th className="sticky top-0 z-10 border-b bg-[var(--pnl-superficie,#12263f)] px-4 py-2 text-right font-medium ui-uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      Nenhum item adicionado ainda.
                    </td>
                  </tr>
                )}
                {itens.map((item, indice) => (
                  <tr
                    key={item.id}
                    ref={(el) => { linhaRefs.current[indice] = el }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Editar item ${item.nomeSnapshot}`}
                    onClick={() => setItemEmEdicao(item)}
                    onKeyDown={(e) => aoTeclarNaLinha(e, indice, item)}
                    className="cursor-pointer outline-none hover:bg-muted/40 focus-visible:bg-primary/10 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/40"
                  >
                    <td className="truncate border-b px-4 py-2 ui-uppercase">{item.nomeSnapshot}</td>
                    <td className="truncate border-b px-2 py-2 text-right text-muted-foreground">
                      {item.unidadeSnapshot} c/ {item.quantidadePorEmbalagemSnapshot}
                    </td>
                    <td className="border-b px-2 py-2 text-right tabular-nums">{item.quantidade}</td>
                    <td className="border-b px-2 py-2 text-right tabular-nums">{moeda(item.precoUnitario)}</td>
                    <td className="border-b px-4 py-2 text-right font-semibold tabular-nums">{moeda(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SubFaixa
          esquerda={`${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'}`}
          direita={<span className="text-base font-semibold text-foreground">{moeda(total)}</span>}
          className="border-b-0 border-t pr-20 sm:pr-24"
        />
      </Superficie>

      {pedidoId && (
        <AdicionarItemPedidoAvulsoModal
          open={modalItemAberto}
          onClose={() => setModalItemAberto(false)}
          pedidoId={pedidoId}
          itens={itens}
          quantidadeItens={quantidadeItens}
          total={total}
          onPedidoAtualizado={setPedido}
        />
      )}

      {pedidoId && (
        <EditarItemPedidoAvulsoModal
          pedidoId={pedidoId}
          item={itemEmEdicao}
          onClose={() => setItemEmEdicao(null)}
          onPedidoAtualizado={setPedido}
        />
      )}

      {confirmandoFechar && (
        <ConfirmarDialog
          titulo="Fechar pedido avulso"
          descricao={`${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'}, total ${moeda(total)}. Depois de fechado, o pedido não aceita mais itens.`}
          rotuloConfirmar="Fechar pedido"
          pendente={fechar.isPending}
          onConfirmar={aoFechar}
          onCancelar={() => setConfirmandoFechar(false)}
        />
      )}
    </PageContainer>
  )
}
