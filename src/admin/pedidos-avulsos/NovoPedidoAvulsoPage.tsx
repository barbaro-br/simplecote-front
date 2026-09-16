import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Check,
  CheckCircle,
  CircleNotch,
  FilePdf,
  Lock,
  MagnifyingGlass,
  Package,
  PaperPlaneTilt,
  Plus,
  QrCode,
  ShoppingCart,
  Sparkle,
  SquaresFour,
  Trash,
  X,
} from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { RouteLoadingFallback } from '@/shared/components/ui/route-loading'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { moeda } from '@/shared/format/formatters'
import { baixarPedidoPdf } from '@/admin/cotacoes/cotacoes.api'
import { useReenviarPedido } from '@/admin/pedidos/pedidos.api'
import {
  useProdutos,
  useSugestoesCadastro,
  useMaisSugestoesDoCatalogoGlobal,
  type SugestaoCatalogoGlobal,
} from '@/admin/produtos/produtos.api'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import type { Produto, ValoresIniciaisProduto } from '@/admin/produtos/produtos.schema'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useExcluirPedidoAvulso, useFecharPedidoAvulso, usePedidoAvulso } from './pedidos-avulsos.api'
import type { ItemPedidoAvulso, PedidoAvulso } from './pedidos-avulsos.schema'
import { AdicionarItemPedidoAvulsoModal } from './AdicionarItemPedidoAvulsoModal'
import { EditarItemPedidoAvulsoModal } from './EditarItemPedidoAvulsoModal'

