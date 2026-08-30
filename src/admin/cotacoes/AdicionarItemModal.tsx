import { useState, useMemo, useEffect, useRef } from 'react'
import { Dialog } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { useProdutos } from '@/admin/produtos/produtos.api'
import { Search, X, PackageOpen, Loader2 } from 'lucide-react'
import { useAdicionarItem, useRemoverItem } from './cotacoes.api'
import type { ItemCotacao } from './cotacoes.schema'

type Props = {
  cotacaoId: string
  itens: ItemCotacao[]
  open: boolean
  onClose: () => void
  aoCadastrarProduto: () => void
}

export function AdicionarItemModal({ cotacaoId, itens, open, onClose, aoCadastrarProduto }: Props) {
  const { data: produtos } = useProdutos()
  const adicionar = useAdicionarItem(cotacaoId)
  const remover = useRemoverItem(cotacaoId)
  
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Mapeia os itens da cotação pelo produtoId para ver o que já está adicionado
  const itensMap = useMemo(() => {
    const map = new Map<string, ItemCotacao>()
    for (const item of itens) {
      map.set(item.produtoId, item)
    }
    return map
  }, [itens])

  // Reset do search quando abre
  useEffect(() => {
    if (open) {
      setSearch('')
    }
  }, [open])

  // Produtos filtrados e ativos
  const filtrados = useMemo(() => {
    const ativos = (produtos ?? []).filter(p => p.ativo)
    const s = search.toLowerCase()
    return ativos.filter(p => p.nome.toLowerCase().includes(s))
  }, [produtos, search])

  const toggleProduto = (produtoId: string) => {
    // Evita duplo clique rápido
    if (processingIds.has(produtoId)) return

    const itemExistente = itensMap.get(produtoId)
    
    setProcessingIds(prev => new Set(prev).add(produtoId))

    if (itemExistente) {
      // Remover
      remover.mutate(itemExistente.id, {
        onSettled: () => {
          setProcessingIds(prev => {
            const next = new Set(prev)
            next.delete(produtoId)
            return next
          })
        }
      })
    } else {
      // Adicionar com qtd 1
      adicionar.mutate({ produtoId, quantidade: 1 }, {
        onSettled: () => {
          setProcessingIds(prev => {
            const next = new Set(prev)
            next.delete(produtoId)
            return next
          })
        }
      })
    }
  }

  const qtdSelecionados = itens.length

  return (
    <Dialog open={open} onClose={onClose} size="lg" ariaLabel="Adicionar Itens">
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
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground">
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
              placeholder="Buscar pelo nome do produto..."
              className="w-full pl-9 pr-3 py-1.5 text-[13px] border border-border rounded-md outline-none text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-background/50 relative">
          <ul className="m-0 p-0 list-none">
            {filtrados.map((p, idx) => {
              const isChecked = itensMap.has(p.id)
              const isProcessing = processingIds.has(p.id)

              return (
                <li
                  key={p.id}
                  onClick={() => toggleProduto(p.id)}
                  className={`flex items-center gap-3 px-5 py-2.5 border-b border-muted transition-colors cursor-pointer ${
                    isChecked ? 'bg-primary/5' : idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                  }`}
                >
                  {/* Checkbox / Loading Spinner */}
                  <div className="w-[15px] h-[15px] shrink-0 flex items-center justify-center">
                    {isProcessing ? (
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                    ) : (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProduto(p.id)}
                        onClick={ev => ev.stopPropagation()}
                        className="w-[15px] h-[15px] cursor-pointer accent-primary"
                      />
                    )}
                  </div>

                  {/* Avatar Icon */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <PackageOpen className="size-4" />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] ${isChecked ? 'font-semibold' : 'font-medium'} text-foreground truncate`}>
                      {p.nome}
                    </div>
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
          <Button onClick={onClose} variant="default" className="h-8 text-xs px-5 bg-primary hover:bg-primary/90 text-primary-foreground">
            Concluído
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
