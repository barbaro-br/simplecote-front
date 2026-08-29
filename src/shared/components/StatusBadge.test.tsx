import { render, screen } from '@testing-library/react'
import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { StatusBadge } from './StatusBadge'

const CASOS: [StatusCotacao, string][] = [
  ['RASCUNHO', 'Rascunho'],
  ['ABERTA', 'Aberta'],
  ['ENCERRADA', 'Encerrada'],
  ['PEDIDOS_GERADOS', 'Pedidos gerados'],
  ['CANCELADA', 'Cancelada'],
]

test.each(CASOS)('StatusBadge(%s) renderiza o rótulo "%s"', (status, label) => {
  render(<StatusBadge status={status} />)
  expect(screen.getByText(label)).toBeInTheDocument()
})
