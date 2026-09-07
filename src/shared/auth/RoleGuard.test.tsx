import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from './AuthContext'
import { AuthGuard } from './AuthGuard'
import { RoleGuard } from './RoleGuard'

function jwt(papel: string): string {
  const payload = btoa(JSON.stringify({ papel, slug: 'loja', compradorId: 'c1' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

function renderGuard(papel: string) {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: jwt(papel) })))
  const router = createMemoryRouter(
    [
      {
        path: '/admin',
        element: <AuthGuard />,
        children: [
          { index: true, element: <div>dashboard</div> },
          {
            path: 'membros',
            element: <RoleGuard area="membros" />,
            children: [{ index: true, element: <div>membros view</div> }],
          },
        ],
      },
    ],
    { initialEntries: ['/admin/membros'] }
  )
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

test('OPERADOR é barrado de /admin/membros', async () => {
  renderGuard('OPERADOR')

  expect(await screen.findByText('dashboard')).toBeInTheDocument()
  expect(screen.queryByText('membros view')).not.toBeInTheDocument()
})

test('ADMIN acessa /admin/membros', async () => {
  renderGuard('ADMIN')

  expect(await screen.findByText('membros view')).toBeInTheDocument()
})

test('OWNER acessa /admin/membros', async () => {
  renderGuard('OWNER')

  expect(await screen.findByText('membros view')).toBeInTheDocument()
})
