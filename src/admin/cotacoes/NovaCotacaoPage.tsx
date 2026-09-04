import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Copy, PlusCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card } from '@/shared/components/ui/card'
import { Combobox } from '@/shared/components/ui/combobox'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { criarCotacaoSchema, type CriarCotacaoValues } from './cotacoes.schema'
import { useCotacoes, useCriarCotacao, useDuplicarCotacao } from './cotacoes.api'

export function NovaCotacaoPage() {
  const navigate = useNavigate()
  const criar = useCriarCotacao()
  const duplicar = useDuplicarCotacao()
  const { data: cotacoes } = useCotacoes()
  const [erroServidor, setErroServidor] = useState<string | null>(null)
  const [origemId, setOrigemId] = useState('')
  const [modo, setModo] = useState<'branco' | 'duplicar'>('branco')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CriarCotacaoValues>({ resolver: zodResolver(criarCotacaoSchema) })

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    if (e instanceof ApiError) setErroServidor(e.message)
    else setErroServidor('Erro inesperado. Tente novamente.')
  }

  async function aoCriar(values: CriarCotacaoValues) {
    setErroServidor(null)
    try {
      const nova = await criar.mutateAsync(values)
      navigate(`/admin/cotacoes/${nova.id}`)
    } catch (e) {
      tratarErro(e)
    }
  }

  async function aoDuplicar() {
    if (!origemId) return
    setErroServidor(null)
    try {
      const { cotacao } = await duplicar.mutateAsync(origemId)
      navigate(`/admin/cotacoes/${cotacao.id}`)
    } catch (e) {
      tratarErro(e)
    }
  }

  return (
    <PageContainer maxWidth="lg" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Nova cotação</h1>
        <Link to="/admin/cotacoes" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">
          ← Cancelar
        </Link>
      </div>

      {erroServidor && (
        <div role="alert" className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
          {erroServidor}
        </div>
      )}

      <Card>
        <div
          role="tablist"
          aria-label="Modo de criação"
          className="grid grid-cols-2 gap-1 rounded-t-xl bg-muted p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'branco'}
            onClick={() => setModo('branco')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              modo === 'branco'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Em branco
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'duplicar'}
            onClick={() => setModo('duplicar')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              modo === 'duplicar'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Duplicar existente
          </button>
        </div>

        <div className="p-6">
          {modo === 'branco' ? (
            <form onSubmit={handleSubmit(aoCriar)} noValidate className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="titulo" className="text-sm font-medium">
                  Título
                </label>
                <Input 
                  id="titulo" 
                  {...register('titulo')} 
                  placeholder="Ex: Compra semanal — hortifruti" 
                  className={errors.titulo ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.titulo && (
                  <p className="text-[13px] text-destructive font-medium">{errors.titulo.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isSubmitting || criar.isPending} className="w-full">
                <PlusCircle className="mr-2 size-4" />
                {criar.isPending ? 'Criando…' : 'Criar cotação'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="origem" className="text-sm font-medium">
                  Cotação de origem
                </label>
                <Combobox
                  id="origem"
                  options={(cotacoes ?? []).map((c) => ({ value: c.id, label: c.titulo }))}
                  value={origemId}
                  onChange={setOrigemId}
                  placeholder="Selecione uma cotação…"
                  emptyMessage="Nenhuma cotação encontrada"
                />
              </div>
              <Button
                type="button"
                onClick={aoDuplicar}
                disabled={!origemId || duplicar.isPending}
                className="w-full"
              >
                <Copy className="mr-2 size-4" />
                {duplicar.isPending ? 'Duplicando…' : 'Duplicar cotação'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  )
}
