import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Archive,
  Barcode,
  Camera,
  CaretDown,
  CaretUp,
  Check,
  MagnifyingGlass,
  Package,
  Stack,
  Tag,
  Warning,
  X,
} from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { produtoSchema, tiposDeEmbalagem, rotulosEmbalagem, type ProdutoFormValues, type Produto, type ValoresIniciaisProduto } from './produtos.schema'
import {
  useCriarProduto,
  useAtualizarProduto,
  useLookupProdutoPorGtin,
  useSugestoesCadastro,
  useMaisSugestoesDoCatalogoGlobal,
  type SugestaoCatalogoGlobal,
} from './produtos.api'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { SessaoExpiradaError } from '@/shared/api/api-client'

// Lazy: @zxing/browser só é baixado quando o admin realmente bipa um produto.
const LeitorCodigoBarras = lazy(() =>
  import('@/shared/components/LeitorCodigoBarras').then((m) => ({ default: m.LeitorCodigoBarras })),
)

type LookupStatus = 'idle' | 'buscando' | 'sugerido' | 'sugerido-por-nome' | 'nao-encontrado'

// Espelha o limite de GET /api/produtos/sugestoes (findTop30... no back) — só
// pra saber quando avisar "digite mais" (achado real: categoria grande
// — "amaciante" 255 linhas, "bala" 1337 — enterra marca/tamanho fora do teto).
const LIMITE_SUGESTOES = 30

type Props = {
  aoSalvar: (produtoCriado?: Produto) => void
  produtoParaEditar?: Produto
  /** Vindo de uma sugestão do catálogo global (ex.: "Adicionar item" sem
   * achar no próprio catálogo) — só se aplica ao cadastro de um produto novo. */
  valoresIniciais?: ValoresIniciaisProduto
}

