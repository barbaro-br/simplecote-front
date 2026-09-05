import { render, screen } from '@testing-library/react'
import { Skeleton, RowSkeleton } from './skeleton'

test('Skeleton renderiza em isolamento com a animação shimmer', () => {
  render(<Skeleton data-testid="sk" className="h-4 w-24" />)
  const el = screen.getByTestId('sk')
  expect(el).toHaveClass('animate-shimmer')
  expect(el).toHaveClass('h-4')
  expect(el).toHaveClass('w-24')
})

test('RowSkeleton compõe o formato de uma linha de lista (avatar + duas barras + pílula)', () => {
  const { container } = render(
    <ul>
      <RowSkeleton />
    </ul>,
  )
  const li = container.querySelector('li')!
  expect(li).toHaveAttribute('aria-hidden', 'true')
  // avatar circular + barra de nome + barra secundária + pílula de ação
  expect(li.querySelectorAll('.animate-shimmer')).toHaveLength(4)
})
