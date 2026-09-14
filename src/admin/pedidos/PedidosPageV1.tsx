import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CaretRight, PlusCircle, Receipt } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CabecalhoPagina, Superficie } from '@/shared/ui'
import { chaveMes, mesAnoBr, moeda } from '@/shared/format/formatters'
import { usePedidosAgregados } from './pedidos.api'
import { agruparAvulsosPorMes } from './pedidos.util'
import { PainelPedido, type ContextoPainel } from './PainelPedido'
import type { GrupoCotacaoPedidos, PedidoResumo } from './pedidos.schema'

const ORIGENS = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'AVULSO', rotulo: 'Avulsos' },
  { valor: 'APURADO', rotulo: 'Cotações' },
] as const

function Cartao({
  origem,
  titulo,
  meta,
  valor,
  onClick,
}: {
  origem: 'AVULSO' | 'APURADO'
  titulo: string
  meta: string
  valor: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border p-4 text-left shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] transition-colors
        border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-[var(--pnl-superficie,#12263f)] ring-1 ring-inset ring-[var(--pnl-ring,rgba(255,255,255,0.06))]
        hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pnl-acento,#57bf8e)]"
    >
      <span
        className={`h-10 w-1 shrink-0 rounded-full ${origem === 'AVULSO' ? 'bg-violet-400' : 'bg-[var(--pnl-acento,#57bf8e)]'}`}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14.5px] font-semibold text-foreground">{titulo}</span>
        <span className="block truncate text-xs text-muted-foreground">{meta}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[10.5px] uppercase tracking-wide text-muted-foreground">Total</span>
        <span className="block text-[15.5px] font-bold tabular-nums text-foreground">{moeda(valor)}</span>
      </span>
      <CaretRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
    </button>
  )
}

