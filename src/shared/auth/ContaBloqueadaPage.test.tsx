import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { ContaBloqueadaPage } from './ContaBloqueadaPage'

function renderPagina(state: unknown) {
  const router = createMemoryRouter(
    [
      { path: '/conta-bloqueada', element: <ContaBloqueadaPage /> },
      { path: '/login', element: <div>login view</div> },
    ],
    { initialEntries: [{ pathname: '/conta-bloqueada', state }] }
  )
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

test('mostra o título por motivo e o detail do backend', () => {
  renderPagina({ motivo: 'prazo', detail: 'Seu período de teste terminou. Fale com o suporte para continuar.' })

  expect(screen.getByText('Período de teste encerrado')).toBeInTheDocument()
  expect(screen.getByText('Seu período de teste terminou. Fale com o suporte para continuar.')).toBeInTheDocument()
})

test('Sair desloga e leva ao /login', async () => {
  const user = userEvent.setup()
  renderPagina({ motivo: 'suspensao', detail: 'Esta conta está suspensa.' })

  expect(screen.getByText('Conta suspensa')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Sair' }))

  expect(await screen.findByText('login view')).toBeInTheDocument()
})
