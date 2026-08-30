import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HoverCard } from './HoverCard'

describe('HoverCard', () => {
  it('abre no mouse e fecha no blur/esc', async () => {
    const user = userEvent.setup()
    render(
      <HoverCard trigger={<button>Gatilho</button>}>
        <div>Conteudo do card</div>
      </HoverCard>
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // Hover
    await user.hover(screen.getByText('Gatilho'))
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
    expect(screen.getByText('Conteudo do card')).toBeInTheDocument()

    // Leave
    await user.unhover(screen.getByText('Gatilho'))
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    // Focus
    await user.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // Esc
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
