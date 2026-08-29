import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { useProdutos, useInativarProduto } from './produtos.api'
import { ProdutoForm } from './ProdutoForm'
import type { Produto } from './produtos.schema'

export function ProdutosPage() {
  const { data: produtos, isLoading, error } = useProdutos()
  const inativar = useInativarProduto()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<Produto | undefined>(undefined)

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando catálogo…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar produtos: {error.message}</p>

  function abrirNovo() {
    setProdutoEditando(undefined)
    setMostrarForm(true)
  }

  function abrirEditar(produto: Produto) {
    setProdutoEditando(produto)
    setMostrarForm(true)
  }

  function fecharForm() {
    setMostrarForm(false)
    setProdutoEditando(undefined)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Catálogo de produtos</h1>
        <Button onClick={abrirNovo}>Novo produto</Button>
      </div>

      <Dialog
        open={mostrarForm}
        onClose={fecharForm}
        size="lg"
        ariaLabel={produtoEditando ? 'Editar produto' : 'Novo produto'}
      >
        <ProdutoForm aoSalvar={fecharForm} produtoParaEditar={produtoEditando} />
      </Dialog>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Código de barras</th>
              <th className="px-4 py-3 font-medium">Embalagem</th>
              <th className="px-4 py-3 font-medium">Qtd./embalagem</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!produtos?.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id} className={produto.ativo ? 'hover:bg-muted/40 transition-colors' : 'opacity-50'}>
                  <td className="px-4 py-3">{produto.nome} {produto.ativo ? '' : '(Inativo)'}</td>
                  <td className="px-4 py-3">{produto.codigoBarras ?? '—'}</td>
                  <td className="px-4 py-3">{produto.unidade}</td>
                  <td className="px-4 py-3 tabular-nums">{produto.quantidadePorEmbalagem}</td>
                  <td className="px-4 py-3 text-right">
                    {produto.ativo && (
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => abrirEditar(produto)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => inativar.mutate(produto.id)}
                          disabled={inativar.isPending}
                        >
                          Inativar
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
