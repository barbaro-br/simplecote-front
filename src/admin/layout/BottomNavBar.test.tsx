import { act, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { BottomNavBar } from './BottomNavBar'

type Listener = (event: { matches: boolean }) => void

let telaLarga = false
const listeners = new Set<Listener>()

function matchMediaMock(query: string): MediaQueryList {
  return {
    get matches() {
      return query.includes('min-width: 768px') ? telaLarga : false
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: Listener) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: string, listener: Listener) => {
      listeners.delete(listener)
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList
}

function renderBarra() {
  const router = createMemoryRouter(
    [{ path: '/', element: <BottomNavBar onLogout={() => {}} /> }],
    { initialEntries: ['/'] },
  )
  return render(<RouterProvider router={router} />)
}

beforeEach(() => {
  telaLarga = false
  listeners.clear()
  Object.defineProperty(window, 'matchMedia', {
    value: matchMediaMock,
    writable: true,
    configurable: true,
  })
})

test('largura estreita: 3 itens fixos + botão Mais', () => {
  telaLarga = false
  renderBarra()

  expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Cotações' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Produtos' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mais' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Empresas' })).not.toBeInTheDocument()
})

test('largura larga: 7 itens direto, sem botão Mais', () => {
  telaLarga = true
  renderBarra()

  expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Cotações' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Produtos' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Empresas' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Análises' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Configurações' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Mais' })).not.toBeInTheDocument()
})

test('alterna entre os modos em tempo real ao cruzar 768px', () => {
  telaLarga = false
  renderBarra()

  expect(screen.getByRole('button', { name: 'Mais' })).toBeInTheDocument()

  act(() => {
    for (const listener of listeners) listener({ matches: true })
  })

  expect(screen.queryByRole('button', { name: 'Mais' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Empresas' })).toBeInTheDocument()
})
