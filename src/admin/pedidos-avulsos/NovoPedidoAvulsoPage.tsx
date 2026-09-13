import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CaretDown, CaretUp, MagnifyingGlass, Package, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { Combobox } from '@/shared/components/ui/combobox'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CabecalhoPagina, SecaoCabecalho, SubFaixa, Superficie } from '@/shared/ui'
import { ConfirmarDialog } from '@/admin/cotacoes/ConfirmarDialog'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { moeda } from '@/shared/format/formatters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import {
  useSugestoesCadastro,
  useMaisSugestoesDoCatalogoGlobal,
  type SugestaoCatalogoGlobal,
} from '@/admin/produtos/produtos.api'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import type { Produto, ValoresIniciaisProduto } from '@/admin/produtos/produtos.schema'
import { useCondicoesPagamento, useCriarCondicaoPagamento } from '@/admin/condicoes-pagamento/condicoes-pagamento.api'
import { useEmpresas } from '@/admin/empresas/empresas.api'
import { useRepresentantes } from '@/admin/representantes/representantes.api'
import { useCriarPedidoAvulso, useAdicionarItemPedidoAvulso, useFecharPedidoAvulso } from './pedidos-avulsos.api'
import { itemPedidoAvulsoSchema, type ItemPedidoAvulsoFormValues, type PedidoAvulso } from './pedidos-avulsos.schema'

const LIMITE_SUGESTOES = 30

function rotuloEmbalagem(p: Produto): string {
  return p.unidade === 'Unidade' && p.quantidadePorEmbalagem === 1
    ? 'Unidade'
    : `${p.unidade} com ${p.quantidadePorEmbalagem}`
}

