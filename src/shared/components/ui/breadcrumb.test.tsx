import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { Breadcrumb, type BreadcrumbItem } from './breadcrumb'

function renderBreadcrumb(items: BreadcrumbItem[]) {
  const router = createMemoryRouter(
    [{ path: '/', element: <Breadcrumb items={items} /> }],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

test('itens com to renderizam como link; o último item (sem to) como texto', () => {
  renderBreadcrumb([
    { label: 'Cotações', to: '/admin' },
    { label: 'Compra semanal', to: '/admin/cotacoes/c-1' },
    { label: 'Resultado' },
  ])

  expect(screen.getByRole('link', { name: 'Cotações' })).toHaveAttribute('href', '/admin')
  expect(screen.getByRole('link', { name: 'Compra semanal' })).toHaveAttribute(
    'href',
    '/admin/cotacoes/c-1',
  )
  expect(screen.getByText('Resultado')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Resultado' })).not.toBeInTheDocument()
})

test('item sem to que não é o último também renderiza como texto', () => {
  renderBreadcrumb([
    { label: 'Cotações', to: '/admin' },
    { label: 'Compra semanal' },
    { label: 'Resultado' },
  ])

  expect(screen.getByRole('link', { name: 'Cotações' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Compra semanal' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Resultado' })).not.toBeInTheDocument()
})
