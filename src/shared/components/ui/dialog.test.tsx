import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Dialog } from './dialog'

function Harness({ inicial = true }: { inicial?: boolean }) {
  const [open, setOpen] = useState(inicial)
  return (
    <>
      <button onClick={() => setOpen(true)}>abrir</button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Teste">
        <p>conteúdo</p>
        <button>ação interna</button>
      </Dialog>
    </>
  )
}

beforeEach(() => {
  document.body.style.overflow = ''
})

test('abre: container focado e scroll do body travado', () => {
  render(<Harness />)
  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveFocus()
  expect(document.body.style.overflow).toBe('hidden')
})

test('Escape fecha', async () => {
  const user = userEvent.setup()
  render(<Harness />)
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('clique no overlay fecha', async () => {
  const user = userEvent.setup()
  render(<Harness />)
  await user.click(screen.getByRole('dialog').parentElement as HTMLElement)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('open=false → fora do DOM', () => {
  render(<Harness inicial={false} />)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(document.body.style.overflow).toBe('')
})

test('desmontar com open → body volta a rolar', () => {
  const { unmount } = render(<Harness />)
  expect(document.body.style.overflow).toBe('hidden')
  unmount()
  expect(document.body.style.overflow).toBe('')
})
