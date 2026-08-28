import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { AuthGuard } from './AuthGuard'

const SESSION_KEY = 'simplecote_token'

function renderEm(initialEntries: string[]) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <div>tela de login</div> },
      {
        path: '/admin',
        element: <AuthGuard />,
        children: [{ index: true, element: <div>área admin</div> }],
      },
    ],
    { initialEntries }
  )
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

beforeEach(() => {
  sessionStorage.clear()
})

test('sem token, acessar /admin redireciona para a tela de login', async () => {
  renderEm(['/admin'])

  expect(await screen.findByText('tela de login')).toBeInTheDocument()
  expect(screen.queryByText('área admin')).not.toBeInTheDocument()
})

test('com token semeado, /admin renderiza a área admin', async () => {
  sessionStorage.setItem(SESSION_KEY, 'jwt-semeado')

  renderEm(['/admin'])

  expect(await screen.findByText('área admin')).toBeInTheDocument()
  expect(screen.queryByText('tela de login')).not.toBeInTheDocument()
})
