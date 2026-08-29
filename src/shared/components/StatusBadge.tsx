import type { StatusCotacao } from '@/shared/domain/tipos-base'

// Mapa exaustivo status → (rótulo, classes de cor). Exaustivo por design: se um
// novo StatusCotacao entrar no union, o compilador aponta este Record.
// Paleta: spec.md §13 (estado, não marca — bg tênue + texto na cor do token).
const MAPA: Record<StatusCotacao, { label: string; cls: string }> = {
  RASCUNHO: { label: 'Rascunho', cls: 'bg-muted text-muted-foreground' },
  ABERTA: { label: 'Aberta', cls: 'bg-primary/10 text-primary' },
  ENCERRADA: { label: 'Encerrada', cls: 'bg-warning/10 text-warning' },
  PEDIDOS_GERADOS: { label: 'Pedidos gerados', cls: 'bg-success/10 text-success' },
  CANCELADA: { label: 'Cancelada', cls: 'bg-destructive/10 text-destructive' },
}

export function StatusBadge({ status }: { status: StatusCotacao }) {
  const { label, cls } = MAPA[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  )
}
