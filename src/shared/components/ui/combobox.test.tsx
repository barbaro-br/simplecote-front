import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Combobox } from './combobox'

const options = [
  { value: 'a', label: 'Alface' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cenoura' },
]

describe('Combobox', () => {
  it('renderiza as opções, filtra ao digitar e fecha ao selecionar', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Combobox
        options={options}
        value=""
        onChange={onChange}
        placeholder="Escolha uma opção"
      />,
    )

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Escolha uma opção' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)

    await user.type(screen.getByPlaceholderText('Buscar…'), 'ba')
    expect(screen.queryByRole('option', { name: 'Alface' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Cenoura' })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'Banana' }))
    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('exibe emptyMessage quando o filtro não encontra nada', async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        options={options}
        value=""
        onChange={vi.fn()}
        emptyMessage="Nenhuma cotação encontrada"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Selecione…' }))
    await user.type(screen.getByPlaceholderText('Buscar…'), 'zzz')

    expect(screen.queryByRole('option')).not.toBeInTheDocument()
    expect(screen.getByText('Nenhuma cotação encontrada')).toBeInTheDocument()
  })

  it('navega por teclado: seta baixo destaca a próxima e Enter seleciona a realçada', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} value="" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Selecione…' }))
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('Escape fecha o popup sem chamar onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} value="" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Selecione…' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
