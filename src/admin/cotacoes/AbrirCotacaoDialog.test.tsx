import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { AbrirCotacaoDialog } from './AbrirCotacaoDialog'

function renderDialog() {
  return render(<AbrirCotacaoDialog onAbrir={vi.fn()} onCancelar={vi.fn()} />)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('AbrirCotacaoDialog — presets de prazo', () => {
  it('depois das 18h, "Hoje às 18h" aparece desabilitado e não é o selecionado por padrão', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 3, 19, 0, 0))

    renderDialog()

    const hoje = screen.getByRole('button', { name: 'Hoje às 18h' })
    expect(hoje).toBeDisabled()

    const amanha12 = screen.getByRole('button', { name: 'Amanhã 12h' })
    expect(amanha12).not.toBeDisabled()
    expect(amanha12).toHaveClass('bg-primary/10')
  })

  it('antes das 18h, "Hoje às 18h" permanece disponível e selecionado por padrão', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 3, 15, 0, 0))

    renderDialog()

    const hoje = screen.getByRole('button', { name: 'Hoje às 18h' })
    expect(hoje).not.toBeDisabled()
    expect(hoje).toHaveClass('bg-primary/10')

    expect(screen.getByRole('button', { name: 'Amanhã 12h' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Amanhã 18h' })).not.toBeDisabled()
  })
})
