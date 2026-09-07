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

describe('AbrirCotacaoDialog — seleção de prazo por calendário', () => {
  it('abre com data padrão (amanhã) às 18:00 e mostra a prévia formatada', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    renderDialog()

    expect(screen.getByLabelText('Hora')).toHaveValue('18')
    expect(screen.getByLabelText('Minuto')).toHaveValue('00')
    expect(screen.getByText(/Expira/)).toHaveTextContent('04/09/2026, 18:00')
  })

  it('trocar a hora atualiza a prévia do prazo', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    renderDialog()

    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '10' } })

    expect(screen.getByText(/Expira/)).toHaveTextContent('04/09/2026, 10:00')
  })

  it('trocar o dia no calendário atualiza a prévia do prazo', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    renderDialog()

    // 15 é um dia único no grid (sem repetição de dias externos)
    fireEvent.click(screen.getByRole('gridcell', { name: '15' }))

    expect(screen.getByText(/Expira/)).toHaveTextContent('15/09/2026, 18:00')
  })

  it('confirmar chama onAbrir com o ISO esperado, ancorado em America/Sao_Paulo', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    const { onAbrir } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir Cotação' }))

    expect(onAbrir).toHaveBeenCalledWith('2026-09-04T21:00:00.000Z')
  })

  it('prazo no passado bloqueia com mensagem e não chama onAbrir', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    const { onAbrir } = renderDialog()

    // seleciona hoje (3) e uma hora já passada (08:00 < 09:00)
    const hoje = screen.getAllByRole('gridcell', { name: '3' })[0]
    fireEvent.click(hoje)
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '08' } })

    fireEvent.click(screen.getByRole('button', { name: 'Abrir Cotação' }))

    expect(screen.getByText('O prazo precisa ser no futuro.')).toBeInTheDocument()
    expect(onAbrir).not.toHaveBeenCalled()
  })
})
