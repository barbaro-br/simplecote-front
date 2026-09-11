import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, MagnifyingGlass } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { produtoSchema, tiposDeEmbalagem, type ProdutoFormValues, type Produto } from './produtos.schema'
import {
  useCriarProduto,
  useAtualizarProduto,
  useLookupProdutoPorGtin,
  useSugestoesCadastro,
  type SugestaoCatalogoGlobal,
} from './produtos.api'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { SessaoExpiradaError } from '@/shared/api/api-client'

// Lazy: @zxing/browser só é baixado quando o admin realmente bipa um produto.
const LeitorCodigoBarras = lazy(() =>
  import('@/shared/components/LeitorCodigoBarras').then((m) => ({ default: m.LeitorCodigoBarras })),
)

type LookupStatus = 'idle' | 'buscando' | 'sugerido' | 'sugerido-por-nome' | 'nao-encontrado'

export function ProdutoForm({ aoSalvar, produtoParaEditar }: { aoSalvar: (produtoCriado?: Produto) => void, produtoParaEditar?: Produto }) {
  const isEdit = !!produtoParaEditar
  const criar = useCriarProduto()
  const atualizar = useAtualizarProduto()
  const lookup = useLookupProdutoPorGtin()
  const [genericError, setGenericError] = useState<string | null>(null)
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle')
  const [bipando, setBipando] = useState(false)
  const [confirmandoSemCodigo, setConfirmandoSemCodigo] = useState(false)
  const [valoresPendentes, setValoresPendentes] = useState<ProdutoFormValues | null>(null)
  
  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: { 
      nome: produtoParaEditar?.nome ?? '', 
      codigoBarras: produtoParaEditar?.codigoBarras ?? '', 
      unidade: produtoParaEditar?.unidade ?? 'Unidade', 
      quantidadePorEmbalagem: produtoParaEditar?.quantidadePorEmbalagem ?? 1 
    },
  })

  const isPending = criar.isPending || atualizar.isPending

  const codigoBarras = useWatch({ control: form.control, name: 'codigoBarras' })

  // Sugestão ao digitar (produto/sugestao-de-cadastro): só no cadastro de um
  // produto novo — editar um já existente não precisa de sugestão de nome.
  const [nomeFocado, setNomeFocado] = useState(false)
  const nome = useWatch({ control: form.control, name: 'nome' })
  const nomeDebounced = useDebounce(nome, 300)
  const sugestoes = useSugestoesCadastro(!isEdit && nomeFocado ? nomeDebounced : '')
  const listaGlobal = sugestoes.data?.doCatalogoGlobal ?? []
  const temSugestao = (sugestoes.data?.doProprioCatalogo.length ?? 0) > 0 || listaGlobal.length > 0
  const mostrarSugestoes = nomeFocado && !isEdit && temSugestao

  // Navegação por teclado (seta cima/baixo + Enter) entre as sugestões
  // clicáveis (catálogo global) — "já no seu catálogo" é só aviso, não entra
  // no ciclo. Derivado (não um effect): grampeia dentro do tamanho da lista
  // atual em vez de resetar via setState-em-effect (oxlint react(set-state-in-effect)).
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const indiceAtivoClamped = listaGlobal.length === 0 ? 0 : Math.min(indiceAtivo, listaGlobal.length - 1)
  // Rolagem acompanha o item ativo (efeito de DOM, não setState — não cai na
  // mesma regra do lint que a tentativa anterior de resetar índice em effect).
  const itemAtivoRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    // Encadeado com `?.` no método também (não só na ref): jsdom não
    // implementa scrollIntoView — sem isso o teste quebra ao abrir o painel.
    itemAtivoRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [indiceAtivoClamped])

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
    try {
      if (isEdit) {
        await atualizar.mutateAsync({ id: produtoParaEditar.id, valores })
        form.reset()
        aoSalvar()
      } else {
        const novo = await criar.mutateAsync(valores)
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
    <>
      <form onSubmit={form.handleSubmit(aoEnviar)} className="space-y-6" noValidate>
        <div>
          <h2 className="text-lg font-semibold tracking-tight ui-uppercase">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
          <p className="text-sm text-muted-foreground">{isEdit ? 'Atualize as informações do produto.' : 'Cadastre um novo produto no catálogo.'}</p>
        </div>

        <div className="space-y-4">
          {/* Código de barras primeiro: o fluxo natural é bipar/digitar e deixar o sistema trazer o nome. */}
          <div className="space-y-2">
            <label htmlFor="codigoBarras" className="text-sm font-medium ui-uppercase">
              Código de barras (GTIN) <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
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
                className={form.formState.errors.codigoBarras ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleLookup}
                disabled={!codigoBarras?.trim() || lookup.isPending}
              >
                <MagnifyingGlass className="mr-2 size-4" />
                {lookup.isPending ? 'Buscando…' : 'Buscar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setBipando(true)} className="shrink-0">
                <Camera className="mr-2 size-4" />
                Bipar
              </Button>
            </div>
            {form.formState.errors.codigoBarras && (
              <p className="text-[13px] text-destructive font-medium">{form.formState.errors.codigoBarras.message}</p>
            )}
            {lookupStatus === 'sugerido' && (
              <p className="text-[13px] text-success font-medium">Nome sugerido pelo código de barras.</p>
            )}
            {lookupStatus === 'nao-encontrado' && (
              <p className="text-[13px] text-muted-foreground">
                Não encontrado — preencha o nome manualmente.
              </p>
            )}
          </div>

          <div className="relative space-y-2">
            <label htmlFor="nome" className="text-sm font-medium ui-uppercase">
              Nome do produto
            </label>
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
              placeholder="Ex: Arroz Branco 5kg"
              className={form.formState.errors.nome ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {form.formState.errors.nome && (
              <p className="text-[13px] text-destructive font-medium">{form.formState.errors.nome.message}</p>
            )}
            {lookupStatus === 'sugerido-por-nome' && (
              <p className="text-[13px] text-success font-medium">Nome e código de barras preenchidos da base compartilhada.</p>
            )}

            {/* Sugestão ao digitar (produto/sugestao-de-cadastro): "já no seu
                catálogo" é só aviso (evita recadastrar) — nunca preenche nada
                sozinho; sugestão do catálogo global preenche nome+código ao
                clicar, igual a busca por código de barras já faz. */}
            {mostrarSugestoes && (
              <div className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                {sugestoes.data!.doProprioCatalogo.length > 0 && (
                  <div className="border-b p-2">
                    <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Já no seu catálogo
                    </p>
                    <ul>
                      {sugestoes.data!.doProprioCatalogo.map((p) => (
                        <li key={p.id} className="px-2 py-1 text-sm text-muted-foreground">
                          {p.nome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {listaGlobal.length > 0 && (
                  <div className="p-2">
                    <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Sugestão da base compartilhada
                    </p>
                    <ul id="sugestoes-catalogo-global" role="listbox">
                      {listaGlobal.map((s, i) => (
                        <li key={s.codigoBarras} role="option" aria-selected={i === indiceAtivoClamped}>
                          <button
                            ref={i === indiceAtivoClamped ? itemAtivoRef : undefined}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => escolherSugestaoGlobal(s)}
                            onMouseEnter={() => setIndiceAtivo(i)}
                            className={`flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left text-sm ${
                              i === indiceAtivoClamped ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            <span>{s.nome}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {s.codigoBarras}{s.marca ? ` · ${s.marca}` : ''}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="unidade" className="text-sm font-medium ui-uppercase">
                Embalagem
              </label>
              <select 
                id="unidade" 
                {...form.register('unidade')} 
                className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${form.formState.errors.unidade ? "border-destructive focus-visible:ring-destructive" : ""}`}
              >
                {tiposDeEmbalagem.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {form.formState.errors.unidade && (
                <p className="text-[13px] text-destructive font-medium">{form.formState.errors.unidade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="quantidadePorEmbalagem" className="text-sm font-medium ui-uppercase">
                Qtd. por embalagem
              </label>
              <Input
                id="quantidadePorEmbalagem"
                type="number"
                min={1}
                {...form.register('quantidadePorEmbalagem', { valueAsNumber: true })}
                placeholder="Ex: 1"
                className={form.formState.errors.quantidadePorEmbalagem ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {form.formState.errors.quantidadePorEmbalagem && (
                <p className="text-[13px] text-destructive font-medium">{form.formState.errors.quantidadePorEmbalagem.message}</p>
              )}
            </div>
          </div>
        </div>

        {genericError && (
          <div role="alert" className="text-[13px] text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
            {genericError}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="ghost" onClick={() => aoSalvar()} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando…' : 'Salvar'}
          </Button>
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
        <Dialog open onClose={cancelarSemCodigo} title="Salvar sem código de barras?">
          <p className="text-sm text-muted-foreground">
            O produto ficará sem GTIN e não aparecerá em buscas por código nem na bipagem.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelarSemCodigo}>
              Cancelar
            </Button>
            <Button type="button" onClick={confirmarSemCodigo} disabled={isPending}>
              {isPending ? 'Salvando…' : 'Salvar sem código'}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  )
}
