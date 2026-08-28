import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { produtoSchema, tiposDeEmbalagem, type ProdutoFormValues, type Produto } from './produtos.schema'
import { useCriarProduto, useAtualizarProduto, useLookupProduto } from './produtos.api'
import { SessaoExpiradaError } from '@/shared/api/api-client'
import { useState } from 'react'

export function ProdutoForm({ aoSalvar, produtoParaEditar }: { aoSalvar: () => void, produtoParaEditar?: Produto }) {
  const isEdit = !!produtoParaEditar
  const criar = useCriarProduto()
  const atualizar = useAtualizarProduto()
  const lookup = useLookupProduto()
  const [genericError, setGenericError] = useState<string | null>(null)
  
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

  async function handleLookup() {
    const gtin = form.getValues('codigoBarras')
    if (!gtin) return
    
    try {
      const result = await lookup.mutateAsync(gtin)
      if (result) {
        form.setValue('nome', result.nome, { shouldValidate: true })
      }
    } catch (e) {
      // Degrada graciosamente
      console.warn('Falha no lookup', e)
    }
  }

  async function aoEnviar(valores: ProdutoFormValues) {
    setGenericError(null)
    try {
      if (isEdit) {
        await atualizar.mutateAsync({ id: produtoParaEditar.id, valores })
      } else {
        await criar.mutateAsync(valores)
      }
      form.reset()
      aoSalvar()
    } catch (e: any) {
      // SessaoExpiradaError é transitório: a navegação para /login já aconteceu.
      if (e instanceof SessaoExpiradaError) return
      setGenericError(e.message || 'Erro ao salvar produto')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} className="space-y-4 rounded-md border p-4 bg-muted/20">
      <h2 className="text-lg font-medium">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
      
      <div>
        <Input {...form.register('nome')} placeholder="Nome do produto" />
        {form.formState.errors.nome && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.nome.message}</p>
        )}
      </div>

      <div>
        <div className="flex gap-2">
          <Input {...form.register('codigoBarras')} placeholder="Código de barras (GTIN)" />
          <Button type="button" variant="outline" onClick={handleLookup} disabled={lookup.isPending}>
            {lookup.isPending ? 'Buscando...' : 'Buscar Nome'}
          </Button>
        </div>
        {form.formState.errors.codigoBarras && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.codigoBarras.message}</p>
        )}
      </div>

      <select {...form.register('unidade')} className="border-input h-9 w-full rounded-md border px-3 bg-transparent text-sm">
        {tiposDeEmbalagem.map((tipo) => (
          <option key={tipo} value={tipo}>{tipo}</option>
        ))}
      </select>
      {form.formState.errors.unidade && (
        <p className="text-sm text-destructive mt-1">{form.formState.errors.unidade.message}</p>
      )}

      <div>
        <Input
          type="number"
          min={1}
          {...form.register('quantidadePorEmbalagem', { valueAsNumber: true })}
          placeholder="Quantidade por embalagem"
        />
        {form.formState.errors.quantidadePorEmbalagem && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.quantidadePorEmbalagem.message}</p>
        )}
      </div>

      {genericError && <p className="text-sm text-destructive">{genericError}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={aoSalvar} disabled={isPending}>Cancelar</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
