import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MagnifyingGlass, Package, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CabecalhoPagina, Superficie } from '@/shared/ui'
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
    if (itemTopo < container.scrollTop) {
      container.scrollTop = itemTopo
    } else if (itemBase > container.scrollTop + container.clientHeight) {
      container.scrollTop = itemBase - container.clientHeight
    }
    if (indiceAtivoClamped >= totalNavegavel - 3) {
      carregarMaisDoCatalogoGlobal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carregarMaisDoCatalogoGlobal fecha sobre estado que muda a cada chamada; sua própria guarda de "isPending"/"acabou" evita disparo duplicado
  }, [indiceAtivoClamped])

  function aoRolarSugestoes(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
      carregarMaisDoCatalogoGlobal()
    }
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
      const resultado = pedidoId ? await adicionarItem.mutateAsync(valores) : await criar.mutateAsync(valores)
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
    <PageContainer maxWidth="lg" className="space-y-6">
      <CabecalhoPagina
        titulo="Novo pedido avulso"
        subtitulo="Venda fechada por telefone com um Representante, fora do fluxo de cotação."
        acao={
          <Link to="/admin" className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline">
            ← Cancelar
          </Link>
        }
      />

      <Superficie className="p-6 space-y-4">
        <h2 className="text-sm font-semibold ui-uppercase text-muted-foreground">Adicionar item</h2>

        {!produtoSelecionado ? (
          <div className="relative">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                <MagnifyingGlass className="size-4" />
              </span>
              <Input
                autoFocus
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
                              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                                i === indiceAtivoClamped ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
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
                                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                                  idx === indiceAtivoClamped ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
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
              </div>
            )}
          </div>
        ) : (
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
                  {...form.register('precoEmbalagem', { valueAsNumber: true })}
                  placeholder="Ex: 125,00"
                  className={form.formState.errors.precoEmbalagem ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {form.formState.errors.precoEmbalagem && (
                  <p className="text-[13px] text-destructive font-medium">{form.formState.errors.precoEmbalagem.message}</p>
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
                  {...form.register('quantidade', { valueAsNumber: true })}
                  placeholder="Ex: 2"
                  className={form.formState.errors.quantidade ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {form.formState.errors.quantidade && (
                  <p className="text-[13px] text-destructive font-medium">{form.formState.errors.quantidade.message}</p>
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
              <div role="alert" className="text-[13px] text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                {erroItem}
              </div>
            )}

            <Button type="submit" disabled={salvandoItem} className="w-full">
              {salvandoItem ? 'Adicionando…' : 'Adicionar item'}
            </Button>
          </form>
        )}
      </Superficie>

      <Superficie className="p-0">
        <ul className="divide-y">
          {itens.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">Nenhum item adicionado ainda.</li>}
          {itens.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium ui-uppercase">{item.nomeSnapshot}</div>
                <div className="text-[11px] text-muted-foreground">
                  {item.quantidade}× {moeda(item.precoUnitario)}/un
                </div>
              </div>
              <div className="shrink-0 text-sm font-semibold">{moeda(item.subtotal)}</div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t bg-muted/20 p-4">
          <div className="text-sm text-muted-foreground">
            {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'}
          </div>
          <div className="text-lg font-semibold">{moeda(total)}</div>
        </div>
      </Superficie>

      <div className="flex justify-end">
        <Button variant="default" disabled={itens.length === 0 || fechar.isPending} onClick={() => setConfirmandoFechar(true)}>
          Fechar pedido
        </Button>
      </div>

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
