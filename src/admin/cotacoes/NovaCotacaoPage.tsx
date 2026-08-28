import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
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
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-semibold">Nova cotação</h1>

      <form onSubmit={handleSubmit(aoCriar)} noValidate className="space-y-4 rounded-md border p-4">
        <div>
          <label htmlFor="titulo" className="text-sm font-medium">
            Título
          </label>
          <Input id="titulo" {...register('titulo')} placeholder="Ex: Compra semanal — hortifruti" />
          {errors.titulo && (
            <p className="text-sm text-destructive mt-1">{errors.titulo.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting || criar.isPending}>
          {criar.isPending ? 'Criando…' : 'Criar cotação'}
        </Button>
      </form>

      <div className="space-y-4 rounded-md border p-4 bg-muted/20">
        <h2 className="text-sm font-medium text-muted-foreground">Duplicar de uma existente</h2>
        <div className="flex gap-2">
          <select
            aria-label="Cotação de origem"
            value={origemId}
            onChange={(e) => setOrigemId(e.target.value)}
            className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Selecione…</option>
            {(cotacoes ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={aoDuplicar}
            disabled={!origemId || duplicar.isPending}
          >
            {duplicar.isPending ? 'Duplicando…' : 'Duplicar'}
          </Button>
        </div>
      </div>

      {erroServidor && (
        <div role="alert" className="text-sm text-destructive">
          {erroServidor}
        </div>
      )}
    </div>
  )
}
