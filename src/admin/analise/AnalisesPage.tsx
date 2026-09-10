import { useState } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CabecalhoPagina, Superficie, SecaoCabecalho, CampoEstat } from '@/shared/ui'
import { moeda, dataBr } from '@/shared/format/formatters'
import { useCompras } from './analise.api'

function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type Preset = { rotulo: string; dias: number | null }

const PRESETS: Preset[] = [
  { rotulo: '7 dias', dias: 7 },
  { rotulo: '30 dias', dias: 30 },
  { rotulo: '90 dias', dias: 90 },
  { rotulo: 'Este mês', dias: null },
]

function periodoDe(preset: Preset): { de: string; ate: string } {
  const hoje = new Date()
  const ate = hoje
  const de =
    preset.dias === null
      ? new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      : new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - preset.dias)
  return { de: fmt(de), ate: fmt(ate) }
}

export function AnalisesPage() {
  const [preset, setPreset] = useState<Preset>(PRESETS[1])
  const { de, ate } = periodoDe(preset)
  const { data, isPending, isError } = useCompras(de, ate)

  const totalGasto = data ? data.totais.reduce((acc, t) => acc + t.total, 0) : 0
  const maxTotal = data ? Math.max(0, ...data.totais.map((t) => t.total)) : 0

  return (
    <PageContainer maxWidth="5xl" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <CabecalhoPagina titulo="Análises" subtitulo="Histórico de compras apuradas por período." />
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const ativo = p.rotulo === preset.rotulo
            return (
              <button
                key={p.rotulo}
                type="button"
                aria-pressed={ativo}
                onClick={() => setPreset(p)}
                className={`h-7 rounded-full px-3 text-xs font-medium transition-colors ${
                  ativo
                    ? 'bg-[var(--pnl-acento,#57bf8e)]/15 text-[var(--pnl-acento-hi,#6fe6ac)] ring-1 ring-inset ring-[var(--pnl-acento,#57bf8e)]/30'
                    : 'bg-white/[0.06] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))] hover:text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]'
                }`}
              >
                {p.rotulo}
              </button>
            )
          })}
        </div>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : isError || !data ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar as análises. Tente novamente.
        </p>
      ) : data.totais.length === 0 && data.ultimosPrecos.length === 0 ? (
        <Superficie>
          <p className="p-8 text-center text-sm text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            Nenhuma compra apurada neste período.
          </p>
        </Superficie>
      ) : (
        <>
          <Superficie>
            <SecaoCabecalho titulo="Total gasto no período" />
            <div className="p-4 sm:p-5">
              <CampoEstat rotulo={`${dataBr(de)} — ${dataBr(ate)}`} valor={moeda(totalGasto)} />
            </div>
          </Superficie>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Superficie>
              <SecaoCabecalho titulo="Gasto por Empresa" />
              <ul className="space-y-3 p-4 sm:p-5">
                {data.totais.map((t) => (
                  <li key={t.empresa} className="text-sm">
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="truncate text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">{t.empresa}</span>
                      <span className="shrink-0 font-medium tabular-nums text-[var(--pnl-txt,#fff)]">{moeda(t.total)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-[var(--pnl-acento,#57bf8e)]"
                        style={{ width: `${maxTotal > 0 ? (t.total / maxTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Superficie>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
              <Superficie>
                <SecaoCabecalho titulo="Item mais comprado" />
                <div className="p-4 sm:p-5">
                  {data.itemMaisComprado ? (
                    <p className="text-sm">
                      <span className="font-semibold text-[var(--pnl-txt,#fff)]">{data.itemMaisComprado.nome}</span>
                      <span className="text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]"> · {data.itemMaisComprado.quantidade} un</span>
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">Nada por aqui</p>
                  )}
                </div>
              </Superficie>
              <Superficie>
                <SecaoCabecalho titulo="Item menos comprado" />
                <div className="p-4 sm:p-5">
                  {data.itemMenosComprado ? (
                    <p className="text-sm">
                      <span className="font-semibold text-[var(--pnl-txt,#fff)]">{data.itemMenosComprado.nome}</span>
                      <span className="text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]"> · {data.itemMenosComprado.quantidade} un</span>
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">Nada por aqui</p>
                  )}
                </div>
              </Superficie>
            </div>
          </div>

          <Superficie>
            <SecaoCabecalho titulo="Últimos preços por produto" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03]">
                  <tr className="text-left text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                    <th className="px-4 py-3 font-medium ui-uppercase">Produto</th>
                    <th className="px-4 py-3 text-right font-medium ui-uppercase">Preço unitário</th>
                    <th className="px-4 py-3 font-medium ui-uppercase">Empresa</th>
                    <th className="px-4 py-3 font-medium ui-uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
                  {data.ultimosPrecos.map((u) => (
                    <tr key={`${u.produto}-${u.data}`} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-medium text-[var(--pnl-txt,#fff)]">{u.produto}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">{moeda(u.precoUnitario)}</td>
                      <td className="px-4 py-3 text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{u.empresa}</td>
                      <td className="px-4 py-3 tabular-nums text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{dataBr(u.data)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Superficie>
        </>
      )}
    </PageContainer>
  )
}
