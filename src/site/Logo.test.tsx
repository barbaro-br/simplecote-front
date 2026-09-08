import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Logo } from './Logo'

test('variante completa renderiza "SimpleCote" como texto', () => {
  render(<Logo />)

  expect(screen.getByText('SimpleCote')).toBeInTheDocument()
})

test('variante símbolo tem nome acessível "SimpleCote"', () => {
  render(<Logo variant="simbolo" />)

  expect(screen.getByRole('img', { name: 'SimpleCote' })).toBeInTheDocument()
})
