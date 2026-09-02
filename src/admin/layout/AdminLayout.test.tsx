import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { resetarMock } from '../configuracoes/configuracoes.api'
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
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetarMock()
  if (!window.localStorage) {
    let store: Record<string, string> = {}
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString() },
        removeItem: (key: string) => { delete store[key] },
        clear: () => { store = {} }
      },
      writable: true
    })
  }
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
  await user.unhover(screen.getByRole('button', { name: 'Expandir menu' }))

  expect(screen.getByText('Produtos')).toHaveClass('opacity-0')
  expect(screen.getByRole('link', { name: 'Produtos' })).toBeInTheDocument()
  expect(localStorage.getItem('simplecote:sidebar')).toBe('1')

  unmount()

  renderLayout('/admin/produtos')
  expect(screen.getByText('Produtos')).toHaveClass('opacity-0')
  expect(screen.getByRole('button', { name: 'Expandir menu' })).toBeInTheDocument()
})

test('3.3 — o menu tem Dashboard (raiz) e Cotações apontando para /admin/cotacoes', () => {
  renderLayout('/admin')
  expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/admin')
  expect(screen.getByRole('link', { name: 'Cotações' })).toHaveAttribute('href', '/admin/cotacoes')
})

test('3.4 — o conteúdo fica dentro de um wrapper centralizado (max-w-7xl / mx-auto)', () => {
  const { container } = renderLayout('/admin/produtos')
  const wrapper = container.querySelector('main > div.mx-auto.max-w-7xl')
  expect(wrapper).not.toBeNull()
})

test('4.1 — o shell não rola como documento: root em h-screen e <main> é o container de scroll', () => {
  const { container } = renderLayout('/admin/produtos')

  const main = container.querySelector('main')
  expect(main).not.toBeNull()
  expect(main!.parentElement).toHaveClass('h-screen')
  expect(main!.parentElement).toHaveClass('overflow-hidden')

  expect(main).toHaveClass('flex-1')
  expect(main).toHaveClass('h-screen')
  expect(main).toHaveClass('overflow-y-auto')
})

test('4.1 — a sidebar permanece fixa (sticky top-0 h-screen) durante o scroll', () => {
  const { container } = renderLayout('/admin/produtos')

  const aside = container.querySelector('aside')
  expect(aside).not.toBeNull()
  expect(aside).toHaveClass('sticky')
  expect(aside).toHaveClass('top-0')
  expect(aside).toHaveClass('h-screen')
})

test('exibe o nome da loja configurado no cabeçalho e o item Configurações na sidebar', async () => {
  renderLayout('/admin/produtos')

  expect(await screen.findByText('Sara Supermercado')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Configurações' })).toHaveAttribute('href', '/admin/configuracoes')
})
