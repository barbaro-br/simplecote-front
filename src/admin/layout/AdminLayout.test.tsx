import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { AdminLayout } from './AdminLayout'

function renderLayout(initial = '/admin/produtos') {
  const router = createMemoryRouter(
    [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <div>Cotações view</div> },
          { path: 'produtos', element: <div>Produtos view</div> },
          { path: 'empresas', element: <div>Empresas view</div> },
        ],
      },
    ],
    { initialEntries: [initial] },
  )
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

test('3.1 — a rota atual destaca o item de nav correspondente', () => {
  renderLayout('/admin/produtos')
  expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Cotações' })).not.toHaveAttribute('aria-current')
})

test('3.2 — o botão sanduíche colapsa a sidebar e persiste em localStorage', async () => {
  const user = userEvent.setup()
  const { unmount } = renderLayout('/admin/produtos')

  expect(screen.getByText('Produtos')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Recolher menu' }))

  expect(screen.queryByText('Produtos')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Produtos' })).toBeInTheDocument()
  expect(localStorage.getItem('simplecote:sidebar')).toBe('1')

  unmount()

  renderLayout('/admin/produtos')
  expect(screen.queryByText('Produtos')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Expandir menu' })).toBeInTheDocument()
})