// Tela de montagem de um Pedido avulso (venda fechada por telefone, sem
// Cotação por trás) — rota própria, não modal (design.md - Decisão 1): o
// fluxo dura minutos e um fechamento acidental do modal perderia o progresso.
export function NovoPedidoAvulsoPage() {
  const [pedido, setPedido] = useState<PedidoAvulso | null>(null)
  const pedidoId = pedido?.id
  const fechado = pedido?.status === 'FECHADO'

  const criar = useCriarPedidoAvulso()
  const adicionarItem = useAdicionarItemPedidoAvulso(pedidoId ?? '')
  const fechar = useFecharPedidoAvulso(pedidoId ?? '')

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [busca, setBusca] = useState('')
  const [erroItem, setErroItem] = useState<string | null>(null)
  const [confirmandoFechar, setConfirmandoFechar] = useState(false)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [prefillCadastro, setPrefillCadastro] = useState<ValoresIniciaisProduto | undefined>(undefined)

  // Condição de pagamento/prazo de entrega: só dá pra mandar no `POST` que cria
  // o pedido (o back não tem endpoint pra atualizar depois) — por isso só
  // ficam editáveis até o 1º item ser confirmado; a partir daí viram leitura
  // do que já foi salvo (`pedido.condicaoPagamento`/`prazoEntregaEstimado`).
  const { data: condicoesPagamento } = useCondicoesPagamento()
  const criarCondicao = useCriarCondicaoPagamento()
  const [condicaoPagamentoId, setCondicaoPagamentoId] = useState('')
  const [prazoEntregaEstimado, setPrazoEntregaEstimado] = useState('')

  const { data: empresas } = useEmpresas()
  const { data: representantes } = useRepresentantes()
  const [empresaId, setEmpresaId] = useState('')
  const representante = empresaId ? representantes?.find((r) => r.empresaId === empresaId) : null

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

  const form = useForm<ItemPedidoAvulsoFormValues>({
    resolver: zodResolver(itemPedidoAvulsoSchema),
    defaultValues: { produtoId: '', precoEmbalagem: undefined, quantidade: undefined },
  })

  const precoEmbalagemNum = Number(form.watch('precoEmbalagem'))
  const quantidadeNum = Number(form.watch('quantidade'))
  const precoUnitarioPreview =
    produtoSelecionado && precoEmbalagemNum > 0 ? precoEmbalagemNum / produtoSelecionado.quantidadePorEmbalagem : null
  const totalLinhaPreview = precoEmbalagemNum > 0 && quantidadeNum > 0 ? precoEmbalagemNum * quantidadeNum : null

  // Busca de produto (produto/sugestao-de-cadastro): reaproveita os mesmos
  // hooks e o mesmo padrão de scroll infinito + navegação por teclado de
  // ProdutoForm.tsx (spec - "Busca de produto reaproveita a sugestão de cadastro").
  const buscaDebounced = useDebounce(busca, 300)
  const sugestoes = useSugestoesCadastro(buscaDebounced)
  const doProprioCatalogo = sugestoes.data?.doProprioCatalogo ?? []
  const paginaZeroGlobal = sugestoes.data?.doCatalogoGlobal ?? []

  const maisSugestoes = useMaisSugestoesDoCatalogoGlobal()
  const [paginasExtras, setPaginasExtras] = useState<SugestaoCatalogoGlobal[]>([])
  const [proximaPagina, setProximaPagina] = useState(1)
  const [ultimaPaginaExtraParcial, setUltimaPaginaExtraParcial] = useState(false)
  useEffect(() => {
    setPaginasExtras([])
    setProximaPagina(1)
    setUltimaPaginaExtraParcial(false)
  }, [buscaDebounced])

  const listaGlobal = [...paginaZeroGlobal, ...paginasExtras]
  const acabouCatalogoGlobal =
    paginasExtras.length > 0 ? ultimaPaginaExtraParcial : paginaZeroGlobal.length > 0 && paginaZeroGlobal.length < LIMITE_SUGESTOES
  const totalNavegavel = doProprioCatalogo.length + listaGlobal.length
  const mostrarSugestoes = !produtoSelecionado && busca.trim().length >= 2 && totalNavegavel > 0

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

  // Navegação por teclado (seta cima/baixo + Enter) — mesmo cálculo manual de
  // posição de ProdutoForm.tsx/AdicionarItemModal.tsx (achado real: navegar
  // perto do fim da lista "perdia" o item ativo pra fora da área visível).
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
    // Folga de 8px: sem isso o item ativo parava exatamente na borda do
    // contêiner (achado real: parecia "não ter rolado" mesmo tendo rolado).
    const FOLGA = 8
    if (itemTopo < container.scrollTop) {
      container.scrollTop = Math.max(0, itemTopo - FOLGA)
    } else if (itemBase > container.scrollTop + container.clientHeight) {
      container.scrollTop = itemBase - container.clientHeight + FOLGA
    }
    if (indiceAtivoClamped >= totalNavegavel - 3) {
      carregarMaisDoCatalogoGlobal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carregarMaisDoCatalogoGlobal fecha sobre estado que muda a cada chamada; sua própria guarda de "isPending"/"acabou" evita disparo duplicado
  }, [indiceAtivoClamped])

  // Indicação visual de que a lista rola (setas no topo/rodapé do painel,
  // mesmo padrão de affordance de scroll usado em outras listas do painel) —
  // sem isso a lista cortada no meio (ex.: primeiro/último item pela metade)
  // não deixava claro que dava pra rolar mais.
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
    form.reset({ produtoId: p.id, precoEmbalagem: undefined, quantidade: undefined })
  }

  function trocarProduto() {
    setProdutoSelecionado(null)
    form.reset({ produtoId: '', precoEmbalagem: undefined, quantidade: undefined })
  }

  // Sugestão do catálogo global não tem produtoId próprio — precisa cadastrar
  // antes de virar item do pedido (mesmo padrão de AdicionarItemModal.tsx,
  // "cadastrarDaSugestao"). Diferente daquele fluxo, aqui o produto recém-criado
  // já entra selecionado no item em montagem (decisão tomada com o usuário).
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

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    toast.error(e instanceof ApiError ? e.message : 'Não foi possível completar a operação. Tente novamente.')
  }

  async function aoConfirmarItem(valores: ItemPedidoAvulsoFormValues) {
    setErroItem(null)
    try {
      let resultado: PedidoAvulso
      if (pedidoId) {
        resultado = await adicionarItem.mutateAsync(valores)
      } else {
        resultado = await criar.mutateAsync({
          ...valores,
          empresaId,
          ...(condicaoPagamentoId && { condicaoPagamentoId }),
          ...(prazoEntregaEstimado.trim() && { prazoEntregaEstimado: prazoEntregaEstimado.trim() }),
        })
      }
      setPedido(resultado)
      trocarProduto()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErroItem(e instanceof ApiError ? e.message : 'Não foi possível adicionar o item. Tente novamente.')
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

  const salvandoItem = criar.isPending || adicionarItem.isPending
  const itens = pedido?.itens ?? []
  const quantidadeItens = pedido?.quantidadeItens ?? itens.length
  const total = pedido?.total ?? 0

  if (fechado && pedido) {
    return (
      <PageContainer maxWidth="lg" className="space-y-6">
        <CabecalhoPagina titulo="Pedido avulso fechado" />
        <Superficie className="p-6 space-y-3 text-center">
          <p className="text-sm text-muted-foreground">Pedido avulso registrado com sucesso.</p>
          <p className="text-3xl font-semibold tracking-tight">{moeda(total)}</p>
          <p className="text-sm text-muted-foreground">
            {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'} · pedido {pedido.id}
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Link to="/admin">
              <Button variant="outline">Ir para o Dashboard</Button>
            </Link>
            <Link to="/admin/pedidos-avulsos/novo" reloadDocument>
              <Button>Novo pedido avulso</Button>
            </Link>
          </div>
        </Superficie>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="full" className="flex h-full min-h-0 flex-col gap-3 py-2">
      <CabecalhoPagina
        titulo="Novo pedido avulso"
        subtitulo="Venda fechada por telefone com um Representante, fora do fluxo de cotação."
        acao={
          <Link to="/admin" className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline">
            ← Cancelar
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
            <Button
              variant="default"
              size="sm"
              disabled={itens.length === 0 || fechar.isPending}
              onClick={() => setConfirmandoFechar(true)}
            >
              Fechar pedido
            </Button>
          }
        />

        {/* Barra de contexto: condição de pagamento/prazo (editável só até o
            1º item, depois vira leitura do que já foi salvo) + a busca que
            adiciona itens — tudo numa faixa só, largura toda, em vez de
            cartões separados espalhando a informação pela tela. */}
        <div className="flex flex-wrap items-end gap-4 border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] px-4 py-3 sm:px-5">
          {pedidoId ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span>
                Empresa: <strong className="text-foreground">{empresas?.find((e) => e.id === empresaId)?.nome ?? '—'}</strong>
              </span>
              {representante && (
                <span>
                  Representante: <strong className="text-foreground">{representante.nome}</strong>
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

        {/* Busca: primeira linha da própria lista de itens, não um cartão à
            parte — é daqui que o produto selecionado vira a linha "em
            montagem" da tabela logo abaixo. */}
        <div className="border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] px-4 py-3 sm:px-5">
        {!produtoSelecionado ? (
          <div className="relative">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                <MagnifyingGlass className="size-4" />
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
                className="pl-9"
                role="combobox"
                aria-expanded={mostrarSugestoes}
                aria-controls="sugestoes-pedido-avulso"
              />
            </div>

            {mostrarSugestoes && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                <div ref={containerRef} onScroll={aoRolarSugestoes} className="max-h-72 overflow-y-auto">
                  {doProprioCatalogo.length > 0 && (
                    <div className="p-2">
                      <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Seu catálogo
                      </p>
                      <ul id="sugestoes-pedido-avulso" role="listbox">
                        {doProprioCatalogo.map((p, i) => (
                          <li key={p.id} role="option" aria-selected={i === indiceAtivoClamped}>
                            <button
                              ref={i === indiceAtivoClamped ? itemAtivoRef : undefined}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => selecionarProduto(p)}
                              onMouseEnter={() => setIndiceAtivo(i)}
                              // `bg-accent` no tema escuro do painel é branco a 8% de
                              // opacidade — quase invisível numa lista compacta (achado
                              // real: navegação parecia não estar funcionando). Aqui o
                              // item ativo usa a cor de marca com contraste de verdade.
                              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                                i === indiceAtivoClamped
                                  ? 'bg-primary/15 text-foreground ring-1 ring-inset ring-primary/40'
                                  : 'hover:bg-primary/10'
                              }`}
                            >
                              <Package className="size-4 shrink-0 text-muted-foreground" />
                              <span className="flex min-w-0 flex-col">
                                <span className="truncate">{p.nome}</span>
                                <span className="text-[11px] text-muted-foreground">{rotuloEmbalagem(p)}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {listaGlobal.length > 0 && (
                    <div className="border-t p-2">
                      <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Base compartilhada — cadastra e adiciona
                      </p>
                      <ul role="listbox">
                        {listaGlobal.map((s, i) => {
                          const idx = doProprioCatalogo.length + i
                          return (
                            <li key={s.codigoBarras} role="option" aria-selected={idx === indiceAtivoClamped}>
                              <button
                                ref={idx === indiceAtivoClamped ? itemAtivoRef : undefined}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => abrirCadastroDaSugestao(s)}
                                onMouseEnter={() => setIndiceAtivo(idx)}
                                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                                  idx === indiceAtivoClamped
                                    ? 'bg-primary/15 text-foreground ring-1 ring-inset ring-primary/40'
                                    : 'hover:bg-primary/10'
                                }`}
                              >
                                <Sparkle className="size-4 shrink-0 text-muted-foreground" weight="fill" />
                                <span className="flex min-w-0 flex-col">
                                  <span className="truncate">{s.nome}</span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {s.codigoBarras}
                                    {s.marca ? ` · ${s.marca}` : ''}
                                  </span>
                                </span>
                              </button>
                            </li>
                          )
                        })}
                        {maisSugestoes.isPending && (
                          <li className="px-2 py-1.5 text-[11px] text-muted-foreground">Carregando mais…</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {podeRolarCima && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => rolarSugestoes(-120)}
                    aria-label="Rolar sugestões para cima"
                    className="absolute inset-x-0 top-0 flex h-6 items-center justify-center rounded-t-md bg-gradient-to-b from-popover to-transparent text-muted-foreground hover:text-foreground"
                  >
                    <CaretUp className="size-3.5" weight="bold" />
                  </button>
                )}
                {podeRolarBaixo && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => rolarSugestoes(120)}
                    aria-label="Rolar sugestões para baixo"
                    className="absolute inset-x-0 bottom-0 flex h-6 items-center justify-center rounded-b-md bg-gradient-to-t from-popover to-transparent text-muted-foreground hover:text-foreground"
                  >
                    <CaretDown className="size-3.5" weight="bold" />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(aoConfirmarItem)} noValidate className="flex flex-wrap items-end gap-4">
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2 sm:min-w-[240px] sm:flex-none sm:basis-72">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium ui-uppercase">{produtoSelecionado.nome}</div>
                <div className="text-[11px] text-muted-foreground">{rotuloEmbalagem(produtoSelecionado)}</div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={trocarProduto}>
                Trocar
              </Button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="precoEmbalagem" className="text-xs font-medium ui-uppercase text-muted-foreground">
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
                className={`w-36 ${form.formState.errors.precoEmbalagem ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="quantidade" className="text-xs font-medium ui-uppercase text-muted-foreground">
                Quantidade de embalagens
              </label>
              <Input
                id="quantidade"
                type="number"
                min={1}
                autoComplete="off"
                {...form.register('quantidade', { valueAsNumber: true })}
                placeholder="Ex: 2"
                className={`w-24 ${form.formState.errors.quantidade ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
            </div>

            {(precoUnitarioPreview != null || totalLinhaPreview != null) && (
              <div className="flex items-center gap-4 rounded-md bg-primary/5 px-3 py-2 text-sm">
                <span className="text-muted-foreground">
                  Unitário: <strong className="text-foreground">{precoUnitarioPreview != null ? moeda(precoUnitarioPreview) : '—'}</strong>
                </span>
                <span className="text-muted-foreground">
                  Total: <strong className="text-foreground">{totalLinhaPreview != null ? moeda(totalLinhaPreview) : '—'}</strong>
                </span>
              </div>
            )}

            <Button type="submit" disabled={salvandoItem || (!pedidoId && (!empresaId || !condicaoPagamentoId))}>
              {salvandoItem ? 'Adicionando…' : 'Adicionar item'}
            </Button>

            {(form.formState.errors.precoEmbalagem || form.formState.errors.quantidade) && (
              <p className="w-full text-[13px] text-destructive font-medium">
                {form.formState.errors.precoEmbalagem?.message ?? form.formState.errors.quantidade?.message}
              </p>
            )}
            {erroItem && (
              <p role="alert" className="w-full text-[13px] text-destructive font-medium">
                {erroItem}
              </p>
            )}
            {!pedidoId && (!empresaId || !condicaoPagamentoId) && (
              <p role="alert" className="w-full text-[13px] text-amber-600 dark:text-amber-500 font-medium">
                {!empresaId && !condicaoPagamentoId
                  ? 'Escolha a Empresa e a condição de pagamento pra confirmar o primeiro item.'
                  : !empresaId
                  ? 'Escolha a Empresa pra confirmar o primeiro item.'
                  : 'Escolha a condição de pagamento pra confirmar o primeiro item.'}
              </p>
            )}
          </form>
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
                {itens.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40">
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

      <Dialog open={cadastroAberto} onClose={() => setCadastroAberto(false)} size="lg" ariaLabel="Cadastrar novo produto">
        <ProdutoForm aoSalvar={aoSalvarCadastro} valoresIniciais={prefillCadastro} />
      </Dialog>
    </PageContainer>
  )
}
