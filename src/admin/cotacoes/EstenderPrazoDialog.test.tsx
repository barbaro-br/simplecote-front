import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { EstenderPrazoDialog } from './EstenderPrazoDialog'

function renderDialog(props: Partial<React.ComponentProps<typeof EstenderPrazoDialog>> = {}) {
  const onEstender = vi.fn()
  render(
    <EstenderPrazoDialog onEstender={onEstender} onCancelar={vi.fn()} {...props} />,
  )
  return { onEstender }
}

afterEach(() => {
  vi.useRealTimers()
})

// quinta-feira, 2026-09-03 09:00 em São Paulo (UTC-3)
const QUINTA = '2026-09-03T12:00:00Z'

describe('EstenderPrazoDialog', () => {
  it('mostra o prazo atual e marca (vencido) quando já passou', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    renderDialog({ prazoAtualIso: '2026-09-01T12:00:00Z' })

    expect(screen.getByText(/Prazo atual:/)).toHaveTextContent('(vencido)')
  })

  it('confirmar chama onEstender com o ISO ancorado em America/Sao_Paulo', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    const { onEstender } = renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Salvar prazo' }))

    expect(onEstender).toHaveBeenCalledWith('2026-09-04T21:00:00.000Z')
  })

  it('novo prazo no passado bloqueia e não chama onEstender', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(QUINTA))

    const { onEstender } = renderDialog()

    const hoje = screen.getAllByRole('gridcell', { name: '3' })[0]
    fireEvent.click(hoje)
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '08' } })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar prazo' }))

    expect(screen.getByText('O novo prazo precisa ser no futuro.')).toBeInTheDocument()
    expect(onEstender).not.toHaveBeenCalled()
  })
})
