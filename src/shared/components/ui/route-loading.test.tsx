import { render, screen } from '@testing-library/react'
import { RouteLoadingFallback } from './route-loading'

test('RouteLoadingFallback expõe um status de carregamento acessível', () => {
  render(<RouteLoadingFallback />)
  const el = screen.getByRole('status', { name: 'Carregando' })
  expect(el).toBeInTheDocument()
  expect(el.querySelector('.animate-spin')).not.toBeNull()
})
