import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

function renderBarra(mostrarMembros = true) {
  const router = createMemoryRouter(
    [{ path: '/', element: <BottomNavBar onLogout={() => {}} mostrarMembros={mostrarMembros} /> }],
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

test('largura larga: itens direto, sem botão Mais', () => {
  telaLarga = true
  renderBarra()

  expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Cotações' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Produtos' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Pedidos' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Empresas' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Membros' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Análises' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Configurações' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Mais' })).not.toBeInTheDocument()
})

// Regressão: achado real — em tela larga (estiloNavegacao INFERIOR/rodapé
// >=768px) não tem menu "Mais" (todos os itens vão direto na barra), e o
// botão de sair só existia dentro desse menu — sumia por completo nesse caso.
test('largura larga: tem botão de sair direto na barra (sem menu Mais pra guardá-lo)', () => {
  telaLarga = true
  const onLogout = vi.fn()
  const router = createMemoryRouter(
    [{ path: '/', element: <BottomNavBar onLogout={onLogout} mostrarMembros={true} /> }],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)

  const botaoSair = screen.getByRole('button', { name: 'Sair' })
  expect(botaoSair).toBeInTheDocument()

  botaoSair.click()

  expect(onLogout).toHaveBeenCalledOnce()
})

test('largura estreita: item "Pedidos" aparece dentro do menu Mais', async () => {
  telaLarga = false
  const user = userEvent.setup()
  renderBarra()

  await user.click(screen.getByRole('button', { name: 'Mais' }))

  expect(screen.getByRole('menuitem', { name: /Pedidos/ })).toBeInTheDocument()
})

test('mostrarMembros=false esconde o item Membros', () => {
  telaLarga = true
  renderBarra(false)

  expect(screen.getByRole('link', { name: 'Usuários' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Membros' })).not.toBeInTheDocument()
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
