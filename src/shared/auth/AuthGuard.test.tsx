import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from './AuthContext'
import { AuthGuard } from './AuthGuard'

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

test('sem token, acessar /admin redireciona para a tela de login', async () => {
  // default handler em setupTests.ts: refresh → 401 (sem cookie)
  renderEm(['/admin'])

  expect(await screen.findByText('tela de login')).toBeInTheDocument()
  expect(screen.queryByText('área admin')).not.toBeInTheDocument()
})

test('com refresh ok no boot, /admin renderiza a área admin', async () => {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'jwt-semeado' })))

  renderEm(['/admin'])

  expect(await screen.findByText('área admin')).toBeInTheDocument()
  expect(screen.queryByText('tela de login')).not.toBeInTheDocument()
})
