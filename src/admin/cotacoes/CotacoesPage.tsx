import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, Plus, RefreshCw, Search, ServerCrash } from 'lucide-react'
import { dataHoraBr, chaveMes, mesAnoBr, moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { StatusBadge } from '@/shared/components/StatusBadge'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Button } from '@/shared/components/ui/button'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { MenuAcoes } from '@/shared/components/ui/menu-acoes'
import { ErrorAlert } from '@/shared/components/ui/error-alert'
import { useCotacoes, useExcluirCotacao } from './cotacoes.api'
import { ConfirmarDialog } from './ConfirmarDialog'

const STATUS: { valor: StatusCotacao; rotulo: string }[] = [
  { valor: 'RASCUNHO', rotulo: 'Rascunho' },
  { valor: 'ABERTA', rotulo: 'Aberta' },
  { valor: 'ENCERRADA', rotulo: 'Encerrada' },
  { valor: 'PEDIDOS_GERADOS', rotulo: 'Pedidos Gerados' },
  { valor: 'CANCELADA', rotulo: 'Cancelada' },
]

const FILTROS = [{ valor: '', rotulo: 'Todas' }, ...STATUS]

export function CotacoesPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [idAExcluir, setIdAExcluir] = useState<string | null>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  
  const statusParam = params.get('status') ?? ''
  const filtro = STATUS.some((s) => s.valor === statusParam) ? statusParam : ''

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

  // Evita re-animar a tabela se o dado já estava em cache.
  const primeiraCarga = isLoading

  async function aoExcluirConfirmado() {
    if (!idAExcluir) return
    setErroAcao(null)
    try {
      await excluir.mutateAsync(idAExcluir)
      setIdAExcluir(null)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErroAcao(e instanceof ApiError ? e.message : 'Falha ao excluir a cotação.')
      setIdAExcluir(null)
    }
  }

  const base = data ?? []
  const total = base.length

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

  const lista = base
    .filter((c) => filtro === '' || c.status === filtro)
    .filter((c) => mes === '' || (c.prazo != null && chaveMes(c.prazo) === mes))
    .filter(
      (c) => busca.trim() === '' || c.titulo.toLowerCase().includes(busca.trim().toLowerCase()),
    )

  return (
    <PageContainer maxWidth="5xl" className="space-y-5">
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
          className={buttonClasses()}
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
          <Input
            id="busca-cotacao"
            name="busca-cotacao"
            type="search"
            aria-label="Buscar cotação"
            placeholder="Buscar cotação…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 pr-3"
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
        {mesesDisponiveis.length > 0 && (
          <select
            id="filtro-mes"
            name="filtro-mes"
            aria-label="Filtrar por mês do prazo"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="h-7 rounded-full border-0 bg-muted px-3 text-xs font-medium text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Todos os meses</option>
            {mesesDisponiveis.map((m) => (
              <option key={m} value={m}>
                {mesAnoBr(m)}
              </option>
            ))}
          </select>
        )}
      </div>

      {erroAcao && <ErrorAlert>{erroAcao}</ErrorAlert>}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium rounded-tl-xl">Título</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Prazo</th>
              <th className="px-4 py-3 font-medium text-right">Valor Total</th>
              <th className="px-4 py-3 font-medium w-12 rounded-tr-xl">
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
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="size-7 rounded-md ml-auto" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-12">
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
                <td colSpan={5} className="px-4 py-12">
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
                return (
                  <tr
                    key={c.id}
                    className={`transition-colors hover:bg-muted/40${
                      primeiraCarga ? ' fade-in' : ''
                    }`}
                    style={
                      primeiraCarga
                        ? { animationDelay: `${Math.min(i * 50, 500)}ms` }
                        : undefined
                    }
                  >
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
                    <td className="px-4 py-3 tabular-nums text-right font-medium">
                      {c.valorTotalComprado ? moeda(c.valorTotalComprado) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MenuAcoes
                        items={[
                          {
                            label: 'Ver detalhes',
                            onSelect: () => navigate(`/admin/cotacoes/${c.id}`),
                          },
                          {
                            label: 'Excluir',
                            variant: 'destructive',
                            onSelect: () => setIdAExcluir(c.id),
                          }
                        ]}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>
      </Card>
      {idAExcluir && (
        <ConfirmarDialog
          titulo="Excluir Cotação"
          descricao="Tem certeza que deseja excluir esta cotação? Esta ação não pode ser desfeita e todas as respostas serão perdidas."
          rotuloConfirmar="Excluir Cotação"
          pendente={excluir.isPending}
          onConfirmar={aoExcluirConfirmado}
          onCancelar={() => setIdAExcluir(null)}
        />
      )}
    </PageContainer>
  )
}