function normalizar(termo?: string | null): string {
  if (!termo) return ''
  return termo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Tela de montagem de um Pedido avulso (venda fechada por telefone, sem
// Cotação por trás) — rota própria `/admin/pedidos-avulsos/:id`.
//
// O pedido já nasce criado via `ConfigurarPedidoModal` antes de entrar aqui.
// Se acessada sem id (/novo), redireciona para a lista de pedidos.
export function NovoPedidoAvulsoPage() {
  const { id: rotaId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (!rotaId) {
      toast.info('Inicie o pedido pelo botão "Novo pedido avulso"')
      navigate('/admin/pedidos', { replace: true })
    }
  }, [rotaId, navigate])

  const [pedidoOverride, setPedido] = useState<PedidoAvulso | null>(null)
  const pedidoQuery = usePedidoAvulso(rotaId)

  const pedido =
    pedidoOverride && (!rotaId || pedidoOverride.id === rotaId)
      ? pedidoOverride
      : (pedidoQuery.data ?? null)

  const pedidoId = pedido?.id
  const fechado = pedido?.status === 'FECHADO'

  const fechar = useFecharPedidoAvulso(pedidoId ?? '')
  const excluirPedidoMutation = useExcluirPedidoAvulso()
  const reenviar = useReenviarPedido()
  const { data: produtos } = useProdutos()

  const [confirmandoFechar, setConfirmandoFechar] = useState(false)
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false)
  const [modalItemAberto, setModalItemAberto] = useState(false)
  const [produtoInicialModal, setProdutoInicialModal] = useState<Produto | null>(null)
  const [itemEmEdicao, setItemEmEdicao] = useState<ItemPedidoAvulso | null>(null)
  const [baixandoPdf, setBaixandoPdf] = useState(false)

  // Estados da Multi-busca inteligente (Spotlight + Bipagem)
  const [termoBusca, setTermoBusca] = useState('')
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [modalCatalogoAberto, setModalCatalogoAberto] = useState(false)
  const [buscaCatalogo, setBuscaCatalogo] = useState('')
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)
  const [prefillCadastro, setPrefillCadastro] = useState<ValoresIniciaisProduto | undefined>(undefined)

  const buscaRef = useRef<HTMLDivElement>(null)
  const inputBuscaRef = useRef<HTMLInputElement>(null)

  const termoDebounced = useDebounce(termoBusca, 300)
  const sugestoes = useSugestoesCadastro(termoDebounced)

  const itens = pedido?.itens ?? []
  const quantidadeItens = pedido?.quantidadeItens ?? itens.length
  const total = pedido?.total ?? 0
  const produtosNoPedido = useMemo(() => new Set(itens.map((i) => i.produtoId)), [itens])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (buscaRef.current && !buscaRef.current.contains(e.target as Node)) {
        setDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  const produtosDoTenant = useMemo(() => {
    return (produtos ?? []).filter((p) => p.ativo !== false)
  }, [produtos])

  const mapaProdutosPorId = useMemo(() => {
    const mapa = new Map<string, Produto>()
    for (const p of produtos ?? []) {
      mapa.set(p.id, p)
    }
    return mapa
  }, [produtos])

  // Filtragem de produtos locais e globais para a busca rápida (tolerante a acentos e cedilhas)
  const produtosLocaisFiltrados = useMemo(() => {
    const s = normalizar(termoBusca)
    if (!s) {
      // Quando não há termo digitado, exibe os produtos cadastrados que ainda não estão no pedido, por ordem alfabética
      return produtosDoTenant
        .filter((p) => !produtosNoPedido.has(p.id))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    }
    return produtosDoTenant.filter(
      (p) =>
        normalizar(p.nome).includes(s) ||
        (p.codigoBarras ? normalizar(p.codigoBarras).includes(s) : false),
    )
  }, [produtosDoTenant, termoBusca, produtosNoPedido])

  const doProprioCatalogo = useMemo(() => {
    const mapa = new Map<string, Produto>()
    for (const p of produtosLocaisFiltrados) mapa.set(p.id, p)
    for (const p of sugestoes.data?.doProprioCatalogo ?? []) mapa.set(p.id, p)
    return Array.from(mapa.values())
  }, [produtosLocaisFiltrados, sugestoes.data?.doProprioCatalogo])

  const maisSugestoes = useMaisSugestoesDoCatalogoGlobal()
  const [paginasExtras, setPaginasExtras] = useState<SugestaoCatalogoGlobal[]>([])
  const [proximaPagina, setProximaPagina] = useState(1)
  const [acabouGlobal, setAcabouGlobal] = useState(false)

  useEffect(() => {
    setPaginasExtras([])
    setProximaPagina(1)
    setAcabouGlobal(false)
  }, [termoDebounced])

  function carregarMaisGlobal() {
    if (acabouGlobal || maisSugestoes.isPending || termoDebounced.trim().length < 2) return
    maisSugestoes.mutate(
      { q: termoDebounced.trim(), pagina: proximaPagina },
      {
        onSuccess: (pagina) => {
          setPaginasExtras((atual) => [...atual, ...pagina])
          setProximaPagina((p) => p + 1)
          if (pagina.length < 30) {
            setAcabouGlobal(true)
          }
        },
      },
    )
  }

  function aoRolarDropdown(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
      carregarMaisGlobal()
    }
  }

  const paginaZeroGlobal = sugestoes.data?.doCatalogoGlobal ?? []
  const doCatalogoGlobal = useMemo(() => {
    const gtinsLocais = new Set<string>()
    for (const p of produtos ?? []) {
      if (p.codigoBarras) gtinsLocais.add(p.codigoBarras)
    }
    return [...paginaZeroGlobal, ...paginasExtras].filter(
      (g) => !gtinsLocais.has(g.codigoBarras),
    )
  }, [produtos, paginaZeroGlobal, paginasExtras])

  const totalNavegavel = doProprioCatalogo.length + doCatalogoGlobal.length
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const indiceAtivoClamped = totalNavegavel === 0 ? 0 : Math.min(indiceAtivo, totalNavegavel - 1)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const itemAtivoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = dropdownRef.current
    const item = itemAtivoRef.current
    if (!container || !item || !container.getBoundingClientRect) return
    const containerRect = container.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const itemTopo = itemRect.top - containerRect.top + container.scrollTop
    const itemBase = itemTopo + itemRect.height
    const FOLGA = 8
    if (itemTopo < container.scrollTop) {
      container.scrollTop = Math.max(0, itemTopo - FOLGA)
    } else if (itemBase > container.scrollTop + container.clientHeight) {
      container.scrollTop = itemBase - container.clientHeight + FOLGA
    }
  }, [indiceAtivoClamped])

  function abrirInclusaoProduto(produto: Produto) {
    setProdutoInicialModal(produto)
    setDropdownAberto(false)
    setTermoBusca('')
    setIndiceAtivo(0)
    setModalItemAberto(true)
  }

  function abrirCadastroNovo(termoInicial = '') {
    setPrefillCadastro(termoInicial ? { nome: termoInicial.trim().toUpperCase(), codigoBarras: '' } : undefined)
    setDropdownAberto(false)
    setModalCadastroAberto(true)
  }

  function aoSalvarNovoProduto(criado?: Produto) {
    setModalCadastroAberto(false)
    setPrefillCadastro(undefined)
    if (criado) {
      abrirInclusaoProduto(criado)
    }
  }

  function abrirCadastroDeGlobal(g: SugestaoCatalogoGlobal) {
    setPrefillCadastro({ nome: g.nome, codigoBarras: g.codigoBarras })
    setDropdownAberto(false)
    setModalCadastroAberto(true)
  }

  function tratarTeclasBusca(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!dropdownAberto) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setDropdownAberto(true)
        return
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceAtivo(Math.min(indiceAtivoClamped + 1, totalNavegavel - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceAtivo(Math.max(indiceAtivoClamped - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const gtin = termoBusca.trim()
      const exato = produtos?.find((p) => p.codigoBarras === gtin)
      if (exato) {
        abrirInclusaoProduto(exato)
        return
      }
      if (totalNavegavel > 0) {
        if (indiceAtivoClamped < doProprioCatalogo.length) {
          abrirInclusaoProduto(doProprioCatalogo[indiceAtivoClamped])
        } else {
          const g = doCatalogoGlobal[indiceAtivoClamped - doProprioCatalogo.length]
          if (g) abrirCadastroDeGlobal(g)
        }
      } else if (termoBusca.trim()) {
        abrirCadastroNovo(termoBusca)
      }
    } else if (e.key === 'Escape') {
      setDropdownAberto(false)
    }
  }

  const linhaRefs = useRef<(HTMLTableRowElement | null)[]>([])
  function aoTeclarNaLinha(
    e: React.KeyboardEvent<HTMLTableRowElement>,
    indice: number,
    item: ItemPedidoAvulso,
  ) {
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

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    toast.error(
      e instanceof ApiError
        ? e.message
        : 'Não foi possível completar a operação. Tente novamente.',
    )
  }

  function aoClicarAdicionarItem() {
    if (pedidoId) {
      setProdutoInicialModal(null)
      setModalItemAberto(true)
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

  async function aoExcluirPedido() {
    if (!pedidoId) return
    try {
      await excluirPedidoMutation.mutateAsync(pedidoId)
      toast.success('Pedido avulso excluído com sucesso.')
      navigate('/admin/pedidos')
    } catch (e) {
      setConfirmandoExcluir(false)
      tratarErro(e)
    }
  }

  async function aoBaixarPdf() {
    if (!pedidoId) return
    setBaixandoPdf(true)
    try {
      await baixarPedidoPdf(pedidoId)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      tratarErro(e)
    } finally {
      setBaixandoPdf(false)
    }
  }

  async function aoReenviarEmail() {
    if (!pedidoId) return
    try {
      await reenviar.mutateAsync(pedidoId)
      toast.success(
        `Pedido reenviado para ${pedido?.empresaNome ?? 'o fornecedor'} com sucesso!`,
      )
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      tratarErro(e)
    }
  }

  if (!rotaId) {
    return <RouteLoadingFallback />
  }

  if (pedidoQuery.isLoading) {
    return <RouteLoadingFallback />
  }

  if (pedidoQuery.isError) {
    return (
      <PageContainer maxWidth="lg" className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-none bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShoppingCart className="size-4" weight="bold" />
          </div>
          <h1 className="text-lg font-bold text-on-surface">Pedido não encontrado</h1>
        </div>
        <div className="p-6 text-center text-sm text-on-surface-variant bg-[#111813]/60 border border-white/10 rounded-none">
          Não foi possível carregar esse pedido — ele pode ter sido removido, ou não pertence à sua loja.
          <div className="pt-4">
            <Link to="/admin/pedidos">
              <Button variant="outline" className="rounded-none">Voltar pra Pedidos</Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (fechado && pedido) {
    return (
      <PageContainer maxWidth="full" className="flex h-full min-h-0 flex-col gap-3 py-2 text-on-surface">
        {/* Header do Pedido Fechado com Ações */}
        <div className="shrink-0 flex items-center justify-between gap-4 border-b border-white/10 pb-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 rounded-none bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle className="size-4" weight="bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-on-surface tracking-wide truncate">
                  Pedido fechado
                </h1>
                <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  FECHADO
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-mono truncate">
                {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'} · pedido {pedido.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={aoBaixarPdf}
              disabled={baixandoPdf}
              className="rounded-none gap-1.5 h-8 px-3 text-xs font-mono font-bold uppercase border-white/15 bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              {baixandoPdf ? (
                <CircleNotch className="size-3.5 animate-spin text-rose-400" />
              ) : (
                <FilePdf className="size-3.5 text-rose-400" weight="bold" />
              )}
              {baixandoPdf ? 'Baixando…' : 'Baixar PDF'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={aoReenviarEmail}
              disabled={reenviar.isPending}
              className="rounded-none gap-1.5 h-8 px-3 text-xs font-mono font-bold uppercase border-white/15 bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              {reenviar.isPending ? (
                <CircleNotch className="size-3.5 animate-spin text-primary" />
              ) : (
                <PaperPlaneTilt className="size-3.5 text-primary" weight="bold" />
              )}
              {reenviar.isPending ? 'Enviando…' : 'Reenviar e-mail'}
            </Button>

            <button
              type="button"
              onClick={() => setConfirmandoExcluir(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 px-3 h-8 rounded-none transition-colors cursor-pointer"
            >
              <Trash className="size-3.5" weight="bold" />
              Excluir
            </button>

            <Link
              to="/admin/pedidos"
              className="inline-flex items-center gap-1.5 text-xs font-mono px-3 h-8 text-on-surface-variant hover:text-on-surface border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5 shrink-0" weight="bold" />
              Voltar para Pedidos
            </Link>
          </div>
        </div>

        {/* Planilha Completa do Pedido em Modo Somente-Leitura */}
        <div className="flex min-h-0 flex-1 flex-col bg-[#111813]/60 border border-white/10 rounded-none overflow-hidden">
          {/* Barra superior de resumo da grade */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-[#141e17]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Espelho do Pedido ({quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <Check className="size-3.5" weight="bold" /> Pedido consolidado
              </span>
            </div>
          </div>

          {/* Barra de contexto comercial */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/10 px-4 py-2.5 bg-black/20 text-xs text-on-surface-variant font-mono">
            <span>
              Empresa: <strong className="text-on-surface font-semibold">{pedido.empresaNome ?? '—'}</strong>
            </span>
            {pedido.representanteNome && (
              <span>
                Representante: <strong className="text-on-surface font-semibold">{pedido.representanteNome}</strong>
              </span>
            )}
            <span>
              Cond. pagamento: <strong className="text-on-surface font-semibold">{pedido.condicaoPagamento ?? '—'}</strong>
            </span>
            <span>
              Prazo de entrega: <strong className="text-on-surface font-semibold">{pedido.prazoEntregaEstimado ?? '—'}</strong>
            </span>
          </div>

          {/* Tabela de itens estilo planilha */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <table className="w-full table-fixed border-separate border-spacing-0 text-xs text-on-surface">
                <colgroup>
                  <col />
                  <col className="w-36" />
                  <col className="w-36" />
                  <col className="w-28" />
                  <col className="w-28" />
                  <col className="w-32" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-[#17221b] text-on-surface text-xs font-bold uppercase tracking-wider select-none shadow-sm">
                  <tr>
                    <th className="border-b border-white/10 px-4 py-2.5 font-bold text-left">
                      Nome item
                    </th>
                    <th className="border-b border-white/10 px-2 py-2.5 text-left font-bold">
                      Cód. Barras
                    </th>
                    <th className="border-b border-white/10 px-2 py-2.5 text-right font-bold">
                      Emb./Quant.
                    </th>
                    <th className="border-b border-white/10 px-2 py-2.5 text-right font-bold">
                      Quant. pedido
                    </th>
                    <th className="border-b border-white/10 px-2 py-2.5 text-right font-bold">
                      Unitário
                    </th>
                    <th className="border-b border-white/10 px-4 py-2.5 text-right font-bold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {itens.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="truncate border-b border-white/5 px-4 py-2.5 uppercase font-medium">
                        {item.nomeSnapshot}
                      </td>
                      <td className="truncate border-b border-white/5 px-2 py-2.5 text-left font-mono text-[11px] text-on-surface-variant">
                        {mapaProdutosPorId.get(item.produtoId)?.codigoBarras || '—'}
                      </td>
                      <td className="truncate border-b border-white/5 px-2 py-2.5 text-right text-on-surface-variant font-mono">
                        {item.unidadeSnapshot} c/ {item.quantidadePorEmbalagemSnapshot}
                      </td>
                      <td className="border-b border-white/5 px-2 py-2.5 text-right font-mono">
                        {item.quantidade}
                      </td>
                      <td className="border-b border-white/5 px-2 py-2.5 text-right font-mono text-on-surface-variant">
                        {moeda(item.precoUnitario)}
                      </td>
                      <td className="border-b border-white/5 px-4 py-2.5 text-right font-mono font-bold text-primary">
                        {moeda(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rodapé resumo */}
          <div className="flex items-center justify-between border-t border-white/10 bg-[#141e17] px-4 py-2.5 text-xs text-on-surface font-mono">
            <span className="text-on-surface-variant">
              Total consolidado: {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'}
            </span>
            <span className="text-base font-bold font-mono text-primary">
              {moeda(total)}
            </span>
          </div>
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {confirmandoExcluir && (
          <Dialog
            open
            onClose={() => setConfirmandoExcluir(false)}
            size="md"
            ariaLabel="Excluir pedido avulso"
            className="p-0 rounded-none border border-rose-500/30 bg-[#0d1410] shadow-2xl max-w-md text-on-surface overflow-hidden"
          >
            <div className="flex flex-col bg-[#0d1410]">
              <div className="flex items-center gap-3 border-b border-rose-500/20 px-5 py-4 bg-rose-500/10">
                <div className="flex size-8 items-center justify-center bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-none">
                  <Trash className="size-4" weight="bold" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Excluir pedido avulso
                  </span>
                  <div className="text-[11px] font-mono text-on-surface-variant">
                    Esta ação não pode ser desfeita
                  </div>
                </div>
              </div>
              <div className="p-5 text-xs font-mono text-on-surface-variant space-y-2">
                <p>
                  Tem certeza que deseja excluir este pedido avulso? Todos os dados e itens deste pedido serão descartados.
                </p>
              </div>
              <div className="flex justify-end gap-2 border-t border-white/10 bg-[#141e17] p-3 px-5">
                <Button
                  variant="outline"
                  onClick={() => setConfirmandoExcluir(false)}
                  disabled={excluirPedidoMutation.isPending}
                  className="rounded-none border border-white/15 bg-white/5 text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={aoExcluirPedido}
                  disabled={excluirPedidoMutation.isPending}
                  className="rounded-none bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer"
                >
                  {excluirPedidoMutation.isPending ? 'Excluindo…' : 'Sim, excluir pedido'}
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full" className="flex h-full min-h-0 flex-col gap-3 py-2 text-on-surface">
      {/* Header Brutalista */}
      <div className="shrink-0 flex items-center justify-between gap-4 border-b border-white/10 pb-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8 rounded-none bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShoppingCart className="size-4" weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-on-surface tracking-wide truncate">
                Montagem de Pedido
              </h1>
            </div>
            <p className="text-xs text-on-surface-variant truncate">
              Venda direta com o fornecedor, com fechamento e envio imediato.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {pedido?.status === 'ABERTO' && (
            <button
              type="button"
              onClick={() => setConfirmandoExcluir(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 px-3 h-8 rounded-none transition-colors cursor-pointer"
            >
              <Trash className="size-3.5" weight="bold" />
              Excluir pedido
            </button>
          )}

          <Link
            to="/admin/pedidos"
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 h-8 text-on-surface-variant hover:text-on-surface border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5 shrink-0" weight="bold" />
            Voltar para Pedidos
          </Link>
        </div>
      </div>

      {/* 🔍 BARRA DE MULTI-BUSCA INTELIGENTE (Spotlight + Bipagem + Catálogo + Novo Produto) */}
      <div
        ref={buscaRef}
        className="shrink-0 rounded-none border border-white/15 bg-[#0d1410] p-3 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center relative z-20"
      >
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <MagnifyingGlass className="absolute left-3 text-primary size-4 pointer-events-none" weight="bold" />
            <input
              ref={inputBuscaRef}
              value={termoBusca}
              onChange={(e) => {
                setTermoBusca(e.target.value)
                setDropdownAberto(true)
              }}
              onFocus={() => setDropdownAberto(true)}
              onClick={() => setDropdownAberto(true)}
              onKeyDown={tratarTeclasBusca}
              placeholder="🔍 Digite o nome (ex: açúcar, leite, arroz), código de barras ou bipe com o leitor…"
              className="w-full bg-[#16201a] text-on-surface placeholder:text-on-surface-variant/50 text-xs font-mono rounded-none pl-10 pr-28 py-2.5 border border-white/15 focus:border-primary focus:outline-none transition-all h-10"
            />
            {termoBusca && (
              <button
                type="button"
                onClick={() => {
                  setTermoBusca('')
                  inputBuscaRef.current?.focus()
                }}
                className="absolute right-24 text-on-surface-variant hover:text-on-surface p-1 rounded-none transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
            <div className="absolute right-2.5 flex items-center gap-1 text-[10px] font-mono text-on-surface-variant/80 bg-white/5 px-2 py-1 rounded-none border border-white/10 pointer-events-none">
              <QrCode className="size-3" weight="bold" />
              <span>Bip / Enter</span>
            </div>
          </div>

          {/* 📋 MENU FLUTUANTE COM SCROLL DE SUGESTÕES ESTILO PLANILHA */}
          {dropdownAberto && (
            <div
              ref={dropdownRef}
              onScroll={aoRolarDropdown}
              className="absolute left-0 right-0 z-[150] mt-1 max-h-[min(65vh,520px)] overflow-y-auto rounded-none bg-[#0d1410] border border-white/20 shadow-2xl divide-y divide-white/10 font-mono text-xs"
            >
              {totalNavegavel === 0 ? (
                produtos?.length === 0 && !termoBusca.trim() ? (
                  <div className="p-6 text-center text-on-surface-variant flex flex-col items-center gap-3">
                    <Package className="size-8 opacity-40 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">Nenhum produto cadastrado no catálogo</p>
                      <p className="text-[11px] text-on-surface-variant/70 mt-0.5">Cadastre seu primeiro produto para iniciar o pedido.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => abrirCadastroNovo('')}
                      className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-wider rounded-none shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer font-mono"
                    >
                      <Plus className="size-3.5" weight="bold" />
                      Cadastrar primeiro produto
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-on-surface-variant flex flex-col items-center gap-3">
                    <Package className="size-8 opacity-40 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">
                        Nenhum produto encontrado com "{termoBusca}"
                      </p>
                      <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                        Não encontramos no catálogo local nem na base global.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => abrirCadastroNovo(termoBusca)}
                      className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-wider rounded-none shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer font-mono"
                    >
                      <Plus className="size-3.5" weight="bold" />
                      Cadastrar novo produto: "{termoBusca.toUpperCase()}"
                    </button>
                  </div>
                )
              ) : (
                <>
                  {/* Cabeçalho informativo contábil */}
                  <div className="p-2 px-4 bg-[#141e17] flex items-center justify-between border-b border-white/10 text-[10px] uppercase tracking-wider text-on-surface-variant">
                    <span className="font-bold text-primary">
                      {termoBusca.trim() ? `Produtos encontrados (${totalNavegavel})` : `Catálogo da loja (${doProprioCatalogo.length})`}
                    </span>
                    <span className="text-on-surface-variant/70">Navegue com ↑/↓ e selecione com Enter</span>
                  </div>

                  {/* Seção 1: Do Catálogo Local */}
                  {doProprioCatalogo.map((item, i) => {
                    const jaNoPedido = produtosNoPedido.has(item.id)
                    const ativo = i === indiceAtivoClamped
                    return (
                      <div
                        key={item.id}
                        ref={ativo ? itemAtivoRef : undefined}
                        onClick={() => abrirInclusaoProduto(item)}
                        onMouseEnter={() => setIndiceAtivo(i)}
                        className={`p-3 px-4 flex items-center justify-between gap-4 cursor-pointer transition-colors rounded-none border-l-2 ${
                          ativo
                            ? 'bg-[#1a251f] border-l-primary text-on-surface'
                            : 'border-l-transparent hover:bg-white/5 text-on-surface'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-on-surface truncate uppercase">
                              {item.nome}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mt-0.5 font-mono">
                            {item.codigoBarras && (
                              <span className="bg-white/5 border border-white/10 px-1 py-0.2 rounded-none text-[10px]">
                                GTIN: {item.codigoBarras}
                              </span>
                            )}
                            <span className="text-primary font-semibold">
                              Embalagem: {item.unidade}{item.quantidadePorEmbalagem > 1 ? ` c/ ${item.quantidadePorEmbalagem}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 font-mono">
                          {jaNoPedido ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30">
                              <Check className="size-3" weight="bold" />
                              Já no pedido
                            </span>
                          ) : (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-none border flex items-center gap-1 ${
                              ativo
                                ? 'bg-primary text-black border-primary'
                                : 'text-primary bg-primary/10 border-primary/20'
                            }`}>
                              <Plus className="size-3" weight="bold" />
                              Selecionar
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Seção 2: Do Catálogo Global */}
                  {doCatalogoGlobal.map((g, gi) => {
                    const idx = doProprioCatalogo.length + gi
                    const ativo = idx === indiceAtivoClamped
                    return (
                      <div
                        key={g.codigoBarras}
                        ref={ativo ? itemAtivoRef : undefined}
                        onClick={() => abrirCadastroDeGlobal(g)}
                        onMouseEnter={() => setIndiceAtivo(idx)}
                        className={`p-3 px-4 flex items-center justify-between gap-4 cursor-pointer transition-colors rounded-none bg-black/20 border-l-2 ${
                          ativo
                            ? 'bg-[#1a251f] border-l-tertiary text-on-surface'
                            : 'border-l-transparent hover:bg-white/5 text-on-surface'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-on-surface truncate uppercase">
                              {g.nome}
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-none text-[9px] font-mono font-bold bg-tertiary/20 text-tertiary border border-tertiary/30">
                              <Sparkle className="size-2.5" weight="fill" />
                              Catálogo Global
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mt-0.5 font-mono">
                            <span className="bg-white/5 border border-white/10 px-1 py-0.2 rounded-none text-[10px]">
                              GTIN: {g.codigoBarras}
                            </span>
                            {g.marca && <span>· Marca: {g.marca}</span>}
                          </div>
                        </div>

                        <div className="shrink-0 font-mono">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-none border flex items-center gap-1 ${
                            ativo
                              ? 'bg-tertiary text-black border-tertiary'
                              : 'text-tertiary bg-tertiary/10 border-tertiary/20'
                          }`}>
                            Cadastrar e Usar →
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {maisSugestoes.isPending && (
                    <div className="p-2.5 text-center text-xs font-mono text-primary flex items-center justify-center gap-2 bg-black/30">
                      <CircleNotch className="size-3.5 animate-spin" />
                      Carregando mais produtos da base global…
                    </div>
                  )}

                  {/* Rodapé da busca rápida */}
                  <div className="p-2.5 px-4 bg-[#141e17] border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-on-surface-variant">
                      Não encontrou o que procura?
                    </span>
                    <button
                      type="button"
                      onClick={() => abrirCadastroNovo(termoBusca)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-none text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="size-3" weight="bold" />
                      Cadastrar novo produto
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 🎛️ Cockpit de Ações Unificado no Card Superior */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={aoClicarAdicionarItem}
            className="gap-1.5 rounded-none h-10 px-3.5 font-mono font-bold uppercase tracking-wider"
          >
            <Plus className="size-4" weight="bold" />
            Adicionar item
          </Button>

          <button
            type="button"
            onClick={() => abrirCadastroNovo('')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-none bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0 h-10 font-mono"
          >
            <Plus className="size-3.5" weight="bold" />
            Novo produto
          </button>

          <button
            type="button"
            onClick={() => setModalCatalogoAberto(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-none bg-white/5 hover:bg-white/10 border border-white/15 text-on-surface font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0 h-10 font-mono"
          >
            <SquaresFour className="size-3.5" weight="bold" />
            Catálogo ({produtos?.length ?? 0})
          </button>

          <Button
            variant="outline"
            size="sm"
            disabled={itens.length === 0 || fechar.isPending}
            onClick={() => setConfirmandoFechar(true)}
            className="gap-1.5 rounded-none h-10 px-4 border-primary/40 text-primary hover:bg-primary/10 font-mono font-bold uppercase tracking-wider disabled:border-white/10 disabled:text-on-surface-variant/40"
          >
            <Check className="size-4" weight="bold" />
            Fechar pedido
          </Button>
        </div>
      </div>

      {/* Cockpit brutalista estilo planilha */}
      <div className="flex min-h-0 flex-1 flex-col bg-[#111813]/60 border border-white/10 rounded-none overflow-hidden">
        {/* Barra superior de resumo da grade */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-[#141e17]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Itens do pedido ({quantidadeItens})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-on-surface-variant">
              {itens.length === 0
                ? 'Busque o produto acima para adicionar à grade'
                : `${itens.length} ${itens.length === 1 ? 'item adicionado' : 'itens adicionados'}`}
            </span>
          </div>
        </div>

        {/* Barra de contexto: Somente leitura (empresa, representante, condição, prazo) */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/10 px-4 py-2.5 bg-black/20 text-xs text-on-surface-variant font-mono">
          <span>
            Empresa: <strong className="text-on-surface font-semibold">{pedido?.empresaNome ?? '—'}</strong>
          </span>
          {pedido?.representanteNome && (
            <span>
              Representante: <strong className="text-on-surface font-semibold">{pedido.representanteNome}</strong>
            </span>
          )}
          <span>
            Cond. pagamento: <strong className="text-on-surface font-semibold">{pedido?.condicaoPagamento ?? '—'}</strong>
          </span>
          <span>
            Prazo de entrega: <strong className="text-on-surface font-semibold">{pedido?.prazoEntregaEstimado ?? '—'}</strong>
          </span>
        </div>

        {/* Tabela de itens estilo planilha */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <table className="w-full table-fixed border-separate border-spacing-0 text-xs text-on-surface">
              <colgroup>
                <col />
                <col className="w-36" />
                <col className="w-36" />
                <col className="w-28" />
                <col className="w-28" />
                <col className="w-32" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-[#17221b] text-on-surface text-xs font-bold uppercase tracking-wider select-none shadow-sm">
                <tr>
                  <th className="border-b border-white/10 px-4 py-2.5 font-bold text-left">
                    Nome item
                  </th>
                  <th className="border-b border-white/10 px-2 py-2.5 text-left font-bold">
                    Cód. Barras
                  </th>
                  <th className="border-b border-white/10 px-2 py-2.5 text-right font-bold">
                    Emb./Quant.
                  </th>
                  <th className="border-b border-white/10 px-2 py-2.5 text-right font-bold">
                    Quant. pedido
                  </th>
                  <th className="border-b border-white/10 px-2 py-2.5 text-right font-bold">
                    Unitário
                  </th>
                  <th className="border-b border-white/10 px-4 py-2.5 text-right font-bold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {itens.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-on-surface-variant italic font-mono">
                      Nenhum item adicionado ainda.
                    </td>
                  </tr>
                )}
                {itens.map((item, indice) => (
                  <tr
                    key={item.id}
                    ref={(el) => {
                      linhaRefs.current[indice] = el
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Editar item ${item.nomeSnapshot}`}
                    onClick={() => setItemEmEdicao(item)}
                    onKeyDown={(e) => aoTeclarNaLinha(e, indice, item)}
                    className="cursor-pointer outline-none hover:bg-white/[0.04] focus-visible:bg-primary/10 transition-colors"
                  >
                    <td className="truncate border-b border-white/5 px-4 py-2 uppercase font-medium">
                      {item.nomeSnapshot}
                    </td>
                    <td className="truncate border-b border-white/5 px-2 py-2 text-left font-mono text-[11px] text-on-surface-variant">
                      {mapaProdutosPorId.get(item.produtoId)?.codigoBarras || '—'}
                    </td>
                    <td className="truncate border-b border-white/5 px-2 py-2 text-right text-on-surface-variant font-mono">
                      {item.unidadeSnapshot} c/ {item.quantidadePorEmbalagemSnapshot}
                    </td>
                    <td className="border-b border-white/5 px-2 py-2 text-right font-mono">
                      {item.quantidade}
                    </td>
                    <td className="border-b border-white/5 px-2 py-2 text-right font-mono text-on-surface-variant">
                      {moeda(item.precoUnitario)}
                    </td>
                    <td className="border-b border-white/5 px-4 py-2 text-right font-mono font-bold text-primary">
                      {moeda(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rodapé resumo */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#141e17] px-4 py-2.5 text-xs text-on-surface font-mono">
          <span className="text-on-surface-variant">
            {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'}
          </span>
          <span className="text-sm font-bold font-mono text-primary">
            {moeda(total)}
          </span>
        </div>
      </div>

      {/* Modal de Adicionar Item ao Pedido */}
      {pedidoId && (
        <AdicionarItemPedidoAvulsoModal
          open={modalItemAberto}
          onClose={() => {
            setModalItemAberto(false)
            setProdutoInicialModal(null)
          }}
          pedidoId={pedidoId}
          itens={itens}
          quantidadeItens={quantidadeItens}
          total={total}
          onPedidoAtualizado={setPedido}
          produtoInicial={produtoInicialModal}
        />
      )}

      {/* Modal de Editar Item Existente */}
      {pedidoId && (
        <EditarItemPedidoAvulsoModal
          pedidoId={pedidoId}
          item={itemEmEdicao}
          onClose={() => setItemEmEdicao(null)}
          onPedidoAtualizado={setPedido}
        />
      )}

      {/* Modal de Confirmação de Fechamento com Conferência de Itens */}
      {confirmandoFechar && (
        <Dialog
          open
          onClose={() => setConfirmandoFechar(false)}
          size="lg"
          ariaLabel="Conferir e fechar pedido avulso"
          className="p-0 rounded-none border border-white/15 bg-[#0d1410] shadow-2xl max-w-2xl text-on-surface overflow-hidden"
        >
          <div className="flex flex-col max-h-[85vh] bg-[#0d1410]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-[#141e17] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center bg-primary/15 border border-primary/30 text-primary rounded-none shadow-[0_0_12px_rgba(78,222,163,0.2)]">
                  <Lock className="size-4" weight="bold" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                    Conferência e Fechamento do Pedido
                  </span>
                  <div className="text-[11px] font-mono text-on-surface-variant">
                    {pedido?.empresaNome ?? 'Fornecedor'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                {quantidadeItens} {quantidadeItens === 1 ? 'ITEM' : 'ITENS'}
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono overflow-y-auto flex-1">
              {/* Resumo Comercial */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 rounded-none border border-white/10 bg-[#121914] p-3 text-[11px]">
                <div>
                  <span className="text-on-surface-variant block text-[10px] uppercase">Fornecedor</span>
                  <span className="font-bold text-on-surface truncate block">{pedido?.empresaNome ?? '—'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[10px] uppercase">Condição de pagamento</span>
                  <span className="font-bold text-on-surface truncate block">{pedido?.condicaoPagamento ?? '—'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[10px] uppercase">Prazo de entrega</span>
                  <span className="font-bold text-on-surface truncate block">{pedido?.prazoEntregaEstimado ?? '—'}</span>
                </div>
              </div>

              {/* Tabela de Conferência dos Itens */}
              <div className="rounded-none border border-white/10 overflow-hidden">
                <div className="bg-[#17221b] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-primary border-b border-white/10">
                  Itens a serem faturados ({itens.length})
                </div>
                <div className="max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#131b15] text-[10px] font-mono uppercase text-on-surface-variant border-b border-white/5 sticky top-0">
                      <tr>
                        <th className="p-2 pl-3">Item</th>
                        <th className="p-2 text-right">Emb.</th>
                        <th className="p-2 text-right">Qtd</th>
                        <th className="p-2 text-right">Unitário</th>
                        <th className="p-2 pr-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {itens.map((i) => (
                        <tr key={i.id} className="hover:bg-white/[0.02]">
                          <td className="p-2 pl-3 truncate max-w-[200px] uppercase font-sans font-medium text-on-surface">
                            {i.nomeSnapshot}
                          </td>
                          <td className="p-2 text-right text-on-surface-variant">
                            {i.unidadeSnapshot} c/ {i.quantidadePorEmbalagemSnapshot}
                          </td>
                          <td className="p-2 text-right font-bold text-on-surface">
                            {i.quantidade}
                          </td>
                          <td className="p-2 text-right text-on-surface-variant">
                            {moeda(i.precoUnitario)}
                          </td>
                          <td className="p-2 pr-3 text-right font-bold text-primary">
                            {moeda(i.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-[#141e17] px-4 py-2.5 flex items-center justify-between border-t border-white/10 text-xs">
                  <span className="font-bold text-on-surface-variant">Valor Total do Pedido:</span>
                  <span className="text-base font-bold font-mono text-primary">{moeda(total)}</span>
                </div>
              </div>

              <p className="text-[11px] text-on-surface-variant/80">
                {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'}, total {moeda(total)}. Depois de fechado, o pedido não aceita mais itens.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 bg-[#141e17] p-3 px-5 shrink-0">
              <Button
                variant="outline"
                onClick={() => setConfirmandoFechar(false)}
                disabled={fechar.isPending}
                className="rounded-none border border-white/15 bg-white/5 hover:bg-white/10 text-on-surface text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer"
              >
                Voltar e revisar
              </Button>
              <Button
                onClick={aoFechar}
                disabled={fechar.isPending}
                className="rounded-none bg-primary hover:bg-primary/90 text-black text-xs font-bold uppercase tracking-wider px-5 py-2 shadow-[0_0_16px_rgba(78,222,163,0.3)] cursor-pointer flex items-center gap-2"
              >
                {fechar.isPending ? (
                  <>
                    <CircleNotch className="size-3.5 animate-spin" />
                    <span>Fechando…</span>
                  </>
                ) : (
                  'Fechar pedido'
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {confirmandoExcluir && (
        <Dialog
          open
          onClose={() => setConfirmandoExcluir(false)}
          size="md"
          ariaLabel="Excluir pedido avulso"
          className="p-0 rounded-none border border-rose-500/30 bg-[#0d1410] shadow-2xl max-w-md text-on-surface overflow-hidden"
        >
          <div className="flex flex-col bg-[#0d1410]">
            <div className="flex items-center gap-3 border-b border-rose-500/20 px-5 py-4 bg-rose-500/10">
              <div className="flex size-8 items-center justify-center bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-none">
                <Trash className="size-4" weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Excluir pedido em aberto
                </span>
                <div className="text-[11px] font-mono text-on-surface-variant">
                  Esta ação não pode ser desfeita
                </div>
              </div>
            </div>
            <div className="p-5 text-xs font-mono text-on-surface-variant space-y-2">
              <p>
                Tem certeza que deseja excluir este pedido avulso? Todos os itens adicionados até agora serão descartados.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 bg-[#141e17] p-3 px-5">
              <Button
                variant="outline"
                onClick={() => setConfirmandoExcluir(false)}
                disabled={excluirPedidoMutation.isPending}
                className="rounded-none border border-white/15 bg-white/5 text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={aoExcluirPedido}
                disabled={excluirPedidoMutation.isPending}
                className="rounded-none bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 cursor-pointer"
              >
                {excluirPedidoMutation.isPending ? 'Excluindo…' : 'Sim, excluir pedido'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Modal Amplo de Catálogo Completo */}
      <Dialog
        open={modalCatalogoAberto}
        onClose={() => setModalCatalogoAberto(false)}
        size="xl"
        ariaLabel="Catálogo de produtos"
        className="p-0 rounded-none border border-white/15 bg-[#0d1410] shadow-2xl max-w-4xl text-on-surface overflow-hidden"
      >
        <div className="flex flex-col h-[75vh] max-h-[600px] bg-[#0d1410]">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 bg-[#141e17]">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center bg-primary/15 border border-primary/30 text-primary rounded-none">
                <SquaresFour className="size-4" weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Catálogo de Produtos da Loja
                </span>
                <p className="text-[11px] font-mono text-on-surface-variant/80 mt-0.5">
                  {produtos?.length ?? 0} produtos cadastrados no estoque da loja
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalCatalogoAberto(false)}
              className="flex size-7 items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 rounded-none transition-colors cursor-pointer"
            >
              <X className="size-4" weight="bold" />
            </button>
          </div>

          <div className="p-4 border-b border-white/10 bg-[#131b15]">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary size-4" weight="bold" />
              <input
                value={buscaCatalogo}
                onChange={(e) => setBuscaCatalogo(e.target.value)}
                placeholder="Filtrar por nome ou código de barras no catálogo…"
                className="w-full bg-[#16201a] text-on-surface text-xs font-mono rounded-none pl-10 pr-4 py-2.5 border border-white/15 focus:border-primary focus:outline-none h-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {((produtos ?? []).filter(
              (p) =>
                p.ativo !== false &&
                (!buscaCatalogo.trim() ||
                  normalizar(p.nome).includes(normalizar(buscaCatalogo)) ||
                  (p.codigoBarras && normalizar(p.codigoBarras).includes(normalizar(buscaCatalogo))))
            )).length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant font-mono text-xs">
                Nenhum produto encontrado no catálogo próprio.
              </div>
            ) : (
              (produtos ?? [])
                .filter(
                  (p) =>
                    p.ativo !== false &&
                    (!buscaCatalogo.trim() ||
                      normalizar(p.nome).includes(normalizar(buscaCatalogo)) ||
                      (p.codigoBarras && normalizar(p.codigoBarras).includes(normalizar(buscaCatalogo))))
                )
                .map((p) => {
                  const jaNoPedido = produtosNoPedido.has(p.id)
                  return (
                    <div
                      key={p.id}
                      className="p-3 px-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors rounded-none font-mono"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold uppercase text-on-surface truncate">{p.nome}</div>
                        <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mt-0.5">
                          <span>GTIN: {p.codigoBarras || '—'}</span>
                          <span>Embalagem: {p.unidade} ({p.quantidadePorEmbalagem || 1} un)</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {jaNoPedido && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30">
                            <Check className="size-3" weight="bold" />
                            Já no pedido
                          </span>
                        )}
                        <Button
                          variant={jaNoPedido ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => {
                            setModalCatalogoAberto(false)
                            abrirInclusaoProduto(p)
                          }}
                          className="rounded-none text-xs font-bold uppercase tracking-wider"
                        >
                          Selecionar
                        </Button>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </Dialog>

      {/* Modal de Cadastrar Novo Produto */}
      <Dialog
        open={modalCadastroAberto}
        onClose={() => setModalCadastroAberto(false)}
        size="lg"
        ariaLabel="Cadastrar novo produto"
        className="p-0 rounded-none border border-white/15 bg-[#0d1410] shadow-2xl max-w-2xl text-on-surface"
      >
        <ProdutoForm aoSalvar={aoSalvarNovoProduto} valoresIniciais={prefillCadastro} />
      </Dialog>
    </PageContainer>
  )
}
