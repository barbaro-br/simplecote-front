import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TutorialOnboarding } from './TutorialOnboarding'

describe('TutorialOnboarding', () => {
  it('navega os 3 passos e conclui no último', async () => {
    const aoConcluir = vi.fn()
    const user = userEvent.setup()
    render(<TutorialOnboarding aoConcluir={aoConcluir} />)

    expect(screen.getByText('Conheça o card de produto')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /próximo/i }))
    expect(screen.getByText('O visto é automático')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /próximo/i }))
    expect(screen.getByText('Pronto para começar!')).toBeInTheDocument()

    expect(screen.queryByRole('button', { name: /pular tutorial/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /entendi, vamos lá/i }))
    expect(aoConcluir).toHaveBeenCalledTimes(1)
  })

  it('"Pular tutorial" conclui na hora', async () => {
    const aoConcluir = vi.fn()
    const user = userEvent.setup()
    render(<TutorialOnboarding aoConcluir={aoConcluir} />)

    await user.click(screen.getByRole('button', { name: /pular tutorial/i }))
    expect(aoConcluir).toHaveBeenCalledTimes(1)
  })
})
