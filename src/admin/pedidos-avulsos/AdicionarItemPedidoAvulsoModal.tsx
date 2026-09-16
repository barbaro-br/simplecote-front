import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  CaretDown,
  CaretUp,
  Check,
  CircleNotch,
  MagnifyingGlass,
  Package,
  QrCode,
  Sparkle,
  X,
} from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { moeda } from '@/shared/format/formatters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useAtrasarIndicador } from '@/shared/hooks/useAtrasarIndicador'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import {
  useProdutos,
  useSugestoesCadastro,
  useMaisSugestoesDoCatalogoGlobal,
  type SugestaoCatalogoGlobal,
} from '@/admin/produtos/produtos.api'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import type { Produto, ValoresIniciaisProduto } from '@/admin/produtos/produtos.schema'
import { useAdicionarItemPedidoAvulso } from './pedidos-avulsos.api'
import {
  itemPedidoAvulsoSchema,
  type ItemPedidoAvulso,
  type ItemPedidoAvulsoFormValues,
  type PedidoAvulso,
} from './pedidos-avulsos.schema'

const LIMITE_SUGESTOES = 30

function normalizar(termo?: string | null): string {
  if (!termo) return ''
  return termo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function rotuloEmbalagem(p: { unidade: string; quantidadePorEmbalagem: number }): string {
  return p.unidade === 'Unidade' && p.quantidadePorEmbalagem === 1
    ? 'Unidade'
    : `${p.unidade} com ${p.quantidadePorEmbalagem}`
}

type Props = {
  open: boolean
  onClose: () => void
  pedidoId: string
  itens: ItemPedidoAvulso[]
  quantidadeItens: number
  total: number
  onPedidoAtualizado: (pedido: PedidoAvulso) => void
  produtoInicial?: Produto | null
}

export function AdicionarItemPedidoAvulsoModal({
  open,
  onClose,
  pedidoId,
  itens,
  quantidadeItens,
  total,
  onPedidoAtualizado,
  produtoInicial,
}: Props) {
  const adicionarItem = useAdicionarItemPedidoAvulso(pedidoId)
  const produtosNoPedido = new Set(itens.map((i) => i.produtoId))

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(produtoInicial ?? null)
  const [busca, setBusca] = useState('')
  const [erroItem, setErroItem] = useState<string | null>(null)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [prefillCadastro, setPrefillCadastro] = useState<ValoresIniciaisProduto | undefined>(undefined)

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setBusca('')
      setProdutoSelecionado(produtoInicial ?? null)
      setErroItem(null)
    }
  }

  useEffect(() => {
    if (produtoInicial) {
      selecionarProduto(produtoInicial)
    }
  }, [produtoInicial])

  const form = useForm<ItemPedidoAvulsoFormValues>({
    resolver: zodResolver(itemPedidoAvulsoSchema),
    defaultValues: {
      produtoId: '',
      precoEmbalagem: undefined,
      quantidade: undefined,
      unidade: '',
      quantidadePorEmbalagem: undefined,
    },
  })

  const precoEmbalagemNum = Number(form.watch('precoEmbalagem'))
  const quantidadeNum = Number(form.watch('quantidade'))
  const unidadeWatch = form.watch('unidade')
  const fatorWatch = form.watch('quantidadePorEmbalagem')

  const unidadeAtiva = (unidadeWatch?.trim() ? unidadeWatch.trim() : produtoSelecionado?.unidade) || 'UN'
  const fatorAtivo = Number(fatorWatch) > 0 ? Number(fatorWatch) : produtoSelecionado?.quantidadePorEmbalagem || 1

  const precoUnitarioPreview =
    produtoSelecionado && precoEmbalagemNum > 0
      ? precoEmbalagemNum / fatorAtivo
      : null
  const totalLinhaPreview =
    precoEmbalagemNum > 0 && quantidadeNum > 0 ? precoEmbalagemNum * quantidadeNum : null

  const { data: todosProdutos, isLoading: carregandoProdutosTenant } = useProdutos()
  const produtosDoTenant = useMemo(() => {
    return (todosProdutos ?? []).filter((p) => p.ativo !== false)
  }, [todosProdutos])

  const buscaDebounced = useDebounce(busca, 300)
  const sugestoes = useSugestoesCadastro(buscaDebounced)

  const produtosLocaisFiltrados = useMemo(() => {
    const s = normalizar(busca)
    if (!s) {
      // Pré-carregamento inicial: exibe os produtos cadastrados que ainda não estão no pedido
      return produtosDoTenant.filter((p) => !produtosNoPedido.has(p.id))
    }
    return produtosDoTenant.filter((p) => {
      const nomeMatch = normalizar(p.nome).includes(s)
      const gtinMatch = p.codigoBarras ? normalizar(p.codigoBarras).includes(s) : false
      return nomeMatch || gtinMatch
    })
  }, [produtosDoTenant, busca, produtosNoPedido])

  const doProprioCatalogo = useMemo(() => {
    const mapa = new Map<string, Produto>()
    for (const p of produtosLocaisFiltrados) {
      mapa.set(p.id, p)
    }
    for (const p of sugestoes.data?.doProprioCatalogo ?? []) {
      mapa.set(p.id, p)
    }
    return Array.from(mapa.values())
  }, [produtosLocaisFiltrados, sugestoes.data?.doProprioCatalogo])

  const paginaZeroGlobal = sugestoes.data?.doCatalogoGlobal ?? []

  const carregandoBusca =
    busca.trim().length >= 2 && (busca !== buscaDebounced || sugestoes.isFetching)
  const mostrarSpinnerBusca = useAtrasarIndicador(carregandoBusca)

  const maisSugestoes = useMaisSugestoesDoCatalogoGlobal()
  const [paginasExtras, setPaginasExtras] = useState<SugestaoCatalogoGlobal[]>([])
  const [proximaPagina, setProximaPagina] = useState(1)
  const [ultimaPaginaExtraParcial, setUltimaPaginaExtraParcial] = useState(false)

  useEffect(() => {
    setPaginasExtras([])
    setProximaPagina(1)
    setUltimaPaginaExtraParcial(false)
  }, [buscaDebounced])

  const listaGlobal = useMemo(() => {
    const gtinsLocais = new Set<string>()
    for (const p of produtosDoTenant) {
      if (p.codigoBarras) gtinsLocais.add(p.codigoBarras)
    }
    return [...paginaZeroGlobal, ...paginasExtras].filter(
      (g) => !gtinsLocais.has(g.codigoBarras),
    )
  }, [produtosDoTenant, paginaZeroGlobal, paginasExtras])

  const acabouCatalogoGlobal =
    paginasExtras.length > 0
      ? ultimaPaginaExtraParcial
      : paginaZeroGlobal.length > 0 && paginaZeroGlobal.length < LIMITE_SUGESTOES
  const totalNavegavel = doProprioCatalogo.length + listaGlobal.length
  const mostrarSugestoes = !produtoSelecionado && totalNavegavel > 0

  function carregarMaisDoCatalogoGlobal() {
    if (acabouCatalogoGlobal || maisSugestoes.isPending || buscaDebounced.trim().length < 2) return
    maisSugestoes.mutate(
      { q: buscaDebounced.trim(), pagina: proximaPagina },
      {
        onSuccess: (pagina) => {
          setPaginasExtras((atual) => [...atual, ...pagina])
          setProximaPagina((atual) => atual + 1)
          setUltimaPaginaExtraParcial(pagina.length < LIMITE_SUGESTOES)
        },
      },
    )
  }

  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const indiceAtivoClamped = totalNavegavel === 0 ? 0 : Math.min(indiceAtivo, totalNavegavel - 1)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemAtivoRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const container = containerRef.current
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
    if (indiceAtivoClamped >= totalNavegavel - 3) {
      carregarMaisDoCatalogoGlobal()
    }
  }, [indiceAtivoClamped])

  const [podeRolarCima, setPodeRolarCima] = useState(false)
  const [podeRolarBaixo, setPodeRolarBaixo] = useState(false)

  function atualizarAfordanceScroll(el: HTMLDivElement) {
    setPodeRolarCima(el.scrollTop > 4)
    setPodeRolarBaixo(el.scrollTop + el.clientHeight < el.scrollHeight - 4)
  }

  useEffect(() => {
    if (containerRef.current) atualizarAfordanceScroll(containerRef.current)
  }, [mostrarSugestoes, doProprioCatalogo.length, listaGlobal.length])

  function aoRolarSugestoes(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    atualizarAfordanceScroll(el)
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
      carregarMaisDoCatalogoGlobal()
    }
  }

  function rolarSugestoes(delta: number) {
    containerRef.current?.scrollBy({ top: delta, behavior: 'smooth' })
  }

  function selecionarProduto(p: Produto) {
    setProdutoSelecionado(p)
    setBusca('')
    setIndiceAtivo(0)
    form.reset({
      produtoId: p.id,
      precoEmbalagem: undefined,
      quantidade: undefined,
      unidade: p.unidade,
      quantidadePorEmbalagem: p.quantidadePorEmbalagem,
    })
  }

  function trocarProduto() {
    setProdutoSelecionado(null)
    form.reset({
      produtoId: '',
      precoEmbalagem: undefined,
      quantidade: undefined,
      unidade: '',
      quantidadePorEmbalagem: undefined,
    })
  }

  function abrirCadastroDaSugestao(s: SugestaoCatalogoGlobal) {
    setPrefillCadastro({ nome: s.nome, codigoBarras: s.codigoBarras })
    setCadastroAberto(true)
  }

  function aoSalvarCadastro(produtoCriado?: Produto) {
    setCadastroAberto(false)
    setPrefillCadastro(undefined)
    if (produtoCriado) selecionarProduto(produtoCriado)
  }

  function selecionarNoIndice(i: number) {
    if (i < doProprioCatalogo.length) {
      selecionarProduto(doProprioCatalogo[i])
    } else {
      const s = listaGlobal[i - doProprioCatalogo.length]
      if (s) abrirCadastroDaSugestao(s)
    }
  }

  function aoTeclarNaBusca(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mostrarSugestoes) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceAtivo(Math.min(indiceAtivoClamped + 1, totalNavegavel - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceAtivo(Math.max(indiceAtivoClamped - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selecionarNoIndice(indiceAtivoClamped)
    } else if (e.key === 'Escape') {
      setBusca('')
    }
  }

  const salvandoItem = adicionarItem.isPending

  async function aoConfirmarItem(valores: ItemPedidoAvulsoFormValues) {
    setErroItem(null)
    try {
      const payload: ItemPedidoAvulsoFormValues = {
        produtoId: valores.produtoId,
        precoEmbalagem: valores.precoEmbalagem,
        quantidade: valores.quantidade,
      }
      if (valores.unidade && valores.unidade !== produtoSelecionado?.unidade) {
        payload.unidade = valores.unidade
      }
      if (
        valores.quantidadePorEmbalagem &&
        valores.quantidadePorEmbalagem !== produtoSelecionado?.quantidadePorEmbalagem
      ) {
        payload.quantidadePorEmbalagem = valores.quantidadePorEmbalagem
      }
      const resultado = await adicionarItem.mutateAsync(payload)
      toast.success(`"${produtoSelecionado?.nome ?? 'Item'}" adicionado ao pedido!`)
      onPedidoAtualizado(resultado)
      onClose()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErroItem(e instanceof ApiError ? e.message : 'Não foi possível adicionar o item. Tente novamente.')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      ariaLabel="Adicionar item ao pedido"
      className="p-0 rounded-none border border-white/15 bg-[#0d1410] shadow-2xl max-w-3xl text-on-surface overflow-hidden"
    >
      <div className="flex h-[75vh] max-h-[640px] flex-col bg-[#0d1410]">
        {/* Cabeçalho Contábil */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3.5 bg-[#141e17]">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center bg-primary/15 border border-primary/30 text-primary rounded-none shadow-[0_0_12px_rgba(78,222,163,0.2)]">
              <Package className="size-4" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Adicionar item
                </span>
                <span className="px-1.5 py-0.2 rounded-none text-[9px] font-mono bg-white/10 text-on-surface border border-white/15">
                  PEDIDO AVULSO
                </span>
              </div>
              <div className="text-[11px] font-mono text-on-surface-variant/80 mt-0.5">
                {quantidadeItens === 0
                  ? 'Nenhum item adicionado ainda'
                  : `${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'} adicionados · Total: ${moeda(total)}`}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 rounded-none transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="size-4" weight="bold" />
          </button>
        </div>

        {!produtoSelecionado ? (
          <>
            {/* Barra de Busca Estilo Spotlight */}
            <div className="relative shrink-0 border-b border-white/10 bg-[#131b15] px-5 py-3">
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-primary">
                  {mostrarSpinnerBusca ? (
                    <CircleNotch className="size-4 animate-spin" />
                  ) : (
                    <MagnifyingGlass className="size-4" weight="bold" />
                  )}
                </span>
                <Input
                  autoFocus
                  autoComplete="off"
                  name="busca-produto-pedido-avulso"
                  data-1p-ignore
                  data-lpignore="true"
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value)
                    setIndiceAtivo(0)
                  }}
                  onKeyDown={aoTeclarNaBusca}
                  placeholder="Buscar produto por nome ou código de barras…"
                  className="rounded-none bg-[#16201a] border-white/15 pl-9 pr-24 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary h-10"
                  role="combobox"
                  aria-expanded={mostrarSugestoes}
                  aria-controls="sugestoes-pedido-avulso-modal"
                />
                <div className="absolute right-2.5 flex items-center gap-1 text-[10px] font-mono text-on-surface-variant/70 bg-white/5 px-2 py-1 rounded-none border border-white/10 pointer-events-none">
                  <QrCode className="size-3" weight="bold" />
                  <span>Bip / Enter</span>
                </div>
              </div>
            </div>

            {/* Área de Resultados da Busca */}
            <div className="relative min-h-0 flex-1 bg-[#0d1410]">
              {mostrarSugestoes ? (
                <>
                  <div ref={containerRef} onScroll={aoRolarSugestoes} className="h-full overflow-y-auto">
                    {/* Seção 1: Catálogo Local */}
                    {doProprioCatalogo.length > 0 && (
                      <div className="p-3">
                        <div className="flex items-center justify-between px-2 pb-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                            {busca.trim() ? `Do seu catálogo (${doProprioCatalogo.length})` : `Catálogo do Comprador (${doProprioCatalogo.length})`}
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant/60">
                            {busca.trim() ? 'Prontos para adicionar' : 'Clique para selecionar ou use ↑/↓ e Enter'}
                          </span>
                        </div>
                        <ul id="sugestoes-pedido-avulso-modal" role="listbox" className="space-y-1">
                          {doProprioCatalogo.map((p, i) => {
                            const jaNoPedido = produtosNoPedido.has(p.id)
                            const ativo = i === indiceAtivoClamped
                            return (
                              <li key={p.id} role="option" aria-selected={ativo}>
                                <button
                                  ref={ativo ? itemAtivoRef : undefined}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => selecionarProduto(p)}
                                  onMouseEnter={() => setIndiceAtivo(i)}
                                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left rounded-none border transition-colors cursor-pointer ${
                                    ativo
                                      ? 'bg-[#1a251f] border-primary text-on-surface pl-3'
                                      : 'bg-[#121914]/60 border-white/5 hover:bg-white/5 text-on-surface'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex size-7 items-center justify-center bg-white/5 border border-white/10 text-on-surface-variant shrink-0 rounded-none">
                                      <Package className="size-3.5" />
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col font-mono">
                                      <span className="truncate text-xs font-bold uppercase">{p.nome}</span>
                                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant mt-0.5">
                                        <span>Emb: {rotuloEmbalagem(p)}</span>
                                        {p.codigoBarras && (
                                          <span className="bg-white/5 px-1 py-0.2 border border-white/10">
                                            {p.codigoBarras}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-2 font-mono">
                                    {jaNoPedido ? (
                                      <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase text-primary rounded-none">
                                        <Check className="size-3" weight="bold" />
                                        Já no pedido
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-none">
                                        Selecionar →
                                      </span>
                                    )}
                                  </div>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Seção 2: Catálogo Global */}
                    {listaGlobal.length > 0 && (
                      <div className="border-t border-white/10 p-3 bg-black/20">
                        <div className="flex items-center justify-between px-2 pb-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-tertiary flex items-center gap-1.5">
                            <Sparkle className="size-3 text-tertiary" weight="fill" />
                            Catálogo Global — Base Compartilhada ({listaGlobal.length})
                          </span>
                          <span className="text-[10px] font-mono text-on-surface-variant/60">
                            Cadastra e inclui
                          </span>
                        </div>
                        <ul role="listbox" className="space-y-1">
                          {listaGlobal.map((s, i) => {
                            const idx = doProprioCatalogo.length + i
                            const ativo = idx === indiceAtivoClamped
                            return (
                              <li key={s.codigoBarras} role="option" aria-selected={ativo}>
                                <button
                                  ref={ativo ? itemAtivoRef : undefined}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => abrirCadastroDaSugestao(s)}
                                  onMouseEnter={() => setIndiceAtivo(idx)}
                                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left rounded-none border transition-colors cursor-pointer ${
                                    ativo
                                      ? 'bg-[#1a251f] border-tertiary text-on-surface pl-3'
                                      : 'bg-[#121914]/40 border-white/5 hover:bg-white/5 text-on-surface'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex size-7 items-center justify-center bg-tertiary/10 border border-tertiary/20 text-tertiary shrink-0 rounded-none">
                                      <Sparkle className="size-3.5" weight="fill" />
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col font-mono">
                                      <span className="truncate text-xs font-bold uppercase">{s.nome}</span>
                                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant mt-0.5">
                                        <span>GTIN: {s.codigoBarras}</span>
                                        {s.marca && <span>· Marca: {s.marca}</span>}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-2 font-mono">
                                    <span className="text-[10px] font-bold text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-none">
                                      Cadastrar e Usar →
                                    </span>
                                  </div>
                                </button>
                              </li>
                            )
                          })}
                          {maisSugestoes.isPending && (
                            <li className="px-3 py-2 text-center text-xs font-mono text-primary flex items-center justify-center gap-2">
                              <CircleNotch className="size-3 animate-spin" />
                              Carregando mais itens da base global…
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {podeRolarCima && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => rolarSugestoes(-160)}
                      aria-label="Rolar sugestões para cima"
                      className="absolute inset-x-0 top-0 flex h-6 items-center justify-center bg-gradient-to-b from-[#0d1410] to-transparent text-primary hover:opacity-80"
                    >
                      <CaretUp className="size-3.5" weight="bold" />
                    </button>
                  )}
                  {podeRolarBaixo && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => rolarSugestoes(160)}
                      aria-label="Rolar sugestões para baixo"
                      className="absolute inset-x-0 bottom-0 flex h-6 items-center justify-center bg-gradient-to-t from-[#0d1410] to-transparent text-primary hover:opacity-80"
                    >
                      <CaretDown className="size-3.5" weight="bold" />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-xs font-mono text-on-surface-variant/70">
                  {carregandoProdutosTenant ? (
                    <div className="flex items-center gap-2 text-primary">
                      <CircleNotch className="size-4 animate-spin" />
                      <span>Carregando catálogo da loja…</span>
                    </div>
                  ) : busca.trim().length >= 2 ? (
                    <div className="space-y-3">
                      <p>Nenhum produto encontrado no catálogo ou base global para "{busca.trim()}".</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPrefillCadastro({ nome: busca.trim().toUpperCase(), codigoBarras: '' })
                          setCadastroAberto(true)
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-none text-xs font-mono font-bold cursor-pointer"
                      >
                        + Cadastrar "{busca.trim().toUpperCase()}"
                      </button>
                    </div>
                  ) : busca.trim().length > 0 ? (
                    <p>Digite ao menos 2 caracteres para buscar na base global…</p>
                  ) : (
                    <div className="space-y-3">
                      <p>Nenhum produto cadastrado no catálogo da loja ainda.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPrefillCadastro(undefined)
                          setCadastroAberto(true)
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-none text-xs font-mono font-bold cursor-pointer"
                      >
                        + Cadastrar primeiro produto
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Formulário de Quantidade e Preço do Item Selecionado */
          <div className="min-h-0 flex-1 overflow-y-auto p-5 bg-[#0d1410]">
            <form onSubmit={form.handleSubmit(aoConfirmarItem)} noValidate className="space-y-4">
              {/* Linha Contábil do Produto */}
              <div className="flex items-center justify-between rounded-none border border-white/15 bg-[#141e17] p-3.5 px-4 font-mono">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 items-center justify-center bg-primary/15 border border-primary/30 text-primary shrink-0 rounded-none">
                    <Package className="size-4" weight="bold" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold uppercase text-on-surface">
                      {produtoSelecionado.nome}
                    </div>
                    <div className="text-[10px] text-on-surface-variant flex items-center gap-2 mt-0.5">
                      <span>Embalagem: {rotuloEmbalagem(produtoSelecionado)}</span>
                      {produtoSelecionado.codigoBarras && (
                        <span>· GTIN: {produtoSelecionado.codigoBarras}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={trocarProduto}
                  className="shrink-0 text-xs font-mono font-semibold text-primary hover:underline cursor-pointer"
                >
                  Trocar produto
                </button>
              </div>

              {/* Destaque Contábil da Embalagem e Conversão com Edição Direta */}
              <div className="rounded-none border border-primary/25 bg-[#121c15] p-3.5 px-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Embalagem Comercial do Fornecedor
                  </span>
                  <span className="text-[10px] text-on-surface-variant bg-white/5 px-2 py-0.5 border border-white/10">
                    1 emb = {fatorAtivo} {unidadeAtiva}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="item-unidade"
                      className="text-[10px] uppercase font-bold text-on-surface-variant"
                    >
                      Unidade de venda
                    </label>
                    <Input
                      id="item-unidade"
                      autoComplete="off"
                      {...form.register('unidade')}
                      placeholder="Ex: FD, CX, PCT, UN…"
                      className="rounded-none bg-[#131b15] border-white/15 text-xs font-mono text-on-surface h-9 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="item-fator"
                      className="text-[10px] uppercase font-bold text-on-surface-variant"
                    >
                      Fator (Qtd. por emb.)
                    </label>
                    <Input
                      id="item-fator"
                      type="number"
                      min={1}
                      autoComplete="off"
                      {...form.register('quantidadePorEmbalagem', { valueAsNumber: true })}
                      placeholder="Ex: 25, 6, 12, 1…"
                      className="rounded-none bg-[#131b15] border-white/15 text-xs font-mono text-on-surface h-9 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                  <span>Preço digitado será rateado por:</span>
                  <span className="text-primary font-bold">
                    {fatorAtivo} {unidadeAtiva} por embalagem
                  </span>
                </div>
              </div>

              {/* Inputs de Valores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="precoEmbalagem"
                    className="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
                  >
                    Preço da embalagem
                  </label>
                  <Input
                    id="precoEmbalagem"
                    type="number"
                    step="0.01"
                    min={0}
                    autoFocus
                    autoComplete="off"
                    {...form.register('precoEmbalagem', { valueAsNumber: true })}
                    placeholder="Ex: 125,00"
                    className={`rounded-none bg-[#131b15] border-white/15 text-sm font-mono text-on-surface h-10 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      form.formState.errors.precoEmbalagem ? 'border-rose-500/50' : ''
                    }`}
                  />
                  {form.formState.errors.precoEmbalagem && (
                    <p className="text-[11px] font-mono text-rose-400">
                      {form.formState.errors.precoEmbalagem.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="quantidade"
                    className="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant"
                  >
                    Quantidade de embalagens
                  </label>
                  <Input
                    id="quantidade"
                    type="number"
                    min={1}
                    autoComplete="off"
                    {...form.register('quantidade', { valueAsNumber: true })}
                    placeholder="Ex: 2"
                    className={`rounded-none bg-[#131b15] border-white/15 text-sm font-mono text-on-surface h-10 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      form.formState.errors.quantidade ? 'border-rose-500/50' : ''
                    }`}
                  />
                  {form.formState.errors.quantidade && (
                    <p className="text-[11px] font-mono text-rose-400">
                      {form.formState.errors.quantidade.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Faixa Contábil de Derivação */}
              {(precoUnitarioPreview != null || totalLinhaPreview != null) && (
                <div className="flex items-center justify-between rounded-none bg-[#141e17] border border-white/10 p-3 px-4 font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-on-surface-variant">Preço unitário ({unidadeAtiva}):</span>
                    <span className="font-bold text-on-surface">
                      {precoUnitarioPreview != null ? moeda(precoUnitarioPreview) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-on-surface-variant">Subtotal do item:</span>
                    <span className="text-sm font-bold text-primary">
                      {totalLinhaPreview != null ? moeda(totalLinhaPreview) : '—'}
                    </span>
                  </div>
                </div>
              )}

              {erroItem && (
                <div
                  role="alert"
                  className="rounded-none border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-mono text-rose-300"
                >
                  ⚠ {erroItem}
                </div>
              )}

              <Button
                type="submit"
                disabled={salvandoItem}
                className="w-full rounded-none bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider text-xs py-2.5 shadow-[0_0_16px_rgba(78,222,163,0.3)] cursor-pointer flex items-center justify-center gap-2"
              >
                {salvandoItem ? (
                  <>
                    <CircleNotch className="size-4 animate-spin" />
                    <span>Adicionando item…</span>
                  </>
                ) : (
                  'Adicionar item'
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Rodapé de Fechamento */}
        <div className="flex shrink-0 justify-end border-t border-white/10 bg-[#141e17] p-3 px-5">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-none border border-white/15 bg-white/5 hover:bg-white/10 text-on-surface text-xs font-bold uppercase tracking-wider px-5 py-2 cursor-pointer"
          >
            Concluído
          </Button>
        </div>
      </div>

      <Dialog
        open={cadastroAberto}
        onClose={() => setCadastroAberto(false)}
        size="lg"
        ariaLabel="Cadastrar novo produto"
        className="p-0 rounded-none border border-white/15 bg-[#0d1410] shadow-2xl max-w-2xl text-on-surface"
      >
        <ProdutoForm aoSalvar={aoSalvarCadastro} valoresIniciais={prefillCadastro} />
      </Dialog>
    </Dialog>
  )
}
