import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VistoStatus } from './VistoStatus'

describe('VistoStatus', () => {
  it('anuncia "com preço" quando filled', () => {
    render(<VistoStatus filled />)
    expect(screen.getByText('com preço')).toBeInTheDocument()
    expect(screen.queryByText('sem preço')).not.toBeInTheDocument()
  })

  it('anuncia "sem preço" quando não filled', () => {
    render(<VistoStatus filled={false} />)
    expect(screen.getByText('sem preço')).toBeInTheDocument()
    expect(screen.queryByText('com preço')).not.toBeInTheDocument()
  })
})
