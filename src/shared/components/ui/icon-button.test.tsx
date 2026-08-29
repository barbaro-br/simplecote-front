import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pencil } from 'lucide-react'
import { IconButton } from './icon-button'

test('renderiza o aria-label e dispara onClick', async () => {
  const onClick = vi.fn()
  render(<IconButton icon={Pencil} label="Editar" onClick={onClick} />)

  const btn = screen.getByRole('button', { name: 'Editar' })
  expect(btn).toHaveAttribute('title', 'Editar')
  await userEvent.click(btn)
  expect(onClick).toHaveBeenCalledTimes(1)
})

test('disabled: fica desabilitado e não dispara onClick', async () => {
  const onClick = vi.fn()
  render(<IconButton icon={Pencil} label="Editar" onClick={onClick} disabled />)

  const btn = screen.getByRole('button', { name: 'Editar' })
  expect(btn).toBeDisabled()
  await userEvent.click(btn)
  expect(onClick).not.toHaveBeenCalled()
})
