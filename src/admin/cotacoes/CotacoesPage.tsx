import { useState } from 'react'
import { Link } from 'react-router-dom'
import { dataHoraBr } from '@/shared/format/formatters'
import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { useCotacoes } from './cotacoes.api'

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

export function CotacoesPage() {
  const { data: cotacoes, isLoading, error } = useCotacoes()
  const [filtro, setFiltro] = useState<StatusCotacao | 'TODOS'>('TODOS')

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando cotações…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar cotações: {error.message}</p>

  const lista = (cotacoes ?? []).filter((c) => filtro === 'TODOS' || c.status === filtro)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cotações</h1>
        <Link
          to="/admin/cotacoes/nova"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nova cotação
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="filtro-status" className="text-sm text-muted-foreground">
          Filtrar por status
        </label>
        <select
          id="filtro-status"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as StatusCotacao | 'TODOS')}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="TODOS">Todos</option>
          {STATUS.map((s) => (
            <option key={s.valor} value={s.valor}>
              {s.rotulo}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Prazo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!lista.length ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma cotação.
                </td>
              </tr>
            ) : (
              lista.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/admin/cotacoes/${c.id}`} className="text-primary hover:underline">
                      {c.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">{c.prazo ? dataHoraBr(c.prazo) : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
