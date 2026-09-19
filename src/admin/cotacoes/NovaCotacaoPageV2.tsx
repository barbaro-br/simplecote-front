import { ArrowLeft, FilePlus, WarningCircle, Faders, FileText, Warning, Money, CaretDown, PlusCircle } from "@phosphor-icons/react"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { useCondicoesPagamento } from '@/admin/condicoes-pagamento/condicoes-pagamento.api'
import { criarCotacaoSchema, type CriarCotacaoValues } from './cotacoes.schema'
import { useCriarCotacao } from './cotacoes.api'

const SUGESTOES_TITULOS = [
  'Compra Semanal',
  'Hortifrúti & Frutas',
  'Carnes & Açougue',
  'Laticínios & Frios',
  'Bebidas & Mercearia',
  'Higiene & Limpeza',
]

export function NovaCotacaoPageV2() {
  const navigate = useNavigate()
  const criar = useCriarCotacao()
  const { data: condicoesPagamento } = useCondicoesPagamento()
  const [erroServidor, setErroServidor] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CriarCotacaoValues>({
    resolver: zodResolver(criarCotacaoSchema),
    defaultValues: {
      titulo: '',
      condicaoPagamentoPreferencialId: '',
    },
  })

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
    <div className="py-6 px-4 sm:px-6 max-w-2xl mx-auto space-y-6 text-on-surface">
      {/* Botão sutil de voltar */}
      <div>
        <Link
          to="/admin/cotacoes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft weight="bold" className="text-[18px]" />
          Voltar para Cotações
        </Link>
      </div>

      {/* Cabeçalho da Página no estilo executivo / cotações v2 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(78,222,163,0.2)] shrink-0">
            <FilePlus weight="bold" className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              Nova Cotação
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Crie a rodada de preços, adicione itens e convide fornecedores para disputar.
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de erro da API se houver */}
      {erroServidor && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-none text-xs sm:text-sm flex items-center gap-2">
          <WarningCircle weight="bold" className="text-lg shrink-0" />
          <span>{erroServidor}</span>
        </div>
      )}

      {/* Formulário Principal em Card de Planilha Contábil Rígida */}
      <div className="rounded-none border border-white/15 bg-[#0d1410] shadow-2xl overflow-hidden">
        {/* Barra de título do formulário */}
        <div className="px-5 py-3 border-b border-white/10 bg-[#16211a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Faders weight="bold" className="text-primary text-[18px]" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Definições da Cotação
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Rascunho Inicial
          </span>
        </div>

        <form onSubmit={handleSubmit(aoCriar)} noValidate className="p-5 sm:p-6 space-y-6">
          {/* Campo 1: Título da cotação */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="titulo" className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <FileText weight="bold" className="text-base text-primary" />
                Título
              </label>
              <span className="text-[10px] text-primary/80 font-semibold uppercase">Obrigatório</span>
            </div>

            <input
              id="titulo"
              {...register('titulo')}
              className={`w-full bg-[#14231a] text-on-surface text-sm sm:text-base font-medium px-4 py-3 rounded-none border border-white/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner placeholder:text-on-surface-variant/40 transition-all ${
                errors.titulo ? '!border-rose-500 !ring-rose-500' : ''
              }`}
              placeholder="Ex: Compra semanal de hortifruti e mercearia"
              autoFocus
            />

            {errors.titulo && (
              <p className="text-xs text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                <Warning weight="bold" className="text-sm" />
                {errors.titulo.message}
              </p>
            )}

            {/* Sugestões Rápidas de Títulos */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider block mb-1.5">
                Sugestões Rápidas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGESTOES_TITULOS.map((sugestao) => (
                  <button
                    key={sugestao}
                    type="button"
                    onClick={() => setValue('titulo', sugestao, { shouldValidate: true })}
                    className="px-2.5 py-1 rounded-none text-xs font-medium bg-white/[0.04] hover:bg-primary/20 hover:text-primary hover:border-primary/40 border border-white/10 text-on-surface-variant transition-all cursor-pointer select-none"
                  >
                    + {sugestao}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campo 2: Condição de Pagamento Preferencial */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label htmlFor="condicao" className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <Money weight="bold" className="text-base text-primary" />
                Condição de pagamento preferencial
                <span className="text-on-surface-variant font-normal normal-case text-[11px]">(opcional)</span>
              </label>
            </div>

            <div className="relative">
              <select
                id="condicao"
                {...register('condicaoPagamentoPreferencialId')}
                className="w-full bg-[#14231a] text-on-surface text-sm px-4 py-3 rounded-none border border-white/15 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer pr-10 shadow-inner"
              >
                <option value="" className="bg-[#0f1712] text-on-surface-variant">
                  Nenhuma condição preferencial (livre)
                </option>
                {condicoesPagamento?.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0f1712] text-on-surface">
                    {c.descricao}
                  </option>
                ))}
              </select>
              <CaretDown weight="bold" className="text-muted-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-lg" />
            </div>

            <p className="text-[11px] text-on-surface-variant/70">
              Informa aos fornecedores o prazo habitual da sua empresa. Os participantes ainda poderão sugerir outras condições ao responder.
            </p>
          </div>

          {/* Rodapé de Ações */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Link
              to="/admin/cotacoes"
              className="px-4 py-2.5 rounded-none text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-white/10 transition-colors text-center cursor-pointer"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || criar.isPending}
              className="px-6 py-2.5 rounded-none bg-primary hover:bg-primary/90 text-black font-bold text-xs sm:text-sm shadow-[0_0_18px_rgba(78,222,163,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {criar.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Criando cotação…
                </>
              ) : (
                <>
                  <PlusCircle weight="bold" className="text-lg" />
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
