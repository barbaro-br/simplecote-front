import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { PlusCircle } from '@phosphor-icons/react'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useCondicoesPagamento } from '@/admin/condicoes-pagamento/condicoes-pagamento.api'
import { criarCotacaoSchema, type CriarCotacaoValues } from './cotacoes.schema'
import { useCriarCotacao } from './cotacoes.api'

export function NovaCotacaoPageV2() {
  const navigate = useNavigate()
  const criar = useCriarCotacao()
  const { data: condicoesPagamento } = useCondicoesPagamento()
  const [erroServidor, setErroServidor] = useState<string | null>(null)

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
      const nova = await criar.mutateAsync({
        titulo: values.titulo,
        condicaoPagamentoPreferencialId: values.condicaoPagamentoPreferencialId || undefined,
      })
      navigate(`/admin/cotacoes/${nova.id}`)
    } catch (e) {
      tratarErro(e)
    }
  }


  return (
    <div className="p-space-xl max-w-2xl mx-auto space-y-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Nova cotação</h1>
          <p className="text-body-md text-on-surface-variant mt-space-xs">Crie uma nova cotação e convide fornecedores.</p>
        </div>
        <Link to="/admin/cotacoes" className="text-primary hover:underline text-body-sm font-label-md">
          Cancelar
        </Link>
      </div>

      {erroServidor && (
        <div className="bg-error-container text-on-error-container p-space-md rounded-xl text-body-md">
          {erroServidor}
        </div>
      )}

      <div className="bg-surface-container-low rounded-xl p-space-lg shadow-sm border border-surface-container-highest">
        <form onSubmit={handleSubmit(aoCriar)} noValidate className="space-y-space-md">
          <div className="space-y-space-xs flex flex-col">
            <label htmlFor="titulo" className="text-label-md font-label-md text-on-surface">Título da cotação</label>
            <input
              id="titulo"
              {...register('titulo')}
              className={`bg-surface-container-high text-on-surface text-body-md px-space-md py-space-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50 border border-transparent ${errors.titulo ? '!border-error !ring-error' : ''}`}
              placeholder="Ex: Compra semanal de hortifruti"
            />
            {errors.titulo && <span className="text-label-sm text-error">{errors.titulo.message}</span>}
          </div>

          <div className="space-y-space-xs flex flex-col">
            <label htmlFor="condicao" className="text-label-md font-label-md text-on-surface">
              Condição de pagamento preferencial <span className="text-on-surface-variant font-normal">(opcional)</span>
            </label>
            <select
              id="condicao"
              {...register('condicaoPagamentoPreferencialId')}
              className="bg-surface-container-high text-on-surface text-body-md px-space-md py-space-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
            >
              <option value="">Nenhuma</option>
              {condicoesPagamento?.map((c) => (
                <option key={c.id} value={c.id}>{c.descricao}</option>
              ))}
            </select>
          </div>

          <div className="pt-space-md">
            <button
              type="submit"
              disabled={isSubmitting || criar.isPending}
              className="w-full flex items-center justify-center gap-space-xs bg-primary text-on-primary font-label-md px-space-lg py-space-sm rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              {criar.isPending ? 'Criando...' : (
                <>
                  <PlusCircle className="size-5" />
                  Criar cotação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
