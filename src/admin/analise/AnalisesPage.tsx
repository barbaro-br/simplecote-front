import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
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
    <div className="space-y-5 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Análises</h1>
          <p className="text-sm text-muted-foreground">Histórico de compras apuradas por período.</p>
        </div>
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
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.rotulo}
              </button>
            )
          })}
        </div>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : isError || !data ? (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível carregar as análises. Tente novamente.
        </p>
      ) : data.totais.length === 0 && data.ultimosPrecos.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nenhuma compra apurada neste período.
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <h2 className="text-sm font-medium text-muted-foreground">Total gasto no período</h2>
            <div className="mt-2 text-3xl font-bold tabular-nums">{moeda(totalGasto)}</div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Gasto por Empresa</CardTitle>
              </CardHeader>
              <ul className="space-y-2 p-4">
                {data.totais.map((t) => (
                  <li key={t.empresa} className="text-sm">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="truncate max-w-[150px]">{t.empresa}</span>
                      <span className="font-medium tabular-nums">{moeda(t.total)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${maxTotal > 0 ? (t.total / maxTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Item mais comprado</h3>
                {data.itemMaisComprado ? (
                  <p className="text-sm">
                    <span className="font-semibold">{data.itemMaisComprado.nome}</span>
                    <span className="text-muted-foreground"> · {data.itemMaisComprado.quantidade} un</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Nada por aqui</p>
                )}
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Item menos comprado</h3>
                {data.itemMenosComprado ? (
                  <p className="text-sm">
                    <span className="font-semibold">{data.itemMenosComprado.nome}</span>
                    <span className="text-muted-foreground"> · {data.itemMenosComprado.quantidade} un</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Nada por aqui</p>
                )}
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Últimos preços por produto</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto border-t">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium text-right">Preço unitário</th>
                    <th className="px-4 py-3 font-medium">Empresa</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.ultimosPrecos.map((u) => (
                    <tr key={`${u.produto}-${u.data}`} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.produto}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{moeda(u.precoUnitario)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.empresa}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">{dataBr(u.data)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
