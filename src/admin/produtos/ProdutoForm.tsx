import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { produtoSchema, tiposDeEmbalagem, type ProdutoFormValues, type Produto } from './produtos.schema'
import { useCriarProduto, useAtualizarProduto, useLookupProdutoPorGtin } from './produtos.api'
import { SessaoExpiradaError } from '@/shared/api/api-client'
import { useState } from 'react'

type LookupStatus = 'idle' | 'buscando' | 'sugerido' | 'nao-encontrado'

export function ProdutoForm({ aoSalvar, produtoParaEditar }: { aoSalvar: (produtoCriado?: Produto) => void, produtoParaEditar?: Produto }) {
  const isEdit = !!produtoParaEditar
  const criar = useCriarProduto()
  const atualizar = useAtualizarProduto()
  const lookup = useLookupProdutoPorGtin()
  const [genericError, setGenericError] = useState<string | null>(null)
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle')
  
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

  const codigoBarras = useWatch({ control: form.control, name: 'codigoBarras' })

  async function handleLookup() {
    const gtin = form.getValues('codigoBarras')?.trim()
    if (!gtin) return

    setLookupStatus('buscando')
    try {
      const result = await lookup.mutateAsync(gtin)
      if (result) {
        form.setValue('nome', result.nome, { shouldDirty: true, shouldValidate: true })
        setLookupStatus('sugerido')
      } else {
        // 404 do provedor: não encontrado é normal — degrada, não trava.
        setLookupStatus('nao-encontrado')
      }
    } catch {
      // Rede/servidor: mesma degradação uniforme.
      setLookupStatus('nao-encontrado')
    }
  }

  async function aoEnviar(valores: ProdutoFormValues) {
    setGenericError(null)
    try {
      if (isEdit) {
        await atualizar.mutateAsync({ id: produtoParaEditar.id, valores })
        form.reset()
        aoSalvar()
      } else {
        const novo = await criar.mutateAsync(valores)
        form.reset()
        aoSalvar(novo)
      }
    } catch (e: any) {
      // SessaoExpiradaError é transitório: a navegação para /login já aconteceu.
      if (e instanceof SessaoExpiradaError) return
      setGenericError(e.message || 'Erro ao salvar produto')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(aoEnviar)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
        <p className="text-sm text-muted-foreground">{isEdit ? 'Atualize as informações do produto.' : 'Cadastre um novo produto no catálogo.'}</p>
      </div>

      <div className="space-y-4">
        {/* Código de barras primeiro: o fluxo natural é bipar/digitar e deixar o sistema trazer o nome. */}
        <div className="space-y-2">
          <label htmlFor="codigoBarras" className="text-sm font-medium">
            Código de barras (GTIN) <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <div className="flex gap-2">
            <Input
              id="codigoBarras"
              {...form.register('codigoBarras', { onChange: () => setLookupStatus('idle') })}
              placeholder="Ex: 7891234567890"
              className={form.formState.errors.codigoBarras ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleLookup}
              disabled={!codigoBarras?.trim() || lookup.isPending}
            >
              <Search className="mr-2 size-4" />
              {lookup.isPending ? 'Buscando…' : 'Buscar'}
            </Button>
          </div>
          {form.formState.errors.codigoBarras && (
            <p className="text-[13px] text-destructive font-medium">{form.formState.errors.codigoBarras.message}</p>
          )}
          {lookupStatus === 'sugerido' && (
            <p className="text-[13px] text-success font-medium">Nome sugerido pelo código de barras.</p>
          )}
          {lookupStatus === 'nao-encontrado' && (
            <p className="text-[13px] text-muted-foreground">
              Não encontrado — preencha o nome manualmente.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome do produto
          </label>
          <Input 
            id="nome" 
            {...form.register('nome')} 
            placeholder="Ex: Arroz Branco 5kg" 
            className={form.formState.errors.nome ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {form.formState.errors.nome && (
            <p className="text-[13px] text-destructive font-medium">{form.formState.errors.nome.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="unidade" className="text-sm font-medium">
              Embalagem
            </label>
            <select 
              id="unidade" 
              {...form.register('unidade')} 
              className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${form.formState.errors.unidade ? "border-destructive focus-visible:ring-destructive" : ""}`}
            >
              {tiposDeEmbalagem.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            {form.formState.errors.unidade && (
              <p className="text-[13px] text-destructive font-medium">{form.formState.errors.unidade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="quantidadePorEmbalagem" className="text-sm font-medium">
              Qtd. por embalagem
            </label>
            <Input
              id="quantidadePorEmbalagem"
              type="number"
              min={1}
              {...form.register('quantidadePorEmbalagem', { valueAsNumber: true })}
              placeholder="Ex: 1"
              className={form.formState.errors.quantidadePorEmbalagem ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {form.formState.errors.quantidadePorEmbalagem && (
              <p className="text-[13px] text-destructive font-medium">{form.formState.errors.quantidadePorEmbalagem.message}</p>
            )}
          </div>
        </div>
      </div>

      {genericError && (
        <div role="alert" className="text-[13px] text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
          {genericError}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="ghost" onClick={() => aoSalvar()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
