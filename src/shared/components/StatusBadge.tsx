import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { Selo, type TomSelo } from '@/shared/ui'

// Mapa exaustivo status → (rótulo, tom do Selo). Exaustivo por design: se um
// novo StatusCotacao entrar no union, o compilador aponta este Record.
// O chip vem do design system (`Selo`, design.md §2/§6): cor de estado + texto.
const MAPA: Record<StatusCotacao, { label: string; tom: TomSelo }> = {
  RASCUNHO: { label: 'Rascunho', tom: 'neutro' },
  ABERTA: { label: 'Aberta', tom: 'sucesso' },
  ENCERRADA: { label: 'Encerrada', tom: 'atencao' },
  PEDIDOS_GERADOS: { label: 'Pedidos gerados', tom: 'info' },
  CANCELADA: { label: 'Cancelada', tom: 'perigo' },
}

export function StatusBadge({ status }: { status: StatusCotacao }) {
  const { label, tom } = MAPA[status]
  return <Selo tom={tom}>{label}</Selo>
}