export function ProdutoForm({ aoSalvar, produtoParaEditar, valoresIniciais }: Props) {
  const isEdit = !!produtoParaEditar
  const criar = useCriarProduto()
  const atualizar = useAtualizarProduto()
  const lookup = useLookupProdutoPorGtin()
  const [genericError, setGenericError] = useState<string | null>(null)
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>(valoresIniciais ? 'sugerido-por-nome' : 'idle')
  const [bipando, setBipando] = useState(false)
  const [confirmandoSemCodigo, setConfirmandoSemCodigo] = useState(false)
  const [valoresPendentes, setValoresPendentes] = useState<ProdutoFormValues | null>(null)

  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: produtoParaEditar?.nome ?? valoresIniciais?.nome ?? '',
      codigoBarras: produtoParaEditar?.codigoBarras ?? valoresIniciais?.codigoBarras ?? '',
      unidade: produtoParaEditar?.unidade ?? 'Unidade',
      quantidadePorEmbalagem: produtoParaEditar?.quantidadePorEmbalagem ?? 1
    },
  })

  const isPending = criar.isPending || atualizar.isPending

  const [dropdownEmbalagemAberto, setDropdownEmbalagemAberto] = useState(false)
  const dropdownEmbalagemRef = useRef<HTMLDivElement>(null)
  const unidadeSelecionada = useWatch({ control: form.control, name: 'unidade' })

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (dropdownEmbalagemRef.current && !dropdownEmbalagemRef.current.contains(e.target as Node)) {
        setDropdownEmbalagemAberto(false)
      }
    }
    if (dropdownEmbalagemAberto) {
      document.addEventListener('mousedown', handleClickFora)
      return () => document.removeEventListener('mousedown', handleClickFora)
    }
  }, [dropdownEmbalagemAberto])

  const codigoBarras = useWatch({ control: form.control, name: 'codigoBarras' })

  // Sugestão ao digitar (produto/sugestao-de-cadastro): só no cadastro de um
  // produto novo — editar um já existente não precisa de sugestão de nome.
  const [nomeFocado, setNomeFocado] = useState(false)
  const nome = useWatch({ control: form.control, name: 'nome' })
  const nomeDebounced = useDebounce(nome, 300)
  const sugestoes = useSugestoesCadastro(!isEdit && nomeFocado ? nomeDebounced : '')
  const paginaZeroGlobal = sugestoes.data?.doCatalogoGlobal ?? []

  // "Scroll infinito" do catálogo global (change scroll-infinito-sugestao-
  // catalogo-global): páginas além da 0 (que já vem no `sugestoes` acima)
  // acumuladas aqui, buscadas sob demanda ao chegar no fim da lista — não
  // precisa vir pré-carregado. Reseta a cada busca nova (termo mudou).
  const maisSugestoes = useMaisSugestoesDoCatalogoGlobal()
  const [paginasExtras, setPaginasExtras] = useState<SugestaoCatalogoGlobal[]>([])
  const [proximaPagina, setProximaPagina] = useState(1)
  // Só a última página EXTRA veio incompleta — não dá pra guardar isso num
  // boolean resetado a partir de `paginaZeroGlobal.length` (que ainda está
  // vazio, resposta antiga, no exato instante em que o termo muda e este
  // efeito dispara — sinalizava "acabou" antes mesmo da página 0 chegar).
  // "Acabou" fica só derivado abaixo, sem estado próprio pra evitar essa corrida.
  const [ultimaPaginaExtraParcial, setUltimaPaginaExtraParcial] = useState(false)
  useEffect(() => {
    setPaginasExtras([])
    setProximaPagina(1)
    setUltimaPaginaExtraParcial(false)
  }, [nomeDebounced])

  const listaGlobal = [...paginaZeroGlobal, ...paginasExtras]
  const acabouCatalogoGlobal = paginasExtras.length > 0
    ? ultimaPaginaExtraParcial
    : paginaZeroGlobal.length > 0 && paginaZeroGlobal.length < 30
  const temSugestao = (sugestoes.data?.doProprioCatalogo.length ?? 0) > 0 || listaGlobal.length > 0
  const mostrarSugestoes = nomeFocado && !isEdit && temSugestao

  function carregarMaisDoCatalogoGlobal() {
    if (acabouCatalogoGlobal || maisSugestoes.isPending || nomeDebounced.trim().length < 2) return
    maisSugestoes.mutate(
      { q: nomeDebounced.trim(), pagina: proximaPagina },
      {
        onSuccess: (pagina) => {
          setPaginasExtras((atual) => [...atual, ...pagina])
          setProximaPagina((atual) => atual + 1)
          setUltimaPaginaExtraParcial(pagina.length < 30)
        },
      },
    )
  }

  // Navegação por teclado (seta cima/baixo + Enter) entre as sugestões
  // clicáveis (catálogo global) — "já no seu catálogo" é só aviso, não entra
  // no ciclo. Derivado (não um effect): grampeia dentro do tamanho da lista
  // atual em vez de resetar via setState-em-effect (oxlint react(set-state-in-effect)).
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const indiceAtivoClamped = listaGlobal.length === 0 ? 0 : Math.min(indiceAtivo, listaGlobal.length - 1)
  // Rolagem acompanha o item ativo. Cálculo manual (não `scrollIntoView`) —
  // `offsetTop` do botão é relativo ao ancestral posicionado mais próximo
  // (o painel `absolute` alguns níveis acima), não ao container de scroll,
  // então `getBoundingClientRect` dos dois é o jeito confiável de saber a
  // posição do item DENTRO do container (achado real: navegar até perto do
  // fim da lista "perdia" o item ativo pra fora da área visível).
  const containerRef = useRef<HTMLDivElement>(null)
  const itemAtivoRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const container = containerRef.current
    const item = itemAtivoRef.current
    // jsdom não implementa layout real (getBoundingClientRect sempre zero) —
    // sem essa guarda o teste que abre o painel quebra sozinho.
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
    // Perto do fim da lista carregada (dentro de 3 itens) — carrega a próxima
    // página antes do usuário realmente bater no último item, pra seta não
    // "travar" esperando a resposta.
    if (indiceAtivoClamped >= listaGlobal.length - 3) {
      carregarMaisDoCatalogoGlobal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carregarMaisDoCatalogoGlobal fecha sobre estado que muda a cada chamada; sua própria guarda de "isPending"/"acabou" evita disparo duplicado
  }, [indiceAtivoClamped])

  // Scroll infinito também pelo mouse: chegando perto do fim do container
  // visível (não só via teclado).
  function aoRolarSugestoes(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
      carregarMaisDoCatalogoGlobal()
    }
  }

  function escolherSugestaoGlobal(s: SugestaoCatalogoGlobal) {
    form.setValue('nome', s.nome, { shouldDirty: true, shouldValidate: true })
    form.setValue('codigoBarras', s.codigoBarras, { shouldDirty: true, shouldValidate: true })
    setLookupStatus('sugerido-por-nome')
    setNomeFocado(false)
  }

  function aoTeclarNoNome(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!mostrarSugestoes || listaGlobal.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceAtivo(Math.min(indiceAtivoClamped + 1, listaGlobal.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceAtivo(Math.max(indiceAtivoClamped - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      escolherSugestaoGlobal(listaGlobal[indiceAtivoClamped])
    } else if (e.key === 'Escape') {
      setNomeFocado(false)
    }
  }

  async function handleLookup() {
    const gtin = form.getValues('codigoBarras')?.trim()
    if (!gtin) return

    setLookupStatus('buscando')
    try {
      const result = await lookup.mutateAsync(gtin)
      if (result) {
        form.setValue('nome', result.nome, { shouldDirty: true, shouldValidate: true })
        setLookupStatus('sugerido')
      } else {
        // 404 do provedor: não encontrado é normal — degrada, não trava.
        setLookupStatus('nao-encontrado')
      }
    } catch {
      // Rede/servidor: mesma degradação uniforme.
      setLookupStatus('nao-encontrado')
    }
  }

  async function salvar(valores: ProdutoFormValues) {
    setGenericError(null)
    const valoresTratados: ProdutoFormValues = {
      ...valores,
      nome: valores.nome.trim().toUpperCase(),
    }
    try {
      if (isEdit) {
        await atualizar.mutateAsync({ id: produtoParaEditar.id, valores: valoresTratados })
        form.reset()
        aoSalvar()
      } else {
        const novo = await criar.mutateAsync(valoresTratados)
        form.reset()
        aoSalvar(novo)
      }
    } catch (e: any) {
      // SessaoExpiradaError é transitório: a navegação para /login já aconteceu.
      if (e instanceof SessaoExpiradaError) return
      setGenericError(e.message || 'Erro ao salvar produto')
    }
  }

  function aoEnviar(valores: ProdutoFormValues) {
    if (!valores.codigoBarras?.trim()) {
      setValoresPendentes(valores)
      setConfirmandoSemCodigo(true)
      return
    }
    return salvar(valores)
  }

  function cancelarSemCodigo() {
    setConfirmandoSemCodigo(false)
    setValoresPendentes(null)
    // Devolve o foco ao campo de código de barras após o diálogo fechar.
    setTimeout(() => form.setFocus('codigoBarras'), 0)
  }

  async function confirmarSemCodigo() {
    setConfirmandoSemCodigo(false)
    const valores = valoresPendentes
    setValoresPendentes(null)
    if (valores) {
      await salvar(valores)
    }
  }

  return (
    <div className="bg-[#0d1410] border border-white/15 text-[#dde4dd] shadow-2xl overflow-visible">
      {/* Cabeçalho estilo planilha contábil */}
      <div className="bg-[#131b15] border-b border-white/15 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
            <Package className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#dde4dd] uppercase tracking-wider">
                {isEdit ? 'Editar Produto' : 'Novo Produto'}
              </span>
              <span className="px-1.5 py-0.5 rounded-none text-[10px] font-mono font-semibold bg-primary/15 text-primary border border-primary/30">
                PLANILHA
              </span>
            </div>
            <p className="text-[11px] font-mono text-on-surface-variant/70">
              {isEdit ? 'Atualize as informações na grade do catálogo.' : 'Preencha os campos da linha do produto.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => aoSalvar()}
          aria-label="Fechar"
          className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={form.handleSubmit(aoEnviar)} className="p-4 space-y-4" noValidate>
        {/* GRADE PLANILHADA DE ENTRADA DE DADOS */}
        <div className="border border-white/15 divide-y divide-white/15 bg-[#080d0a]">
          {/* LINHA 1: GTIN / Código de barras */}
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            <div className="sm:w-48 bg-[#131b15] p-3 flex items-center justify-between sm:justify-start gap-2 text-xs font-mono font-semibold text-primary uppercase shrink-0">
              <label htmlFor="codigoBarras" className="flex items-center gap-1.5 cursor-pointer">
                <Barcode className="size-4 text-primary" />
                <span>Código de barras</span>
              </label>
              <span className="text-[10px] text-on-surface-variant/50 font-normal lowercase">(opcional)</span>
            </div>
            <div className="flex-1 bg-[#0d1410] p-2.5 flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  id="codigoBarras"
                  {...form.register('codigoBarras', { onChange: () => setLookupStatus('idle') })}
                  placeholder="Ex: 7891234567890"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleLookup()
                    }
                  }}
                  className={`bg-[#16201a] text-[#dde4dd] placeholder:text-on-surface-variant/40 font-mono text-xs rounded-none border-white/15 focus-visible:border-primary focus-visible:bg-[#1a251f] focus-visible:ring-0 ${
                    form.formState.errors.codigoBarras ? 'border-destructive' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleLookup}
                  disabled={!codigoBarras?.trim() || lookup.isPending}
                  className="bg-[#1a251f] hover:bg-[#223028] text-[#dde4dd] border border-white/15 rounded-none text-xs font-mono uppercase font-semibold px-3 py-2 shrink-0"
                >
                  <MagnifyingGlass className="mr-1.5 size-3.5 text-primary" />
                  {lookup.isPending ? 'Buscando…' : 'Buscar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBipando(true)}
                  className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-none text-xs font-mono uppercase font-semibold px-3 py-2 shrink-0"
                >
                  <Camera className="mr-1.5 size-3.5" />
                  Bipar
                </Button>
              </div>
              {form.formState.errors.codigoBarras && (
                <p className="text-[11px] font-mono text-destructive">{form.formState.errors.codigoBarras.message}</p>
              )}
              {lookupStatus === 'sugerido' && (
                <p className="text-[11px] font-mono text-primary flex items-center gap-1">
                  <Check className="size-3" /> Nome sugerido pelo código de barras.
                </p>
              )}
              {lookupStatus === 'nao-encontrado' && (
                <p className="text-[11px] font-mono text-on-surface-variant/70">
                  Não encontrado — preencha o nome manualmente.
                </p>
              )}
            </div>
          </div>

          {/* LINHA 2: Nome / Descrição do Produto */}
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            <div className="sm:w-48 bg-[#131b15] p-3 flex items-center gap-2 text-xs font-mono font-semibold text-primary uppercase shrink-0">
              <label htmlFor="nome" className="flex items-center gap-1.5 cursor-pointer">
                <Tag className="size-4 text-primary" />
                <span>Nome do produto</span>
              </label>
            </div>
            <div className="flex-1 bg-[#0d1410] p-2.5 relative">
              <Input
                id="nome"
                autoComplete="off"
                {...form.register('nome', {
                  onChange: () => lookupStatus === 'sugerido-por-nome' && setLookupStatus('idle'),
                })}
                onFocus={() => setNomeFocado(true)}
                onBlur={() => setTimeout(() => setNomeFocado(false), 150)}
                onKeyDown={aoTeclarNoNome}
                role="combobox"
                aria-expanded={mostrarSugestoes}
                aria-controls="sugestoes-catalogo-global"
                placeholder="Ex: ARROZ BRANCO TIPO 1 5KG"
                className={`uppercase font-semibold bg-[#16201a] text-[#dde4dd] placeholder:text-on-surface-variant/40 text-xs rounded-none border-white/15 focus-visible:border-primary focus-visible:bg-[#1a251f] focus-visible:ring-0 w-full ${
                  form.formState.errors.nome ? 'border-destructive' : ''
                }`}
              />
              {form.formState.errors.nome && (
                <p className="text-[11px] font-mono text-destructive mt-1">{form.formState.errors.nome.message}</p>
              )}
              {lookupStatus === 'sugerido-por-nome' && (
                <p className="text-[11px] font-mono text-primary flex items-center gap-1 mt-1">
                  <Check className="size-3" /> Nome e código de barras preenchidos da base compartilhada.
                </p>
              )}

              {/* Sugestões do catálogo com estilo de planilha contábil */}
              {mostrarSugestoes && (
                <div className="absolute left-2.5 right-2.5 z-30 mt-1 border border-white/20 bg-[#0d1410] text-on-surface shadow-2xl rounded-none divide-y divide-white/10">
                  <div ref={containerRef} onScroll={aoRolarSugestoes} className="max-h-[min(70vh,460px)] overflow-y-auto divide-y divide-white/10">
                    {sugestoes.data!.doProprioCatalogo.length > 0 && (
                      <div className="p-2 bg-[#131b15]">
                        <p className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                          Já no seu catálogo
                        </p>
                        <ul className="space-y-0.5">
                          {sugestoes.data!.doProprioCatalogo.map((p) => (
                            <li key={p.id} className="px-2.5 py-1 text-xs text-on-surface-variant font-mono">
                              {p.nome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {listaGlobal.length > 0 && (
                      <div className="p-1.5">
                        <p className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                          Sugestão da base compartilhada
                        </p>
                        <ul id="sugestoes-catalogo-global" role="listbox" className="space-y-0.5">
                          {listaGlobal.map((s, i) => (
                            <li key={s.codigoBarras} role="option" aria-selected={i === indiceAtivoClamped}>
                              <button
                                ref={i === indiceAtivoClamped ? itemAtivoRef : undefined}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => escolherSugestaoGlobal(s)}
                                onMouseEnter={() => setIndiceAtivo(i)}
                                className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs font-mono transition-colors cursor-pointer rounded-none ${
                                  i === indiceAtivoClamped
                                    ? 'bg-[#1a251f] text-primary border-l-2 border-primary font-bold'
                                    : 'text-[#dde4dd] hover:bg-white/5'
                                }`}
                              >
                                <span className="truncate">{s.nome}</span>
                                <span className="text-[10px] text-on-surface-variant/70 shrink-0">
                                  {s.codigoBarras}
                                </span>
                              </button>
                            </li>
                          ))}
                          {maisSugestoes.isPending && (
                            <li className="px-3 py-1 text-[11px] font-mono text-on-surface-variant">Carregando mais…</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {sugestoes.data!.doProprioCatalogo.length >= LIMITE_SUGESTOES && (
                      <p className="border-t border-white/10 px-3 py-1.5 text-[10px] font-mono text-on-surface-variant bg-[#131b15]/40">
                        Muitos resultados no seu catálogo — digite mais letras pra afinar a busca.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LINHA 3: Embalagem e Fator (colunas divididas da planilha) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            {/* Célula Embalagem — Dropdown customizado estilo planilha */}
            <div className="bg-[#0d1410] p-2.5 space-y-1.5 relative" ref={dropdownEmbalagemRef}>
              <label
                htmlFor="unidade"
                onClick={() => setDropdownEmbalagemAberto((prev) => !prev)}
                className="text-xs font-mono font-semibold text-primary uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Archive className="size-4 text-primary" />
                Embalagem
              </label>

              {/* Botão Gatilho do Select Planilhado */}
              <button
                type="button"
                onClick={() => setDropdownEmbalagemAberto((prev) => !prev)}
                className={`flex h-9 w-full items-center justify-between rounded-none border bg-[#16201a] text-[#dde4dd] px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                  dropdownEmbalagemAberto ? 'border-primary ring-1 ring-primary/30' : 'border-white/15 hover:border-white/30'
                } ${form.formState.errors.unidade ? 'border-destructive' : ''}`}
                aria-haspopup="listbox"
                aria-expanded={dropdownEmbalagemAberto}
              >
                <span className="font-bold text-[#dde4dd]">
                  {rotulosEmbalagem[unidadeSelecionada] || unidadeSelecionada || 'Selecione'}
                </span>
                <CaretDown className={`size-3.5 text-on-surface-variant transition-transform duration-150 ${dropdownEmbalagemAberto ? 'rotate-180 text-primary' : ''}`} />
              </button>

              {/* Menu Dropdown Planilhado */}
              {dropdownEmbalagemAberto && (
                <div className="absolute left-2.5 right-2.5 bottom-full z-50 mb-1.5 border border-white/20 bg-[#0d1410] text-on-surface shadow-2xl rounded-none divide-y divide-white/10 font-mono">
                  <div className="p-1 bg-[#131b15] text-[10px] uppercase font-bold text-primary px-2.5 py-1 flex items-center justify-between">
                    <span>Tipos de Embalagem</span>
                    <span className="text-[9px] text-on-surface-variant/80 font-normal">11 opções</span>
                  </div>
                  <div role="listbox" className="p-1.5 grid grid-cols-2 gap-1 bg-[#080d0a] max-h-64 overflow-y-auto">
                    {tiposDeEmbalagem.map((tipo) => {
                      const ativo = unidadeSelecionada === tipo
                      return (
                        <button
                          key={tipo}
                          type="button"
                          role="option"
                          aria-selected={ativo}
                          onClick={() => {
                            form.setValue('unidade', tipo, { shouldDirty: true, shouldValidate: true })
                            setDropdownEmbalagemAberto(false)
                          }}
                          className={`flex items-center justify-between px-2 py-1.5 text-left text-xs transition-colors cursor-pointer rounded-none border ${
                            ativo
                              ? 'bg-[#1a251f] text-primary font-bold border-primary shadow-sm'
                              : 'text-[#dde4dd] border-white/10 hover:border-white/25 hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{rotulosEmbalagem[tipo] || tipo}</span>
                          {ativo && <Check className="size-3 text-primary shrink-0 ml-1" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Select nativo oculto para manter compatibilidade e acessibilidade */}
              <select id="unidade" tabIndex={-1} aria-hidden="true" className="sr-only" {...form.register('unidade')}>
                {tiposDeEmbalagem.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {rotulosEmbalagem[tipo] || tipo}
                  </option>
                ))}
              </select>

              {form.formState.errors.unidade && (
                <p className="text-[11px] font-mono text-destructive">{form.formState.errors.unidade.message}</p>
              )}
            </div>

            {/* Célula Quantidade por embalagem — com Stepper Customizado Planilhado */}
            <div className="bg-[#0d1410] p-2.5 space-y-1.5">
              <label htmlFor="quantidadePorEmbalagem" className="text-xs font-mono font-semibold text-primary uppercase flex items-center gap-1.5">
                <Stack className="size-4 text-primary" />
                Qtd. por embalagem
              </label>

              <div className="relative flex items-stretch border border-white/15 bg-[#16201a] focus-within:border-primary focus-within:bg-[#1a251f] transition-colors">
                <Input
                  id="quantidadePorEmbalagem"
                  type="number"
                  min={1}
                  {...form.register('quantidadePorEmbalagem', { valueAsNumber: true })}
                  placeholder="Ex: 1"
                  className={`h-9 border-0 bg-transparent text-[#dde4dd] text-xs font-mono font-bold pl-3 pr-8 rounded-none shadow-none focus-visible:ring-0 focus-visible:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full ${
                    form.formState.errors.quantidadePorEmbalagem ? 'text-destructive' : ''
                  }`}
                />

                {/* Botões customizados de spinner (▲ / ▼) integrados e estilizados no padrão contábil */}
                <div className="absolute right-0 top-0 bottom-0 w-7 border-l border-white/15 flex flex-col divide-y divide-white/15 bg-[#131b15]">
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Aumentar quantidade"
                    onClick={() => {
                      const atual = Number(form.getValues('quantidadePorEmbalagem')) || 0
                      form.setValue('quantidadePorEmbalagem', atual + 1, { shouldDirty: true, shouldValidate: true })
                    }}
                    className="flex-1 flex items-center justify-center hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none"
                  >
                    <CaretUp className="size-3" weight="bold" />
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Diminuir quantidade"
                    onClick={() => {
                      const atual = Number(form.getValues('quantidadePorEmbalagem')) || 1
                      form.setValue('quantidadePorEmbalagem', Math.max(1, atual - 1), { shouldDirty: true, shouldValidate: true })
                    }}
                    className="flex-1 flex items-center justify-center hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none"
                  >
                    <CaretDown className="size-3" weight="bold" />
                  </button>
                </div>
              </div>

              {form.formState.errors.quantidadePorEmbalagem && (
                <p className="text-[11px] font-mono text-destructive">{form.formState.errors.quantidadePorEmbalagem.message}</p>
              )}
            </div>
          </div>
        </div>

        {genericError && (
          <div role="alert" className="text-xs font-mono text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-none">
            {genericError}
          </div>
        )}

        {/* RODAPÉ DA PLANILHA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/15">
          <span className="text-[11px] font-mono text-on-surface-variant/60 hidden sm:inline">
            * Dados serão salvos em maiúsculas no catálogo contábil.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => aoSalvar()}
              disabled={isPending}
              className="rounded-none border border-white/15 bg-transparent hover:bg-white/5 text-[#dde4dd] text-xs font-mono uppercase px-4 py-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase font-mono tracking-wider rounded-none px-6 py-2 shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all"
            >
              {isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>

      {bipando && (
        <Suspense fallback={null}>
          <LeitorCodigoBarras
            onRead={(gtin) => {
              form.setValue('codigoBarras', gtin, { shouldDirty: true, shouldValidate: true })
              setBipando(false)
              handleLookup()
            }}
            onClose={() => setBipando(false)}
          />
        </Suspense>
      )}

      {confirmandoSemCodigo && (
        <Dialog open onClose={cancelarSemCodigo} size="md" className="p-5 bg-[#0d1410] border border-white/20 text-[#dde4dd] rounded-none shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-warning">
              <Warning className="size-5 shrink-0" />
              <h2 className="text-sm font-mono font-bold text-[#dde4dd] uppercase tracking-wide">
                Salvar sem código de barras?
              </h2>
            </div>
            <p className="text-xs font-mono text-on-surface-variant/80 leading-relaxed">
              O produto ficará sem GTIN e não aparecerá em buscas por código nem na bipagem via câmera/leitor.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <Button type="button" variant="outline" onClick={cancelarSemCodigo} className="rounded-none text-xs font-mono uppercase">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmarSemCodigo}
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase font-mono tracking-wider rounded-none shadow-[0_0_16px_rgba(78,222,163,0.3)]"
              >
                {isPending ? 'Salvando…' : 'Salvar sem código'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}
