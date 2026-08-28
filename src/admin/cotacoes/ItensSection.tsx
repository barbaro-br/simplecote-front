import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useProdutos } from '@/admin/produtos/produtos.api'
import { adicionarItemSchema, type ItemCotacao } from './cotacoes.schema'
import { useAdicionarItem, useRemoverItem } from './cotacoes.api'

type Props = {
  cotacaoId: string
  itens: ItemCotacao[]
  /** Só em RASCUNHO os controles de adicionar/remover aparecem. */
  editavel: boolean
}

export function ItensSection({ cotacaoId, itens, editavel }: Props) {
  const { data: produtos } = useProdutos()
  const adicionar = useAdicionarItem(cotacaoId)
  const remover = useRemoverItem(cotacaoId)
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('1')

  async function aoAdicionar() {
    const parsed = adicionarItemSchema.safeParse({ produtoId, quantidade: Number(quantidade) })
    if (!parsed.success) return
    await adicionar.mutateAsync(parsed.data)
    setProdutoId('')
    setQuantidade('1')
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Itens</h2>

      {editavel && (
        <div className="flex flex-wrap items-end gap-2 rounded-md border p-3 bg-muted/20">
          <div className="flex-1 min-w-48">
            <label htmlFor="item-produto" className="text-xs text-muted-foreground">
              Produto
            </label>
            <select
              id="item-produto"
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Selecione…</option>
              {(produtos ?? [])
                .filter((p) => p.ativo)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
            </select>
          </div>
          <div className="w-28">
            <label htmlFor="item-qtd" className="text-xs text-muted-foreground">
              Quantidade
            </label>
            <Input
              id="item-qtd"
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={aoAdicionar}
            disabled={!produtoId || adicionar.isPending}
          >
            {adicionar.isPending ? 'Adicionando…' : 'Adicionar item'}
          </Button>
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Produto</th>
              <th className="px-4 py-2 font-medium">Embalagem</th>
              <th className="px-4 py-2 font-medium">Qtd. solicitada</th>
              {editavel && <th className="px-4 py-2 font-medium text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {!itens.length ? (
              <tr>
                <td colSpan={editavel ? 4 : 3} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum item.
                </td>
              </tr>
            ) : (
              itens.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">{item.nomeSnapshot}</td>
                  <td className="px-4 py-2">{item.unidadeSnapshot}</td>
                  <td className="px-4 py-2 tabular-nums">{item.quantidadeSolicitada}</td>
                  {editavel && (
                    <td className="px-4 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remover.mutate(item.id)}
                        disabled={remover.isPending}
                      >
                        Remover
                      </Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
