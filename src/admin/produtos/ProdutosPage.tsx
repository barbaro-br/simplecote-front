import { useState } from 'react'
import { Archive, ArchiveRestore, Pencil, PlusCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { PageContainer } from '@/shared/components/layout/PageContainer'
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
    <PageContainer maxWidth="5xl" className="space-y-6">
      <div className="sticky top-0 bg-background z-10 pb-4 pt-4 border-b border-border space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Catálogo de produtos</h1>
            <p className="text-sm text-muted-foreground">Gerencie os produtos, códigos de barra e configurações de embalagem.</p>
          </div>
          <Button onClick={abrirNovo}>
            <PlusCircle className="mr-2 size-4" />
            Novo produto
          </Button>
        </div>
      </div>

      <Dialog
        open={mostrarForm}
        onClose={fecharForm}
        size="lg"
        ariaLabel={produtoEditando ? 'Editar produto' : 'Novo produto'}
      >
        <ProdutoForm aoSalvar={fecharForm} produtoParaEditar={produtoEditando} />
      </Dialog>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-14rem)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="sticky top-0 bg-muted px-4 py-3 font-medium border-b">Nome</th>
                <th className="sticky top-0 bg-muted px-4 py-3 font-medium border-b">Código de barras</th>
                <th className="sticky top-0 bg-muted px-4 py-3 font-medium border-b">Embalagem</th>
                <th className="sticky top-0 bg-muted px-4 py-3 font-medium text-right border-b">Qtd.</th>
                <th className="sticky top-0 bg-muted px-4 py-3 font-medium text-right border-b border-l border-border">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
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
                    className={`transition-colors hover:bg-muted/50 ${produto.ativo ? '' : 'opacity-60 bg-muted/10'}`}
                  >
                    <td className="px-4 py-3 font-medium">
                      {produto.nome}
                      {!produto.ativo && <span className="ml-2 inline-flex items-center rounded-full bg-muted-foreground/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">Inativo</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{produto.codigoBarras ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{produto.unidade}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground text-right">{produto.quantidadePorEmbalagem}</td>
                    <td className="px-4 py-3 text-right border-l border-border">
                      <div className="flex gap-1 justify-end">
                        {produto.ativo ? (
                          <>
                            <IconButton
                              icon={Pencil}
                              label="Editar"
                              onClick={() => abrirEditar(produto)}
                            />
                            <IconButton
                              icon={Archive}
                              label="Inativar"
                              tone="destructive"
                              onClick={() => inativar.mutate(produto.id)}
                              disabled={inativar.isPending}
                            />
                          </>
                        ) : (
                          <IconButton
                            icon={ArchiveRestore}
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
      </Card>
    </PageContainer>
  )
}
