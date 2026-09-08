import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { BrandLogo } from './BrandLogo'

test('variante full renderiza "SimpleCote" como texto', () => {
  render(<BrandLogo />)

  expect(screen.getByText(/Simple/)).toBeInTheDocument()
  expect(screen.getByText(/Cote/)).toBeInTheDocument()
})

test('variante mark tem nome acessível "SimpleCote"', () => {
  render(<BrandLogo variant="mark" />)

  expect(screen.getAllByRole('img', { name: 'SimpleCote' }).length).toBeGreaterThan(0)
})
