import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCotacoes, useExcluirCotacao, useDuplicarCotacao } from './cotacoes.api'
import { chaveMes, mesAnoBr, dataHoraBr, moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { Icon, Button, Modal, Spinner } from './v2/ui-v2'
import { Tooltip } from '@/shared/components/ui/tooltip'
import { useToast } from './v2/Toast-v2'

const STATUS_FILTROS: { valor: StatusCotacao | ''; rotulo: string; icon: string }[] = [
  { valor: '', rotulo: 'Todas', icon: 'list_alt' },
  { valor: 'ABERTA', rotulo: 'Abertas', icon: 'sensors' },
  { valor: 'ENCERRADA', rotulo: 'Encerradas', icon: 'timer_off' },
  { valor: 'PEDIDOS_GERADOS', rotulo: 'Pedidos Gerados', icon: 'task_alt' },
  { valor: 'RASCUNHO', rotulo: 'Rascunhos', icon: 'edit_document' },
  { valor: 'CANCELADA', rotulo: 'Canceladas', icon: 'cancel' },
]

export function CotacoesPageV2() {
  const navigate = useNavigate()
  const { mostrar } = useToast()
  const [params, setParams] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [idAExcluir, setIdAExcluir] = useState<string | null>(null)

  const statusParam = params.get('status') ?? ''
  const filtro = STATUS_FILTROS.some((s) => s.valor === statusParam) ? statusParam : ''

  function setFiltro(status: string) {
    setParams((p) => {
      if (status) p.set('status', status)
      else p.delete('status')
      p.delete('mes')
      return p
    })
  }

  function setMes(novoMes: string) {
    setParams((p) => {
      if (novoMes) p.set('mes', novoMes)
      else p.delete('mes')
      return p
    })
  }

  const { data, isLoading, error, isFetching, refetch } = useCotacoes()
  const excluir = useExcluirCotacao()
  const duplicar = useDuplicarCotacao()

  const base = useMemo(() => data ?? [], [data])
  const total = base.length

  // Métricas rápidas do dashboard
  const metricas = useMemo(() => {
    let abertas = 0
    let encerradas = 0
    let pedidosGerados = 0
    let rascunhos = 0
    let totalComprado = 0

    for (const c of base) {
      if (c.status === 'ABERTA') abertas++
      else if (c.status === 'ENCERRADA') encerradas++
      else if (c.status === 'PEDIDOS_GERADOS') {
        pedidosGerados++
        totalComprado += c.valorTotalComprado ?? 0
      } else if (c.status === 'RASCUNHO') rascunhos++
    }

    return { abertas, encerradas, pedidosGerados, rascunhos, totalComprado }
  }, [base])

  const mesesDisponiveis = useMemo(() => {
    const set = new Set<string>()
    for (const c of base) {
      if (c.prazo && (!filtro || c.status === filtro)) {
        set.add(chaveMes(c.prazo))
      }
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [base, filtro])

  const mesParam = params.get('mes') ?? ''
  const mes = mesesDisponiveis.includes(mesParam) ? mesParam : ''

  const lista = useMemo(() => {
    return base
      .filter((c) => filtro === '' || c.status === filtro)
      .filter((c) => mes === '' || (c.prazo != null && chaveMes(c.prazo) === mes))
      .filter((c) => busca.trim() === '' || c.titulo.toLowerCase().includes(busca.trim().toLowerCase()))
  }, [base, filtro, mes, busca])

  async function aoExcluirConfirmado() {
    if (!idAExcluir) return
    try {
      await excluir.mutateAsync(idAExcluir)
      mostrar('Cotação excluída com sucesso.')
      setIdAExcluir(null)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      mostrar(e instanceof ApiError ? e.message : 'Falha ao excluir a cotação.', 'erro')
      setIdAExcluir(null)
    }
  }

  async function aoDuplicar(id: string) {
    try {
      const res = await duplicar.mutateAsync(id)
      mostrar('Cotação duplicada com sucesso.')
      if (res?.cotacao?.id) {
        navigate(`/admin/cotacoes/${res.cotacao.id}`)
      }
    } catch (e) {
      mostrar(e instanceof ApiError ? e.message : 'Falha ao duplicar cotação.', 'erro')
    }
  }

  return (
    <div className="flex flex-col min-h-0 flex-1 max-w-7xl mx-auto w-full h-full min-w-0 overflow-hidden pr-1 pb-1 space-y-3">
      {/* ============================================================ */}
      {/* 1. Header do Painel de Cotações                              */}
      {/* ============================================================ */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">Cotações</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Grade Contábil
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Gerencie cotações abertas, acompanhe lances em tempo real e consolide pedidos de compra.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            onClick={() => refetch()}
            disabled={isFetching}
            className="!py-2 !px-3 text-xs border border-white/10"
            title="Atualizar lista"
          >
            <Icon name="refresh" className={`text-base ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Link to="/admin/cotacoes/nova">
            <Button className="!py-2 !px-4 text-xs font-bold shadow-[0_0_15px_rgba(78,222,163,0.35)]">
              <Icon name="add" className="text-base" />
              Nova Cotação
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Barra de Métricas Superiores (Kpis Compactos)             */}
      {/* ============================================================ */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-[#121a14] border border-white/10 rounded-xl p-2.5 shadow-sm">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="list_alt" className="text-base" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">Total de Cotações</div>
            <div className="text-sm sm:text-base font-bold font-mono text-on-surface truncate">{total}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-l border-white/5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <Icon name="sensors" className="text-base animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">Abertas (Ao Vivo)</div>
            <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 truncate">
              {metricas.abertas} {metricas.abertas === 1 ? 'ativa' : 'ativas'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-l border-white/5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-300 shrink-0">
            <Icon name="timer_off" className="text-base" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">Prontas para Apurar</div>
            <div className="text-sm sm:text-base font-bold font-mono text-amber-300 truncate">
              {metricas.encerradas} {metricas.encerradas === 1 ? 'encerrada' : 'encerradas'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2 border-l border-white/5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="payments" className="text-base" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">Total Comprado</div>
            <div className="text-sm sm:text-base font-bold font-mono text-primary truncate">
              {moeda(metricas.totalComprado)}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Filtros Rápidos (Pills) e Busca Instantânea               */}
      {/* ============================================================ */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 select-none overflow-x-auto max-w-full">
          {STATUS_FILTROS.map((f) => {
            const ativo = filtro === f.valor
            return (
              <button
                key={f.valor}
                type="button"
                onClick={() => setFiltro(f.valor)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  ativo
                    ? 'bg-primary text-black font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <Icon name={f.icon} className="text-[14px]" />
                {f.rotulo}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial justify-end">
          {mesesDisponiveis.length > 0 && (
            <select
              id="filtro-mes"
              name="filtro-mes"
              aria-label="Filtrar por mês"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="h-8 rounded-xl border border-white/15 bg-black/40 px-3 text-xs font-medium text-on-surface outline-none focus:border-primary cursor-pointer shrink-0"
            >
              <option value="" className="bg-[#121a14] text-on-surface">Todos os meses</option>
              {mesesDisponiveis.map((m) => (
                <option key={m} value={m} className="bg-[#121a14] text-on-surface">
                  {mesAnoBr(m)}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-48 sm:w-64 shrink-0">
            <Icon
              name="search"
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]"
            />
            <input
              type="search"
              placeholder="Buscar por título…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-xl border border-white/15 bg-black/40 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. Planilha Contábil de Cotações                             */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-white/10 bg-[#111813]/60 shadow-inner">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <Spinner />
            <p className="text-xs text-on-surface-variant">Carregando cotações…</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <Icon name="error" className="text-3xl text-red-400 mx-auto" />
            <p className="text-sm font-medium text-on-surface">Falha ao carregar as cotações</p>
            <p className="text-xs text-on-surface-variant">Verifique sua conexão e tente novamente.</p>
            <Button variant="ghost" onClick={() => refetch()} className="!py-1.5 !px-3 text-xs border border-white/10">
              <Icon name="refresh" className="text-base" /> Tentar novamente
            </Button>
          </div>
        ) : !lista.length ? (
          <div className="p-12 text-center space-y-3">
            <Icon name="inbox" className="text-3xl text-on-surface-variant/40 mx-auto" />
            <p className="text-sm font-medium text-on-surface">
              {total === 0 ? 'Nenhuma cotação criada ainda' : 'Nenhuma cotação encontrada para os filtros selecionados'}
            </p>
            {total === 0 ? (
              <Link to="/admin/cotacoes/nova">
                <Button className="!py-1.5 !px-3 text-xs font-bold mt-2">
                  <Icon name="add" className="text-base" /> Criar Primeira Cotação
                </Button>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFiltro('')
                  setMes('')
                  setBusca('')
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-[#17221b] text-on-surface text-xs font-bold uppercase tracking-wider select-none shadow-sm">
              <tr>
                <th className="py-3 px-3.5 font-bold border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Icon name="description" className="text-base text-primary shrink-0" />
                    <span>Cotação</span>
                  </div>
                </th>
                <th className="py-3 px-3 font-bold border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Icon name="flag" className="text-base text-primary shrink-0" />
                    <span>Status</span>
                  </div>
                </th>
                <th className="py-3 px-3 font-bold border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Icon name="schedule" className="text-base text-primary shrink-0" />
                    <span>Prazo de Resposta</span>
                  </div>
                </th>
                <th className="py-3 px-3 font-bold border-b border-white/10 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Icon name="payments" className="text-base text-primary shrink-0" />
                    <span>Total Comprado</span>
                  </div>
                </th>
                <th className="py-3 px-3.5 font-bold border-b border-white/10 text-center w-[124px]">
                  <div className="flex items-center justify-center gap-1.5">
                    <Icon name="bolt" className="text-base text-primary shrink-0" />
                    <span>Ações</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((c) => {
                const ehAberta = c.status === 'ABERTA'
                const ehEncerrada = c.status === 'ENCERRADA'
                const ehPedidosGerados = c.status === 'PEDIDOS_GERADOS'
                const ehRascunho = c.status === 'RASCUNHO'

                return (
                  <tr key={c.id} className="hover:bg-white/[0.025] transition-colors group">
                    {/* Título da Cotação com link e meta */}
                    <td className="py-3 px-3.5">
                      <div className="min-w-0">
                        <Link
                          to={`/admin/cotacoes/${c.id}`}
                          className="font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-2 group-hover:underline"
                        >
                          <span className="truncate">{c.titulo}</span>
                          {ehAberta && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary/15 text-primary border border-primary/25 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              AO VIVO
                            </span>
                          )}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant/60 font-mono mt-0.5">
                          <span>ID: {c.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>Criada em {c.criadaEm ? dataHoraBr(c.criadaEm) : '—'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge Moderno */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ehAberta && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                            Aberta
                          </span>
                        )}
                        {ehEncerrada && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Icon name="timer_off" className="text-sm" />
                            Encerrada
                          </span>
                        )}
                        {ehPedidosGerados && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                            <Icon name="task_alt" className="text-sm" />
                            Pedidos Gerados
                          </span>
                        )}
                        {ehRascunho && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-on-surface-variant border border-white/15">
                            <Icon name="edit_document" className="text-sm" />
                            Rascunho
                          </span>
                        )}
                        {c.status === 'CANCELADA' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                            <Icon name="cancel" className="text-sm" />
                            Cancelada
                          </span>
                        )}

                        {c.prazoVencido && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-200 border border-amber-500/30">
                            Prazo Vencido
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Prazo */}
                    <td className="py-3 px-3 font-mono text-on-surface-variant text-xs">
                      {c.prazo ? (
                        <div className="space-y-0.5">
                          <div className="text-on-surface font-medium">{dataHoraBr(c.prazo)}</div>
                          {c.encerradaEm && (
                            <div className="text-[10px] text-on-surface-variant/60">
                              Encerrada em {dataHoraBr(c.encerradaEm)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </td>

                    {/* Total Comprado */}
                    <td className="py-3 px-3 text-right font-mono">
                      {c.valorTotalComprado && c.valorTotalComprado > 0 ? (
                        <span className="font-bold text-primary text-sm sm:text-base">
                          {moeda(c.valorTotalComprado)}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/50 text-xs">—</span>
                      )}
                    </td>

                    {/* Ações Rápidas Alinhadas em Grade de 3 Slots Rigorosos */}
                    <td className="py-3 px-3.5 text-center">
                      <div className="grid grid-cols-3 gap-1.5 w-[108px] mx-auto items-center justify-items-center">
                        {/* Slot 1: Ação Contextual Principal */}
                        {ehAberta ? (
                          <Tooltip content="Ver lances ao vivo" side="top">
                            <Link
                              to={`/admin/cotacoes/${c.id}?aba=ao-vivo`}
                              className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors inline-flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                            >
                              <Icon name="visibility" className="text-base" />
                            </Link>
                          </Tooltip>
                        ) : ehEncerrada ? (
                          <Tooltip content="Apurar e ver prévia" side="top">
                            <Link
                              to={`/admin/cotacoes/${c.id}?aba=resultado`}
                              className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors inline-flex items-center justify-center"
                            >
                              <Icon name="task_alt" className="text-base" />
                            </Link>
                          </Tooltip>
                        ) : ehPedidosGerados ? (
                          <Tooltip content="Ver pedidos gerados e romaneios" side="top">
                            <Link
                              to={`/admin/cotacoes/${c.id}?aba=resultado`}
                              className="w-8 h-8 rounded-lg bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors inline-flex items-center justify-center"
                            >
                              <Icon name="receipt_long" className="text-base" />
                            </Link>
                          </Tooltip>
                        ) : ehRascunho ? (
                          <Tooltip content="Continuar montando cotação" side="top">
                            <Link
                              to={`/admin/cotacoes/${c.id}`}
                              className="w-8 h-8 rounded-lg bg-white/5 text-on-surface hover:text-primary hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                            >
                              <Icon name="edit" className="text-base" />
                            </Link>
                          </Tooltip>
                        ) : (
                          <div className="w-8 h-8" />
                        )}

                        {/* Slot 2: Duplicar Cotação */}
                        <Tooltip content="Duplicar cotação" side="top">
                          <button
                            type="button"
                            onClick={() => aoDuplicar(c.id)}
                            disabled={duplicar.isPending}
                            className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                          >
                            <Icon name="content_copy" className="text-base" />
                          </button>
                        </Tooltip>

                        {/* Slot 3: Excluir Cotação (ou slot vazio para manter alinhamento perfeito) */}
                        {c.status !== 'PEDIDOS_GERADOS' ? (
                          <Tooltip content="Excluir cotação" side="top">
                            <button
                              type="button"
                              onClick={() => setIdAExcluir(c.id)}
                              className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <Icon name="delete" className="text-base" />
                            </button>
                          </Tooltip>
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        open={Boolean(idAExcluir)}
        onClose={() => setIdAExcluir(null)}
        title="Excluir Cotação"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface">
            Tem certeza que deseja excluir esta cotação? Esta ação não pode ser desfeita e todas as propostas e lances vinculados serão removidos.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIdAExcluir(null)}>
              Cancelar
            </Button>
            <Button
              onClick={aoExcluirConfirmado}
              disabled={excluir.isPending}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              {excluir.isPending ? 'Excluindo…' : 'Sim, Excluir Cotação'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
