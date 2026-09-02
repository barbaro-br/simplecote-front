import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Copy, PlusCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
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
        <CardHeader className="pb-4 items-start flex-col gap-1">
          <CardTitle>Criar em branco</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">Inicie uma cotação vazia e adicione os itens depois.</p>
        </CardHeader>
        <div className="px-6 pb-6">
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
        </div>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">Ou</span>
        </div>
      </div>

      <Card className="bg-muted/30 border-muted">
        <CardHeader className="pb-4 items-start flex-col gap-1">
          <CardTitle className="text-lg">Duplicar existente</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">Crie uma cópia exata de uma cotação anterior (mesmos itens e convidados).</p>
        </CardHeader>
        <div className="px-6 pb-6 space-y-4">
          <div className="flex gap-3">
            <select
              aria-label="Cotação de origem"
              value={origemId}
              onChange={(e) => setOrigemId(e.target.value)}
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Selecione uma cotação…</option>
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
              <Copy className="mr-2 size-4 text-muted-foreground" />
              {duplicar.isPending ? 'Duplicando…' : 'Duplicar'}
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  )
}
