import { render, screen, fireEvent, act } from '@testing-library/react'
import { Tooltip } from './tooltip'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('não aparece antes do delay e aparece depois dele, com fade-in', () => {
  render(
    <Tooltip content="Copiar link" delay={300}>
      <button type="button">Ação</button>
    </Tooltip>,
  )

  fireEvent.mouseEnter(screen.getByRole('button', { name: 'Ação' }))
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

  act(() => vi.advanceTimersByTime(300))
  const tooltip = screen.getByRole('tooltip')
  expect(tooltip).toHaveTextContent('Copiar link')
  expect(tooltip).toHaveClass('fade-in')
})

test('some no mouse leave', () => {
  render(
    <Tooltip content="Copiar link" delay={0}>
      <button type="button">Ação</button>
    </Tooltip>,
  )

  fireEvent.mouseEnter(screen.getByRole('button', { name: 'Ação' }))
  act(() => vi.advanceTimersByTime(0))
  expect(screen.getByRole('tooltip')).toBeInTheDocument()

  fireEvent.mouseLeave(screen.getByRole('button', { name: 'Ação' }))
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
})

test('aparece no foco (teclado) e some no blur', () => {
  render(
    <Tooltip content="Enviar por WhatsApp" delay={0}>
      <button type="button">W</button>
    </Tooltip>,
  )

  const botao = screen.getByRole('button', { name: 'W' })
  fireEvent.focus(botao)
  act(() => vi.advanceTimersByTime(0))
  expect(screen.getByRole('tooltip')).toHaveTextContent('Enviar por WhatsApp')

  fireEvent.blur(botao)
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
})
