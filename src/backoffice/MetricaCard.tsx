import type { ReactNode } from 'react'

export function MetricaCard({
  rotulo,
  valor,
  extra,
}: {
  rotulo: string
  valor: ReactNode
  extra?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground ui-uppercase">{rotulo}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{valor}</p>
      {extra ? <div className="mt-2">{extra}</div> : null}
    </div>
  )
}
