import { useState } from 'react'
import { Eye, EyeOff, Pencil } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { useProdutos, useInativarProduto, useAtivarProduto } from './produtos.api'
import { ProdutoForm } from './ProdutoForm'
import type { Produto } from './produtos.schema'

export function ProdutosPage() {
  const { data: produtos, isLoading, error } = useProdutos({ incluirInativos: true })
  const inativar = useInativarProduto()
  const ativar = useAtivarProduto()
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
                <tr
                  key={produto.id}
                  className={`transition-colors hover:bg-muted/40 ${produto.ativo ? '' : 'opacity-50 text-muted-foreground'}`}
                >
                  <td className="px-4 py-3">{produto.nome} {produto.ativo ? '' : '(Inativo)'}</td>
                  <td className="px-4 py-3">{produto.codigoBarras ?? '—'}</td>
                  <td className="px-4 py-3">{produto.unidade}</td>
                  <td className="px-4 py-3 tabular-nums">{produto.quantidadePorEmbalagem}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {produto.ativo ? (
                        <>
                          <IconButton
                            icon={Pencil}
                            label="Editar"
                            onClick={() => abrirEditar(produto)}
                          />
                          <IconButton
                            icon={EyeOff}
                            label="Inativar"
                            onClick={() => inativar.mutate(produto.id)}
                            disabled={inativar.isPending}
                          />
                        </>
                      ) : (
                        <IconButton
                          icon={Eye}
                          label="Ativar"
                          onClick={() => ativar.mutate(produto.id)}
                          disabled={ativar.isPending}
                        />
                      )}
                    </div>
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
