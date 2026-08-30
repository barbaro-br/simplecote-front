import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Plus, RefreshCw, Search, ServerCrash } from 'lucide-react'
import { dataHoraBr } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { MenuAcoes } from '@/shared/components/ui/menu-acoes'
import { useCotacoes, useDuplicarCotacao } from './cotacoes.api'
import { PainelDashboard } from '../analise/PainelDashboard'

const STATUS: { valor: StatusCotacao; rotulo: string }[] = [
  { valor: 'RASCUNHO', rotulo: 'Rascunho' },
  { valor: 'ABERTA', rotulo: 'Aberta' },
  { valor: 'ENCERRADA', rotulo: 'Encerrada' },
  { valor: 'PEDIDOS_GERADOS', rotulo: 'Pedidos gerados' },
  { valor: 'CANCELADA', rotulo: 'Cancelada' },
]

export function rotuloStatus(status: StatusCotacao): string {
  return STATUS.find((s) => s.valor === status)?.rotulo ?? status
}

type Filtro = StatusCotacao | 'TODOS'

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'TODOS', rotulo: 'Todos' },
  ...STATUS,
]

export function CotacoesPage() {
  const { data: cotacoes, isLoading, error, refetch, isFetching } = useCotacoes()
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [busca, setBusca] = useState('')

  const navigate = useNavigate()
  const duplicar = useDuplicarCotacao()
  const [erroDup, setErroDup] = useState<string | null>(null)

  function aoDuplicar(id: string) {
    setErroDup(null)
    duplicar.mutate(id, {
      onSuccess: (data) =>
        navigate(`/admin/cotacoes/${data.cotacao.id}`, { state: { omitidos: data.omitidos } }),
      onError: (e) => {
        if (e instanceof SessaoExpiradaError) return
        setErroDup(
          e instanceof ApiError ? e.message : 'Não foi possível duplicar. Tente novamente.',
        )
      },
    })
  }

  const total = cotacoes?.length ?? 0
  const lista = (cotacoes ?? [])
    .filter((c) => filtro === 'TODOS' || c.status === filtro)
    .filter(
      (c) => busca.trim() === '' || c.titulo.toLowerCase().includes(busca.trim().toLowerCase()),
    )

  return (
    <div className="space-y-5 max-w-5xl">
      <PainelDashboard onStatusClick={setFiltro} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cotações</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? 'Carregando…'
              : `${total} ${total === 1 ? 'cotação' : 'cotações'} no total`}
          </p>
        </div>
        <Link
          to="/admin/cotacoes/nova"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden />
          Nova cotação
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1 max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            aria-label="Buscar cotação"
            placeholder="Buscar cotação…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => {
            const ativo = filtro === f.valor
            return (
              <button
                key={f.valor}
                type="button"
                aria-pressed={ativo}
                onClick={() => setFiltro(f.valor)}
                className={`h-7 rounded-full px-3 text-xs font-medium transition-colors ${
                  ativo
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.rotulo}
              </button>
            )
          })}
        </div>
      </div>

      {erroDup && (
        <div role="alert" className="text-sm text-destructive font-medium">
          {erroDup}
        </div>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Prazo</th>
              <th className="px-4 py-3 font-medium w-12">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="size-7 rounded-md" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <ServerCrash className="size-8 text-destructive/40" aria-hidden />
                    <div>
                      <p className="text-sm font-medium">Falha ao carregar as cotações</p>
                      <p className="text-xs text-muted-foreground">
                        Verifique sua conexão e tente novamente.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => refetch()}
                      disabled={isFetching}
                    >
                      <RefreshCw
                        className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`}
                        aria-hidden
                      />
                      Tentar novamente
                    </Button>
                  </div>
                </td>
              </tr>
            ) : !lista.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <FileText className="size-8 text-muted-foreground/25" aria-hidden />
                    <p className="text-sm font-medium">
                      {total === 0 ? 'Nenhuma cotação ainda' : 'Nenhuma cotação para esse filtro'}
                    </p>
                    {total === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Crie a primeira cotação para começar.
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              lista.map((c, i) => {
                const isTest = import.meta.env.MODE === 'test';
                return (
                  <tr key={c.id} className={`transition-colors hover:bg-muted/40 ${isTest ? '' : 'fade-in opacity-0'}`} style={isTest ? {} : { animationDelay: `${Math.min(i * 50, 500)}ms` }}>
                    <td className="px-4 py-3">
                      <Link
                      to={`/admin/cotacoes/${c.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {c.prazo ? dataHoraBr(c.prazo) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MenuAcoes
                      items={[
                        {
                          label:
                            duplicar.isPending && duplicar.variables === c.id
                              ? 'Duplicando…'
                              : 'Duplicar',
                          onSelect: () => aoDuplicar(c.id),
                          disabled: duplicar.isPending,
                        },
                      ]}
                    />
                  </td>
                </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
