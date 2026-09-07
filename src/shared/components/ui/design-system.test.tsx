import { render, screen } from '@testing-library/react'
import { Button } from './button'
import { Input } from './input'

// Change uppercase-na-casca-da-interface (specs/shared/design-system): a caixa
// alta é puramente visual via `.ui-uppercase` (text-transform), então o teste
// verifica a classe no componente de casca e a ausência dela em dado pessoal.
test('componente de casca (Button) aplica a classe de caixa alta', () => {
  render(<Button>Salvar</Button>)
  expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass('ui-uppercase')
})

test('campo de e-mail não aplica a classe de caixa alta', () => {
  render(<Input type="email" aria-label="E-mail" />)
  expect(screen.getByRole('textbox', { name: 'E-mail' })).not.toHaveClass('ui-uppercase')
})
