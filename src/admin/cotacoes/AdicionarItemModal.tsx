import { useState, useMemo, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Dialog } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { useProdutos, useSugestoesCadastro, type SugestaoCatalogoGlobal } from '@/admin/produtos/produtos.api'
import { MagnifyingGlass, X, Package, CircleNotch, Plus, Check, Trash, Pencil, Sparkle } from '@phosphor-icons/react'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useAdicionarItem, useRemoverItem } from './cotacoes.api'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { ItemCotacao } from './cotacoes.schema'
import type { Produto, ValoresIniciaisProduto } from '@/admin/produtos/produtos.schema'

// Reexportado com esse nome aqui porque é onde os consumidores (ItensSection,
// CotacaoDetalhePage) já importam de — o tipo em si mora em produtos.schema
// (ProdutoForm usa o mesmo, sem duplicar).
export type { ValoresIniciaisProduto as PrefillCadastro }

type Props = {
  cotacaoId: string
  itens: ItemCotacao[]
  open: boolean
  onClose: () => void
  aoCadastrarProduto: (prefill?: ValoresIniciaisProduto) => void
  aoEditarProduto: (produto: Produto) => void
}

// Modal de "escolher produtos": cada clique adiciona/remove o item na hora
// (sem rascunho, sem botão de salvar). A quantidade e a remoção fina ficam na
// tabela de itens da própria tela da cotação — aqui é só marcar o que entra.
export function AdicionarItemModal({
  cotacaoId,
  itens,
  open,
  onClose,
  aoCadastrarProduto,
  aoEditarProduto,
}: Props) {
  const { data: produtos } = useProdutos()
  const adicionar = useAdicionarItem(cotacaoId)
  const remover = useRemoverItem(cotacaoId)

  const [search, setSearch] = useState('')

  // Limpa a busca a cada reabertura (o modal continua montado entre aberturas).
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setSearch('')
  }

  // produtoId -> item já na cotação (fonte da verdade: prop `itens`).
  const itemPorProduto = useMemo(() => {
    const map = new Map<string, ItemCotacao>()
    for (const item of itens) map.set(item.produtoId, item)
    return map
  }, [itens])

  const filtrados = useMemo(() => {
    const ativos = (produtos ?? []).filter((p) => p.ativo)
    const s = search.trim().toLowerCase()
    if (!s) return ativos
    // Casa por nome ou por código de barras — `includes` cobre "termina com"
    // (a pessoa dita "os quatro últimos: 3412" no telefone com o representante).
    return ativos.filter(
      (p) =>
        p.nome.toLowerCase().includes(s) ||
        (p.codigoBarras != null && p.codigoBarras.toLowerCase().includes(s)),
    )
  }, [produtos, search])

  // Sem nada no próprio catálogo: sugere do catálogo global (change catalogo-
  // global-de-produtos) — mesmo endpoint do cadastro, só o grupo compartilhado
  // interessa aqui (o "já no seu catálogo" já é o que `filtrados` mostraria).
  const searchDebounced = useDebounce(search, 300)
  const semResultadoProprio = filtrados.length === 0 && searchDebounced.trim().length > 0
  const sugestoesGlobais = useSugestoesCadastro(semResultadoProprio ? searchDebounced : '')
  const listaGlobal = sugestoesGlobais.data?.doCatalogoGlobal ?? []

  function cadastrarDaSugestao(s: SugestaoCatalogoGlobal) {
    aoCadastrarProduto({ nome: s.nome, codigoBarras: s.codigoBarras })
  }

  // Navegação por teclado (seta cima/baixo + Enter) na lista visível — o
  // próprio catálogo quando tem resultado, senão a base compartilhada (mesmo
  // padrão de ProdutoForm.tsx: índice derivado/grampeado, não resetado por
  // effect, pra não cair no lint react(set-state-in-effect)).
  const usandoSugestoesGlobais = filtrados.length === 0 && listaGlobal.length > 0
  const totalNavegavel = usandoSugestoesGlobais ? listaGlobal.length : filtrados.length
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const indiceAtivoClamped = totalNavegavel === 0 ? 0 : Math.min(indiceAtivo, totalNavegavel - 1)
  const itemAtivoRef = useRef<HTMLLIElement>(null)
  useEffect(() => {
    itemAtivoRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [indiceAtivoClamped, usandoSugestoesGlobais])

  function selecionarNoIndice(i: number) {
    if (usandoSugestoesGlobais) {
      const s = listaGlobal[i]
      if (s) cadastrarDaSugestao(s)
    } else {
      const p = filtrados[i]
      if (!p || emVoo.has(p.id)) return
      if (itemPorProduto.has(p.id)) removerProduto(p.id)
      else adicionarProduto(p.id)
    }
  }

  function aoTeclarNaBusca(e: React.KeyboardEvent<HTMLInputElement>) {
    if (totalNavegavel === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceAtivo(Math.min(indiceAtivoClamped + 1, totalNavegavel - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceAtivo(Math.max(indiceAtivoClamped - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selecionarNoIndice(indiceAtivoClamped)
    }
  }

  // Trava só a linha cuja chamada está em voo — as outras seguem clicáveis.
  const [emVoo, setEmVoo] = useState<Set<string>>(new Set())
  const marcarEmVoo = (id: string, ligado: boolean) =>
    setEmVoo((prev) => {
      const proximo = new Set(prev)
      if (ligado) proximo.add(id)
      else proximo.delete(id)
      return proximo
    })

  function tratarErro(e: unknown, acao: 'adicionar' | 'remover') {
    if (e instanceof SessaoExpiradaError) return
    toast.error(
      e instanceof ApiError
        ? e.message
        : `Não foi possível ${acao} o produto. Tente novamente.`,
    )
  }

  async function adicionarProduto(produtoId: string) {
    if (emVoo.has(produtoId) || itemPorProduto.has(produtoId)) return
    marcarEmVoo(produtoId, true)
    try {
      await adicionar.mutateAsync({ produtoId, quantidade: 1 })
    } catch (e) {
      tratarErro(e, 'adicionar')
    } finally {
      marcarEmVoo(produtoId, false)
    }
  }

  async function removerProduto(produtoId: string) {
    const item = itemPorProduto.get(produtoId)
    if (!item || emVoo.has(produtoId)) return
    marcarEmVoo(produtoId, true)
    try {
      await remover.mutateAsync(item.id)
    } catch (e) {
      tratarErro(e, 'remover')
    } finally {
      marcarEmVoo(produtoId, false)
    }
  }

  const qtdNaCotacao = itens.length

  return (
    <Dialog open={open} onClose={onClose} size="xl" ariaLabel="Adicionar Itens">
      <div className="flex flex-col h-[70vh] max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-border shrink-0">
          <div>
            <div className="text-[15px] font-semibold text-foreground">Adicionar Produtos</div>
            <div className="text-xs text-muted-foreground mt-[1px]">
              {qtdNaCotacao === 0
                ? 'Nenhum produto na cotação'
                : `${qtdNaCotacao} produto${qtdNaCotacao !== 1 ? 's' : ''} na cotação · ajuste a quantidade na tela da cotação`}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Busca */}
        <div className="px-6 py-3 border-b border-muted shrink-0">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
              <MagnifyingGlass className="size-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setIndiceAtivo(0)
              }}
              onKeyDown={aoTeclarNaBusca}
              placeholder="Buscar por nome ou código de barras…"
              className="w-full pl-9 pr-3 py-1.5 text-[13px] border border-border rounded-md outline-none text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-background/50 relative">
          <ul className="m-0 p-0 list-none">
            {filtrados.map((p, idx) => {
              const naCotacao = itemPorProduto.has(p.id)
              const ocupado = emVoo.has(p.id)
              const ativo = !usandoSugestoesGlobais && idx === indiceAtivoClamped

              return (
                <li
                  key={p.id}
                  ref={ativo ? itemAtivoRef : undefined}
                  onClick={() => !ocupado && (naCotacao ? removerProduto(p.id) : adicionarProduto(p.id))}
                  onMouseEnter={() => setIndiceAtivo(idx)}
                  className={`flex items-center gap-3 px-5 py-2.5 border-b border-muted transition-colors cursor-pointer ${
                    ativo ? 'bg-accent' : naCotacao ? 'bg-primary/5' : idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'
                  }`}
                >
                  {/* Ícone do produto */}
                  <div
                    className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                      naCotacao ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Package className="size-4" />
                  </div>

                  {/* Nome + embalagem */}
                  <div className="flex flex-col flex-1 min-w-0 mr-2">
                    <div
                      className={`text-[13px] ${naCotacao ? 'font-semibold' : 'font-medium'} text-foreground truncate ui-uppercase`}
                    >
                      {p.nome}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {p.unidade === 'Unidade' && p.quantidadePorEmbalagem === 1
                        ? 'Unidade'
                        : `${p.unidade} com ${p.quantidadePorEmbalagem}`}
                    </div>
                  </div>

                  {/* Editar produto (sem sair da montagem) */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${p.nome}`}
                    onClick={(ev) => {
                      ev.stopPropagation()
                      aoEditarProduto(p)
                    }}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </Button>

                  {/* Ação: adicionar / na cotação + remover */}
                  {naCotacao ? (
                    <div className="flex items-center gap-1 shrink-0" onClick={(ev) => ev.stopPropagation()}>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <Check className="size-3.5" /> Na cotação
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover ${p.nome} da cotação`}
                        disabled={ocupado}
                        onClick={() => removerProduto(p.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        {ocupado ? (
                          <CircleNotch className="size-3.5 animate-spin" />
                        ) : (
                          <Trash className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Adicionar ${p.nome} à cotação`}
                      disabled={ocupado}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        adicionarProduto(p.id)
                      }}
                      className="h-7 shrink-0 text-xs px-2.5 gap-1"
                    >
                      {ocupado ? (
                        <CircleNotch className="size-3.5 animate-spin" />
                      ) : (
                        <Plus className="size-3.5" />
                      )}
                      Adicionar
                    </Button>
                  )}
                </li>
              )
            })}

            {filtrados.length === 0 && search && (
              <>
                <li className="px-6 pt-6 pb-1 text-center text-[13px] text-muted-foreground">
                  Nenhum produto encontrado no seu catálogo.
                </li>

                {listaGlobal.length > 0 && (
                  <>
                    <li className="flex items-center gap-1 px-5 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      <Sparkle className="size-3" weight="fill" /> Achado na base compartilhada
                    </li>
                    {/* Mesmo layout de linha do próprio catálogo (ícone, nome,
                        subtítulo, botão à direita) — só o ícone e a ação mudam,
                        pra não parecer uma lista "diferente" dentro do modal. */}
                    {listaGlobal.map((s, idx) => {
                      const ativo = usandoSugestoesGlobais && idx === indiceAtivoClamped
                      return (
                        <li
                          key={s.codigoBarras}
                          ref={ativo ? itemAtivoRef : undefined}
                          onClick={() => cadastrarDaSugestao(s)}
                          onMouseEnter={() => setIndiceAtivo(idx)}
                          className={`flex items-center gap-3 px-5 py-2.5 border-b border-muted transition-colors cursor-pointer ${
                            ativo ? 'bg-accent' : idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-muted text-muted-foreground">
                            <Sparkle className="size-4" weight="fill" />
                          </div>

                          <div className="flex flex-col flex-1 min-w-0 mr-2">
                            <div className="text-[13px] font-medium text-foreground truncate ui-uppercase">
                              {s.nome}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {s.codigoBarras}
                              {s.marca ? ` · ${s.marca}` : ''}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={`Cadastrar e adicionar ${s.nome}`}
                            onClick={(ev) => {
                              ev.stopPropagation()
                              cadastrarDaSugestao(s)
                            }}
                            className="h-7 shrink-0 text-xs px-2.5 gap-1"
                          >
                            <Plus className="size-3.5" />
                            Adicionar
                          </Button>
                        </li>
                      )
                    })}
                  </>
                )}

                <li className="py-4 text-center">
                  <button
                    type="button"
                    onClick={() => aoCadastrarProduto()}
                    className="text-[13px] text-primary hover:underline font-medium"
                  >
                    Cadastrar novo produto
                  </button>
                </li>
              </>
            )}

            {filtrados.length > 0 && !search && (
              <li className="py-4 text-center">
                <button
                  type="button"
                  onClick={() => aoCadastrarProduto()}
                  className="text-xs text-primary hover:underline"
                >
                  Não achou? Cadastrar novo produto
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-border bg-muted/20 shrink-0 flex justify-end">
          <Button
            onClick={onClose}
            variant="default"
            className="h-8 text-xs px-5 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Concluído
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
