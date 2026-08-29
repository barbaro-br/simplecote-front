import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MenuAcoes } from './menu-acoes'

describe('MenuAcoes', () => {
  it('abre ao clicar no gatilho, chama onSelect e fecha ao escolher', async () => {
    const user = userEvent.setup()
    const acao = vi.fn()
    render(<MenuAcoes items={[{ label: 'Ação 1', onSelect: acao }]} />)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mais opções' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Ação 1' }))
    expect(acao).toHaveBeenCalled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('fecha no Escape e no clique fora', async () => {
    const user = userEvent.setup()
    render(<MenuAcoes items={[{ label: 'Ação 1', onSelect: vi.fn() }]} />)

    await user.click(screen.getByRole('button', { name: 'Mais opções' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mais opções' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
