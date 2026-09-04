import { useState, useMemo, useRef } from 'react'
import { Dialog } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { useProdutos } from '@/admin/produtos/produtos.api'
import { Search, X, PackageOpen, Loader2, Plus, Minus, Pencil } from 'lucide-react'
import { useAdicionarItem, useRemoverItem, useAtualizarQuantidadeItem } from './cotacoes.api'
import type { ItemCotacao } from './cotacoes.schema'
import type { Produto } from '@/admin/produtos/produtos.schema'

type Props = {
  cotacaoId: string
  itens: ItemCotacao[]
  open: boolean
  onClose: () => void
  aoCadastrarProduto: () => void
  aoEditarProduto: (produto: Produto) => void
}

export function AdicionarItemModal({ cotacaoId, itens, open, onClose, aoCadastrarProduto, aoEditarProduto }: Props) {
  const { data: produtos } = useProdutos()
  const adicionar = useAdicionarItem(cotacaoId)
  const remover = useRemoverItem(cotacaoId)
  const atualizar = useAtualizarQuantidadeItem(cotacaoId)
  
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  
  // drafts: map de produtoId para a nova quantidade (0 = remover item)
  const [drafts, setDrafts] = useState<Map<string, number>>(new Map())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mapeia os itens atuais da cotação pelo produtoId
  const itensMap = useMemo(() => {
    const map = new Map<string, ItemCotacao>()
    for (const item of itens) {
      map.set(item.produtoId, item)
    }
    return map
  }, [itens])

  // Reset do search e drafts quando abre
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSearch('')
      setDrafts(new Map())
    }
  }

  const handleClose = () => {
    if (drafts.size > 0) {
      if (!window.confirm("Você tem itens modificados que não foram salvos. Tem certeza que deseja sair?")) {
        return
      }
    }
    onClose()
  }

  // Produtos filtrados e ativos
  const filtrados = useMemo(() => {
    const ativos = (produtos ?? []).filter(p => p.ativo)
    const s = search.toLowerCase()
    return ativos.filter(p => p.nome.toLowerCase().includes(s))
  }, [produtos, search])

  const handleToggle = (produtoId: string) => {
    setDrafts(prev => {
      const next = new Map(prev)
      const currentDraft = next.get(produtoId)
      const isOriginalmenteIncluso = itensMap.has(produtoId)

      if (currentDraft !== undefined) {
        // O usuário já tinha interagido com esse item.
        // Se a gente clicar, significa "desmarcar".
        if (isOriginalmenteIncluso) {
          next.set(produtoId, 0) // marcar para remoção
        } else {
          next.delete(produtoId) // apenas desfazer a adição
        }
      } else {
        // Primeira interação com o item
        if (isOriginalmenteIncluso) {
          next.set(produtoId, 0) // marcar para remoção
        } else {
          next.set(produtoId, 1) // marcar para adição
        }
      }
      return next
    })
  }

  const handleChangeQty = (produtoId: string, diff: number) => {
    setDrafts(prev => {
      const next = new Map(prev)
      const currentDraft = next.get(produtoId)
      const originalItem = itensMap.get(produtoId)
      
      const currentQty = currentDraft !== undefined ? currentDraft : (originalItem ? originalItem.quantidadeSolicitada : 1)
      const newQty = Math.max(1, currentQty + diff)
      
      next.set(produtoId, newQty)
      return next
    })
  }
  
  const handleSetQty = (produtoId: string, val: number) => {
    if (val < 1) return;
    setDrafts(prev => {
      const next = new Map(prev)
      next.set(produtoId, val)
      return next
    })
  }

  const handleSave = async () => {
    if (drafts.size === 0) {
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      const promises: Promise<any>[] = []
      
      for (const [produtoId, novaQuantidade] of drafts.entries()) {
        const itemOriginal = itensMap.get(produtoId)
        
        if (itemOriginal) {
          // Já estava na cotação
          if (novaQuantidade === 0) {
            // Remover
            promises.push(remover.mutateAsync(itemOriginal.id))
          } else if (novaQuantidade !== itemOriginal.quantidadeSolicitada) {
            // Editar quantidade
            promises.push(atualizar.mutateAsync({ itemId: itemOriginal.id, quantidade: novaQuantidade }))
          }
        } else {
          // Não estava na cotação
          if (novaQuantidade > 0) {
            promises.push(adicionar.mutateAsync({ produtoId, quantidade: novaQuantidade }))
          }
        }
      }
      
      await Promise.all(promises)
      setDrafts(new Map())
      onClose()
    } catch (e) {
      console.error(e)
      alert("Ocorreu um erro ao salvar os itens.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const qtdSelecionados = (() => {
    let count = 0
    for (const produtoId of itensMap.keys()) {
      if (drafts.get(produtoId) !== 0) count++
    }
    for (const [produtoId, qty] of drafts) {
      if (!itensMap.has(produtoId) && qty > 0) count++
    }
    return count
  })()

  return (
    <Dialog open={open} onClose={handleClose} size="xl" ariaLabel="Adicionar Itens">
      <div className="flex flex-col h-[70vh] max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-border shrink-0">
          <div>
            <div className="text-[15px] font-semibold text-foreground">Adicionar Produtos</div>
            <div className="text-xs text-muted-foreground mt-[1px]">
              {qtdSelecionados === 0
                ? 'Nenhum produto adicionado'
                : `${qtdSelecionados} produto${qtdSelecionados !== 1 ? 's' : ''} na cotação`}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting} className="h-8 w-8 text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-muted shrink-0">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
              <Search className="size-4" />
            </span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={isSubmitting}
              placeholder="Buscar pelo nome do produto..."
              className="w-full pl-9 pr-3 py-1.5 text-[13px] border border-border rounded-md outline-none text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-background/50 relative">
          <ul className="m-0 p-0 list-none">
            {filtrados.map((p, idx) => {
              const originalItem = itensMap.get(p.id)
              const draftQty = drafts.get(p.id)
              
              // O item é considerado "checked" se ele tiver um draft > 0,
              // ou se ele estiver na cotação originalmente E não foi marcado para remoção (draft === 0).
              const isChecked = draftQty !== undefined ? draftQty > 0 : !!originalItem
              const displayQty = draftQty !== undefined ? draftQty : (originalItem ? originalItem.quantidadeSolicitada : 1)

              return (
                <li
                  key={p.id}
                  onClick={() => !isSubmitting && handleToggle(p.id)}
                  className={`flex items-center gap-3 px-5 py-2.5 border-b border-muted transition-colors cursor-pointer ${
                    isChecked ? 'bg-primary/5' : idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="w-[15px] h-[15px] shrink-0 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isSubmitting}
                      onChange={() => handleToggle(p.id)}
                      onClick={ev => ev.stopPropagation()}
                      className="w-[15px] h-[15px] cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Avatar Icon */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <PackageOpen className="size-4" />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 flex items-center justify-between pr-2">
                    <div className="flex flex-col flex-1 min-w-0 mr-2">
                      <div className={`text-[13px] ${isChecked ? 'font-semibold' : 'font-medium'} text-foreground truncate`}>
                        {p.nome}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {p.unidade === 'Unidade' && p.quantidadePorEmbalagem === 1 ? 'Unidade' : `${p.unidade} com ${p.quantidadePorEmbalagem}`}
                      </div>
                    </div>

                    {/* Editar produto (sem sair da montagem) */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${p.nome}`}
                      disabled={isSubmitting}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        onClose()
                        aoEditarProduto(p)
                      }}
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </Button>

                    {/* Quantity Stepper (only visible if checked) */}
                    {isChecked && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={isSubmitting || displayQty <= 1}
                          onClick={() => handleChangeQty(p.id, -1)}
                          className="size-7 h-7 w-7 rounded-full shrink-0 bg-background"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <input
                          type="number"
                          min={1}
                          disabled={isSubmitting}
                          value={displayQty || ''}
                          onChange={(e) => handleSetQty(p.id, parseInt(e.target.value) || 1)}
                          className="h-7 w-12 text-center text-xs px-1 hide-arrows font-medium tabular-nums border border-input rounded-md bg-background"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={isSubmitting}
                          onClick={() => handleChangeQty(p.id, 1)}
                          className="size-7 h-7 w-7 rounded-full shrink-0 bg-background"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}

            {filtrados.length === 0 && search && (
              <div className="py-10 text-center flex flex-col items-center justify-center gap-2">
                <div className="text-[13px] text-muted-foreground">
                  Nenhum produto encontrado.
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => { onClose(); aoCadastrarProduto() }}
                  className="text-[13px] text-primary hover:underline font-medium"
                >
                  Cadastrar novo produto
                </button>
              </div>
            )}
            
            {/* Always show the create shortcut at the bottom if not searching */}
            {filtrados.length > 0 && !search && (
              <div className="py-4 text-center">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => { onClose(); aoCadastrarProduto() }}
                  className="text-xs text-primary hover:underline"
                >
                  Não achou? Cadastrar novo produto
                </button>
              </div>
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-border bg-muted/20 shrink-0 flex justify-end">
          <Button disabled={isSubmitting} onClick={handleSave} variant="default" className="h-8 text-xs px-5 bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting && <Loader2 className="mr-2 size-3 animate-spin" />}
            {isSubmitting ? 'Salvando...' : 'Concluído'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
