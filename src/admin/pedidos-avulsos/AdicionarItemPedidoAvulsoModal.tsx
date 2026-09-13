import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CaretDown, CaretUp, CircleNotch, MagnifyingGlass, Package, Sparkle, X } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { moeda } from '@/shared/format/formatters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useAtrasarIndicador } from '@/shared/hooks/useAtrasarIndicador'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import {
  useSugestoesCadastro,
  useMaisSugestoesDoCatalogoGlobal,
  type SugestaoCatalogoGlobal,
} from '@/admin/produtos/produtos.api'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import type { Produto, ValoresIniciaisProduto } from '@/admin/produtos/produtos.schema'
import { useCriarPedidoAvulso, useAdicionarItemPedidoAvulso } from './pedidos-avulsos.api'
import { itemPedidoAvulsoSchema, type ItemPedidoAvulsoFormValues, type PedidoAvulso } from './pedidos-avulsos.schema'

const LIMITE_SUGESTOES = 30

function rotuloEmbalagem(p: Produto): string {
  return p.unidade === 'Unidade' && p.quantidadePorEmbalagem === 1
    ? 'Unidade'
    : `${p.unidade} com ${p.quantidadePorEmbalagem}`
}

type Props = {
  open: boolean
  onClose: () => void
  pedidoId: string | undefined
  empresaId: string
  condicaoPagamentoId: string
  prazoEntregaEstimado: string
  quantidadeItens: number
  total: number
  onPedidoAtualizado: (pedido: PedidoAvulso) => void
}

