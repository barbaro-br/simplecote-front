import { useState, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { AdicionarItemModal } from './AdicionarItemModal'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PackageX, Trash2, Plus, Minus } from 'lucide-react'
import { useProdutos } from '@/admin/produtos/produtos.api'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import { type ItemCotacao } from './cotacoes.schema'
import { useQueryClient } from '@tanstack/react-query'
import { useRemoverItem } from './cotacoes.api'
import { useInsightProdutos } from '../analise/analise.api'
import { UltimaCompraPopover } from './UltimaCompraPopover'

type Props = {
  cotacaoId: string
  itens: ItemCotacao[]
  /** Só em RASCUNHO os controles de adicionar/remover aparecem. */
  editavel: boolean
}

function Stepper({
  value,
  onChange,
  disabled
}: {
  value: number;
  onChange: (val: number) => void;
  disabled: boolean
}) {
  const [localVal, setLocalVal] = useState<number | ''>(value)

  useEffect(() => {
    setLocalVal(value)
  }, [value])

  const dec = () => {
    if (typeof localVal === 'number' && localVal > 1) {
      const next = localVal - 1
      setLocalVal(next)
      onChange(next)
    }
  }

  const inc = () => {
    const curr = typeof localVal === 'number' ? localVal : 0
    const next = curr + 1
    setLocalVal(next)
    onChange(next)
  }

  const handleBlur = () => {
    if (localVal === '' || localVal < 1) {
      setLocalVal(value)
    } else if (localVal !== value) {
      onChange(localVal)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button  
        type="button"
        variant="outline"
        size="icon"
        className="size-7 h-7 w-7 rounded-full shrink-0"
        onClick={dec}
        disabled={disabled || (typeof localVal === 'number' && localVal <= 1)}
      >
        <Minus className="size-3" />
      </Button>
      <Input
        type="number"
        min={1}
        className="h-7 w-12 text-center text-sm px-1 hide-arrows font-medium tabular-nums"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
        onBlur={handleBlur}
        disabled={disabled}
      />
      <Button  
        type="button"
        variant="outline"
        size="icon"
        className="size-7 h-7 w-7 rounded-full shrink-0"
        onClick={inc}
        disabled={disabled}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  )
}

export function ItensSection({ cotacaoId, itens, editavel }: Props) {
  const { data: produtos } = useProdutos()
  
  
  const remover = useRemoverItem(cotacaoId)
  const queryClient = useQueryClient()
  const useEdit = {
    isPending: false,
    mutate: ({ itemId, quantidade }: { itemId: string, quantidade: number }) => {
      queryClient.setQueryData(['cotacao', cotacaoId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          itens: old.itens.map((i: any) => i.id === itemId ? { ...i, quantidadeSolicitada: quantidade } : i)
        }
      })
    }
  }

  const [formAberto, setFormAberto] = useState(false)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  
  const ids = itens.map(i => i.produtoId)
  const query = useInsightProdutos(ids)

  function fecharForm() {
    setFormAberto(false)
  }

  function abrirCadastro() {
    setFormAberto(false) // Close the items list modal
    setCadastroAberto(true) // Open the product creation modal
  }

  function aoCadastrarProduto() {
    setCadastroAberto(false)
    setFormAberto(true) // Re-open the items list modal after creating
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Itens</CardTitle>
        {editavel && (
          <Button   type="button" onClick={() => setFormAberto(true)} size="sm">
            Adicionar item
          </Button>
        )}
      </CardHeader>

      <AdicionarItemModal
        cotacaoId={cotacaoId}
        itens={itens}
        open={editavel && formAberto}
        onClose={fecharForm}
        aoCadastrarProduto={abrirCadastro}
      />

      {/* 2º modal: cadastro de Produto sem sair da montagem da Cotação. */}
      <Dialog
        open={editavel && cadastroAberto}
        onClose={() => setCadastroAberto(false)}
        size="lg"
        ariaLabel="Cadastrar novo produto"
      >
        <ProdutoForm aoSalvar={aoCadastrarProduto} />
      </Dialog>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Produto</th>
              <th className="px-4 py-2 font-medium">Embalagem</th>
              <th className="px-4 py-2 font-medium">Qtd. solicitada</th>
              {editavel && <th className="px-4 py-2 font-medium text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!itens.length ? (
              <tr>
                <td colSpan={editavel ? 4 : 3} className="px-4 py-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PackageX className="size-8 text-muted-foreground/50" />
                    <p>Nenhum item adicionado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              itens.map((item) => {
                const insight = query.data?.[item.produtoId] ?? null
                
                const liveProd = (produtos || []).find(p => p.id === item.produtoId);
                const uRaw = (editavel && liveProd) ? liveProd.unidade : item.unidadeSnapshot;
                const qt = (editavel && liveProd) ? liveProd.quantidadePorEmbalagem : item.quantidadePorEmbalagemSnapshot;
                const tipoUnidade = uRaw.toUpperCase() === 'UNIDADE' ? 'UNITÁRIO' : uRaw.toUpperCase();
                
                const temCom = tipoUnidade.includes("COM"); 
                const formatoEmbalagem = qt === 1 ? `${tipoUnidade} ${qt}` : `${tipoUnidade}${temCom ? "" : " COM"} ${qt}`;

                return (
                  <tr key={item.id} className="even:bg-muted/50 hover:bg-muted transition-colors group">
                    <td className="px-4 py-2 font-medium">
                      <UltimaCompraPopover item={{ nome: item.nomeSnapshot } as any} insight={insight} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ring-border text-foreground">
                        {formatoEmbalagem}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editavel ? (
                        <Stepper
                          value={item.quantidadeSolicitada}
                          onChange={(v) => useEdit.mutate({ itemId: item.id, quantidade: v })}
                          disabled={useEdit.isPending}
                        />
                      ) : (
                        item.quantidadeSolicitada
                      )}
                    </td>
                    {editavel && (
                      <td className="px-4 py-2 text-right">
                        <Button  
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => remover.mutate(item.id)}
                          disabled={remover.isPending}
                          aria-label="Remover"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

