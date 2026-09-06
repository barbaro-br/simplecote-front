import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { AbrirCotacaoDialog } from './AbrirCotacaoDialog'

function renderDialog(onAbrir = vi.fn()) {
  return {
    onAbrir,
    ...render(<AbrirCotacaoDialog onAbrir={onAbrir} onCancelar={vi.fn()} />),
  }
}

afterEach(() => {
  vi.useRealTimers()
})

// quinta-feira, 2026-09-03 09:00 em São Paulo (UTC-3)
const QUINTA = '2026-09-03T12:00:00Z'

function abrir(preset: string) {
  fireEvent.click(screen.getByRole('button', { name: preset }))
  fireEvent.click(screen.getByRole('button', { name: 'Abrir Cotação' }))
}

describe('AbrirCotacaoDialog — presets de prazo', () => {
  it('gera o ISO de cada preset ancorado em America/Sao_Paulo', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    const { onAbrir } = renderDialog()

    abrir('+24h')
    expect(onAbrir).toHaveBeenLastCalledWith('2026-09-04T12:00:00.000Z')

    abrir('+48h')
    expect(onAbrir).toHaveBeenLastCalledWith('2026-09-05T12:00:00.000Z')

    abrir('Hoje às 18h')
    expect(onAbrir).toHaveBeenLastCalledWith('2026-09-03T21:00:00.000Z')

    abrir('Amanhã às 18h')
    expect(onAbrir).toHaveBeenLastCalledWith('2026-09-04T21:00:00.000Z')

    abrir('Sexta às 12h')
    expect(onAbrir).toHaveBeenLastCalledWith('2026-09-04T15:00:00.000Z')
  })

  it('presets vencidos ficam desabilitados e "Sexta às 12h" some na sexta-feira', () => {
    vi.useFakeTimers()
    // sexta-feira, 2026-09-04 18:30 em São Paulo
    vi.setSystemTime(new Date('2026-09-04T21:30:00Z'))

    renderDialog()

    expect(screen.getByRole('button', { name: 'Hoje às 18h' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Amanhã às 18h' })).not.toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Sexta às 12h' })).not.toBeInTheDocument()
  })

  it('"Sexta às 12h" está ausente no fim de semana', () => {
    vi.useFakeTimers()
    // sábado, 2026-09-05
    vi.setSystemTime(new Date('2026-09-05T12:00:00Z'))

    renderDialog()

    expect(screen.queryByRole('button', { name: 'Sexta às 12h' })).not.toBeInTheDocument()
  })

  it('"Sexta às 12h" aparece de segunda a quinta', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    renderDialog()

    expect(screen.getByRole('button', { name: 'Sexta às 12h' })).toBeInTheDocument()
  })

  it('a prévia mostra o prazo formatado e muda ao trocar de preset', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    renderDialog()

    expect(screen.getByText(/Expira/)).toHaveTextContent('04/09/2026, 09:00')

    fireEvent.click(screen.getByRole('button', { name: 'Hoje às 18h' }))

    expect(screen.getByText(/Expira/)).toHaveTextContent('03/09/2026, 18:00')
  })
})