// Modal de "adicionar item" do pedido avulso — mesmo esqueleto do
// AdicionarItemModal da Cotação (busca ocupa a tela toda, fica aberto entre
// adições sucessivas, só fecha no X/"Concluído"). Diferença: aqui cada item
// exige preço da embalagem + quantidade ANTES de confirmar (é uma venda
// fechada, não um pedido de cotação) — por isso, depois de escolher o
// produto, o modal troca a lista de busca por um formulário de preço/qtd em
// vez de adicionar na hora do clique.
export function AdicionarItemPedidoAvulsoModal({
  open,
  onClose,
  pedidoId,
  empresaId,
  condicaoPagamentoId,
  prazoEntregaEstimado,
  quantidadeItens,
  total,
  onPedidoAtualizado,
}: Props) {
  const criar = useCriarPedidoAvulso()
  const adicionarItem = useAdicionarItemPedidoAvulso(pedidoId ?? '')

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [busca, setBusca] = useState('')
  const [erroItem, setErroItem] = useState<string | null>(null)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [prefillCadastro, setPrefillCadastro] = useState<ValoresIniciaisProduto | undefined>(undefined)

  // Reabrir sempre parte da busca em branco (o modal continua montado entre aberturas).
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setBusca('')
      setProdutoSelecionado(null)
      setErroItem(null)
    }
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

  // Busca de produto (produto/sugestao-de-cadastro): mesmo padrão de scroll
  // infinito + navegação por teclado de ProdutoForm.tsx/AdicionarItemModal.tsx.
  const buscaDebounced = useDebounce(busca, 300)
  const sugestoes = useSugestoesCadastro(buscaDebounced)
  const doProprioCatalogo = sugestoes.data?.doProprioCatalogo ?? []
  const paginaZeroGlobal = sugestoes.data?.doCatalogoGlobal ?? []

  // Spinner só depois de um pequeno atraso (evita flicker quando a resposta
  // já volta rápido) — cobre tanto o debounce quanto o fetch em si, porque as
  // duas partes juntas são o "pequeno delay" que a pessoa percebe ao buscar.
  const carregandoBusca = busca.trim().length >= 2 && (busca !== buscaDebounced || sugestoes.isFetching)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carregarMaisDoCatalogoGlobal fecha sobre estado que muda a cada chamada; sua própria guarda de "isPending"/"acabou" evita disparo duplicado
  }, [indiceAtivoClamped])

  // Indicação visual de que a lista rola (setas no topo/rodapé) — mesma
  // affordance da tela de pedido avulso, mas aqui dentro do modal a lista já
  // não compete com nenhum cabeçalho fixo por baixo.
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

  const salvandoItem = criar.isPending || adicionarItem.isPending
  const faltamDadosDoPedido = !pedidoId && (!empresaId || !condicaoPagamentoId)

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
      onPedidoAtualizado(resultado)
      trocarProduto()
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErroItem(e instanceof ApiError ? e.message : 'Não foi possível adicionar o item. Tente novamente.')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} size="xl" ariaLabel="Adicionar item ao pedido">
      <div className="flex h-[70vh] max-h-[600px] flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4 px-6">
          <div>
            <div className="text-[15px] font-semibold text-foreground">Adicionar item</div>
            <div className="mt-[1px] text-xs text-muted-foreground">
              {quantidadeItens === 0
                ? 'Nenhum item no pedido ainda'
                : `${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'} · ${moeda(total)}`}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        {!produtoSelecionado ? (
          <>
            <div className="relative shrink-0 border-b border-muted px-6 py-3">
              <span className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 text-muted-foreground/70">
                {mostrarSpinnerBusca ? (
                  <CircleNotch className="size-4 animate-spin" />
                ) : (
                  <MagnifyingGlass className="size-4" />
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
                className="pl-9"
                role="combobox"
                aria-expanded={mostrarSugestoes}
                aria-controls="sugestoes-pedido-avulso-modal"
              />
            </div>

            <div className="relative min-h-0 flex-1">
              {mostrarSugestoes ? (
                <>
                  <div ref={containerRef} onScroll={aoRolarSugestoes} className="h-full overflow-y-auto">
                    {doProprioCatalogo.length > 0 && (
                      <div className="p-2">
                        <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Seu catálogo
                        </p>
                        <ul id="sugestoes-pedido-avulso-modal" role="listbox">
                          {doProprioCatalogo.map((p, i) => (
                            <li key={p.id} role="option" aria-selected={i === indiceAtivoClamped}>
                              <button
                                ref={i === indiceAtivoClamped ? itemAtivoRef : undefined}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selecionarProduto(p)}
                                onMouseEnter={() => setIndiceAtivo(i)}
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
                      onClick={() => rolarSugestoes(-160)}
                      aria-label="Rolar sugestões para cima"
                      className="absolute inset-x-0 top-0 flex h-6 items-center justify-center bg-gradient-to-b from-popover to-transparent text-muted-foreground hover:text-foreground"
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
                      className="absolute inset-x-0 bottom-0 flex h-6 items-center justify-center bg-gradient-to-t from-popover to-transparent text-muted-foreground hover:text-foreground"
                    >
                      <CaretDown className="size-3.5" weight="bold" />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  {busca.trim().length > 0 && busca.trim().length < 2
                    ? 'Digite ao menos 2 letras…'
                    : busca.trim().length >= 2
                      ? 'Nenhum produto encontrado.'
                      : 'Comece digitando o nome ou código de barras do produto.'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <form onSubmit={form.handleSubmit(aoConfirmarItem)} noValidate className="space-y-4">
              <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium ui-uppercase">{produtoSelecionado.nome}</div>
                  <div className="text-[11px] text-muted-foreground">{rotuloEmbalagem(produtoSelecionado)}</div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={trocarProduto}>
                  Trocar produto
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="precoEmbalagem" className="text-sm font-medium ui-uppercase">
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
                    className={form.formState.errors.precoEmbalagem ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {form.formState.errors.precoEmbalagem && (
                    <p className="text-[13px] font-medium text-destructive">{form.formState.errors.precoEmbalagem.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="quantidade" className="text-sm font-medium ui-uppercase">
                    Quantidade de embalagens
                  </label>
                  <Input
                    id="quantidade"
                    type="number"
                    min={1}
                    autoComplete="off"
                    {...form.register('quantidade', { valueAsNumber: true })}
                    placeholder="Ex: 2"
                    className={form.formState.errors.quantidade ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {form.formState.errors.quantidade && (
                    <p className="text-[13px] font-medium text-destructive">{form.formState.errors.quantidade.message}</p>
                  )}
                </div>
              </div>

              {(precoUnitarioPreview != null || totalLinhaPreview != null) && (
                <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Preço unitário:{' '}
                    <strong className="text-foreground">{precoUnitarioPreview != null ? moeda(precoUnitarioPreview) : '—'}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Total do item:{' '}
                    <strong className="text-foreground">{totalLinhaPreview != null ? moeda(totalLinhaPreview) : '—'}</strong>
                  </span>
                </div>
              )}

              {erroItem && (
                <div role="alert" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-[13px] font-medium text-destructive">
                  {erroItem}
                </div>
              )}

              {faltamDadosDoPedido && (
                <div role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[13px] font-medium text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-500">
                  Escolha a Empresa e a condição de pagamento antes de confirmar o primeiro item.
                </div>
              )}

              <Button type="submit" disabled={salvandoItem || faltamDadosDoPedido} className="w-full">
                {salvandoItem ? 'Adicionando…' : 'Adicionar item'}
              </Button>
            </form>
          </div>
        )}

        <div className="flex shrink-0 justify-end border-t border-border bg-muted/20 p-3 px-5">
          <Button onClick={onClose} variant="default" className="h-8 px-5 text-xs">
            Concluído
          </Button>
        </div>
      </div>

      <Dialog open={cadastroAberto} onClose={() => setCadastroAberto(false)} size="lg" ariaLabel="Cadastrar novo produto">
        <ProdutoForm aoSalvar={aoSalvarCadastro} valoresIniciais={prefillCadastro} />
      </Dialog>
    </Dialog>
  )
}