export function PedidosPageV1() {
  const navigate = useNavigate()
  const { data, isLoading, error } = usePedidosAgregados()
  const [params, setParams] = useSearchParams()
  const [contexto, setContexto] = useState<ContextoPainel | null>(null)

  const origemParam = params.get('origem') ?? ''
  const origem = ORIGENS.some((o) => o.valor === origemParam) ? origemParam : ''
  const empresaParam = params.get('empresa') ?? ''
  const mesParam = params.get('mes') ?? ''

  function setFiltro(chave: 'origem' | 'empresa' | 'mes', valor: string) {
    setParams((p) => {
      if (valor) p.set(chave, valor)
      else p.delete(chave)
      return p
    })
  }

  const todosResumos = useMemo(
    () => (data ? [...data.grupos.flatMap((g) => g.pedidos), ...data.avulsos] : []),
    [data],
  )

  const empresasDisponiveis = useMemo(
    () => Array.from(new Set(todosResumos.map((p) => p.empresaNome).filter((n): n is string => n != null))).sort(),
    [todosResumos],
  )
  const empresa = empresasDisponiveis.includes(empresaParam) ? empresaParam : ''

  const mesesDisponiveis = useMemo(() => {
    const set = new Set<string>()
    for (const p of todosResumos) {
      if ((!origem || p.origem === origem) && (!empresa || p.empresaNome === empresa)) {
        set.add(chaveMes(p.geradoEm))
      }
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [todosResumos, origem, empresa])
  const mes = mesesDisponiveis.includes(mesParam) ? mesParam : ''

  function passaFiltro(p: PedidoResumo) {
    if (origem && p.origem !== origem) return false
    if (empresa && p.empresaNome !== empresa) return false
    if (mes && chaveMes(p.geradoEm) !== mes) return false
    return true
  }

  const gruposFiltrados: GrupoCotacaoPedidos[] = useMemo(() => {
    if (!data || origem === 'AVULSO') return []
    return data.grupos
      .map((g) => ({ ...g, pedidos: g.pedidos.filter(passaFiltro) }))
      .filter((g) => g.pedidos.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, origem, empresa, mes])

  const gruposAvulsosMes = useMemo(() => {
    if (!data || origem === 'APURADO') return []
    return agruparAvulsosPorMes(data.avulsos.filter(passaFiltro))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, origem, empresa, mes])

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando pedidos…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar pedidos: {error.message}</p>
  if (!data) return null

  const semNenhumPedido = data.grupos.length === 0 && data.avulsos.length === 0
  const filtrosAtivos = origem !== '' || empresa !== '' || mes !== ''
  const semResultadoParaFiltro = !semNenhumPedido && filtrosAtivos && gruposFiltrados.length === 0 && gruposAvulsosMes.length === 0

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 space-y-4 bg-background px-4 pb-4 pt-1 md:-mx-6 md:px-6">
        <CabecalhoPagina
          titulo="Pedidos"
          subtitulo="Todos os pedidos apurados e avulsos, num lugar só."
          acao={
            <Button onClick={() => navigate('/admin/pedidos-avulsos/novo')}>
              <PlusCircle className="mr-2 size-4" />
              Novo pedido
            </Button>
          }
        />

        {!semNenhumPedido && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))] pb-4">
            {ORIGENS.map((o) => {
              const ativo = origem === o.valor
              return (
                <button
                  key={o.valor}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => setFiltro('origem', o.valor)}
                  className={`h-7 rounded-full px-3 text-xs font-medium transition-colors ${
                    ativo
                      ? 'bg-[var(--pnl-acento,#57bf8e)]/15 text-[var(--pnl-acento-hi,#6fe6ac)] ring-1 ring-inset ring-[var(--pnl-acento,#57bf8e)]/30'
                      : 'bg-white/[0.06] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {o.rotulo}
                </button>
              )
            })}
            {empresasDisponiveis.length > 0 && (
              <select
                id="filtro-empresa"
                name="filtro-empresa"
                aria-label="Filtrar por empresa"
                value={empresa}
                onChange={(e) => setFiltro('empresa', e.target.value)}
                className="h-7 rounded-full border-0 bg-muted px-3 text-xs font-medium text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Todas as empresas</option>
                {empresasDisponiveis.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            )}
            {mesesDisponiveis.length > 0 && (
              <select
                id="filtro-mes"
                name="filtro-mes"
                aria-label="Filtrar por mês"
                value={mes}
                onChange={(e) => setFiltro('mes', e.target.value)}
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
        )}
      </div>

      {semNenhumPedido && (
        <Superficie className="p-10 text-center space-y-4">
          <Receipt className="mx-auto size-10 text-muted-foreground" />
          <div>
            <p className="font-medium text-[var(--pnl-txt,#fff)]">Nenhum pedido ainda</p>
            <p className="text-sm text-[var(--pnl-txt-2,rgba(255,255,255,0.7))] mt-1">
              Crie um pedido avulso ou apure uma cotação para ver os pedidos aqui.
            </p>
          </div>
          <Button onClick={() => navigate('/admin/pedidos-avulsos/novo')}>
            <PlusCircle className="mr-2 size-4" />
            Novo pedido
          </Button>
        </Superficie>
      )}

      {semResultadoParaFiltro && (
        <p className="py-10 text-center text-sm text-muted-foreground">Nenhum pedido encontrado com esses filtros.</p>
      )}

      {gruposAvulsosMes.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Avulsos</p>
          <div className="space-y-2">
            {gruposAvulsosMes.map((g) => (
              <Cartao
                key={g.chave}
                origem="AVULSO"
                titulo={`Avulsos — ${g.rotulo}`}
                meta={`${g.pedidos.length} ${g.pedidos.length === 1 ? 'pedido' : 'pedidos'}`}
                valor={g.total}
                onClick={() => setContexto({ tipo: 'avulso-mes', rotulo: g.rotulo, pedidos: g.pedidos })}
              />
            ))}
          </div>
        </div>
      )}

      {gruposFiltrados.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Cotações</p>
          <div className="space-y-2">
            {gruposFiltrados.map((g) => (
              <Cartao
                key={g.cotacaoId}
                origem="APURADO"
                titulo={g.tituloCotacao}
                meta={`${g.pedidos.length} ${g.pedidos.length === 1 ? 'empresa' : 'empresas'}`}
                valor={g.pedidos.reduce((s, p) => s + p.total, 0)}
                onClick={() => setContexto({ tipo: 'cotacao', cotacaoId: g.cotacaoId, titulo: g.tituloCotacao })}
              />
            ))}
          </div>
        </div>
      )}

      <PainelPedido contexto={contexto} onFechar={() => setContexto(null)} />
    </PageContainer>
  )
}
