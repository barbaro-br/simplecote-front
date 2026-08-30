import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PackageX } from 'lucide-react'
import { useProdutos } from '@/admin/produtos/produtos.api'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import type { Produto } from '@/admin/produtos/produtos.schema'
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
  const [formAberto, setFormAberto] = useState(false)
  const [cadastroAberto, setCadastroAberto] = useState(false)

  function fecharForm() {
    setFormAberto(false)
    setCadastroAberto(false)
    setProdutoId('')
    setQuantidade('1')
  }

  // Volta do cadastro aninhado: fecha só o 2º modal e deixa o novo Produto
  // pré-selecionado no seletor do "adicionar item" (o 1º modal seguiu montado).
  function aoCadastrarProduto(novo?: Produto) {
    setCadastroAberto(false)
    if (novo) setProdutoId(novo.id)
  }

  async function aoAdicionar() {
    const parsed = adicionarItemSchema.safeParse({ produtoId, quantidade: Number(quantidade) })
    if (!parsed.success) return
    await adicionar.mutateAsync(parsed.data)
    fecharForm()
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Itens</CardTitle>
        {editavel && (
          <Button type="button" onClick={() => setFormAberto(true)} size="sm">
            Adicionar item
          </Button>
        )}
      </CardHeader>

      <Dialog
        open={editavel && formAberto}
        onClose={fecharForm}
        title="Adicionar item"
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="item-produto" className="text-xs text-muted-foreground">
              Produto
            </label>
            <select
              id="item-produto"
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            <button
              type="button"
              onClick={() => setCadastroAberto(true)}
              className="mt-1 text-xs text-primary hover:underline"
            >
              Não achou? Cadastrar novo produto
            </button>
          </div>
          <div>
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={fecharForm}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={aoAdicionar}
              disabled={!produtoId || adicionar.isPending}
            >
              {adicionar.isPending ? 'Adicionando…' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 2º modal: cadastro de Produto sem sair da montagem da Cotação. */}
      <Dialog
        open={editavel && formAberto && cadastroAberto}
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
              itens.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2 font-medium">{item.nomeSnapshot}</td>
                  <td className="px-4 py-2">{item.unidadeSnapshot}</td>
                  <td className="px-4 py-2 tabular-nums">{item.quantidadeSolicitada}</td>
                  {editavel && (
                    <td className="px-4 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
    </Card>
  )
}
