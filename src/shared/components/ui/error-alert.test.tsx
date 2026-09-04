import { render, screen } from '@testing-library/react'
import { ErrorAlert } from './error-alert'

test('renderiza role="alert" com o texto passado como children', () => {
  render(<ErrorAlert>Não foi possível excluir. Tente novamente.</ErrorAlert>)

  const alerta = screen.getByRole('alert')
  expect(alerta).toHaveTextContent('Não foi possível excluir. Tente novamente.')
})
