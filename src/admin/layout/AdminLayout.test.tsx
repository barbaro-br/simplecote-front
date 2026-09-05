import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { CREDITO_DESENVOLVEDOR } from '@/shared/creditos-desenvolvedor'
import { resetarMock, definirConfiguracaoMock } from '../configuracoes/configuracoes.api'
import { AdminLayout } from './AdminLayout'

function renderLayout(initial = '/admin/produtos', estilo: 'LATERAL' | 'INFERIOR' = 'LATERAL') {
  definirConfiguracaoMock({ estiloNavegacao: estilo })
  const router = createMemoryRouter(
    [
      { path: '/login', element: <div>login view</div> },
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <div>Dashboard view</div> },
          { path: 'cotacoes', element: <div>Cotações view</div> },
          { path: 'produtos', element: <div>Produtos view</div> },
          { path: 'empresas', element: <div>Empresas view</div> },
          { path: 'usuarios', element: <div>Usuários view</div> },
          { path: 'analises', element: <div>Análises view</div> },
          { path: 'configuracoes', element: <div>Configurações view</div> },
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

  expect(await screen.findByText('Supermercado Sarah')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Configurações' })).toHaveAttribute('href', '/admin/configuracoes')
})

test('5.2 — o nome da loja ocupa o espaço flexível (flex-1 min-w-0) e usa truncate para só cortar quando necessário', async () => {
  renderLayout('/admin/produtos')

  const nome = await screen.findByText('Supermercado Sarah')
  expect(nome).toHaveClass('flex-1')
  expect(nome).toHaveClass('min-w-0')
  expect(nome).toHaveClass('truncate')
})

test('logout na sidebar navega para /login', async () => {
  const user = userEvent.setup()
  renderLayout('/admin/produtos')

  await user.click(await screen.findByRole('button', { name: 'Sair' }))

  expect(await screen.findByText('login view')).toBeInTheDocument()
})

test('renderiza o crédito de desenvolvedor com a sidebar expandida e o esconde ao recolher', async () => {
  const user = userEvent.setup()
  renderLayout('/admin/produtos')

  const credito = screen.getByText(CREDITO_DESENVOLVEDOR.texto)
  expect(credito).toBeInTheDocument()
  expect(credito).not.toHaveClass('opacity-0')

  await user.click(screen.getByRole('button', { name: 'Recolher menu' }))
  await user.unhover(screen.getByRole('button', { name: 'Expandir menu' }))

  expect(screen.getByText(CREDITO_DESENVOLVEDOR.texto)).toHaveClass('opacity-0')
})

test('3.1 — o botão flutuante de ajuda está presente no DOM ao renderizar AdminLayout', () => {
  renderLayout('/admin/produtos')
  expect(screen.getByRole('button', { name: 'Ajuda' })).toBeInTheDocument()
})

test('3.2 — clicar no botão abre o modal "Ajuda" com as 4 perguntas listadas', async () => {
  const user = userEvent.setup()
  renderLayout('/admin/produtos')

  await user.click(screen.getByRole('button', { name: 'Ajuda' }))

  expect(screen.getByRole('heading', { name: 'Ajuda' })).toBeInTheDocument()
  expect(screen.getByText('Como criar uma nova cotação?')).toBeInTheDocument()
  expect(screen.getByText('Como convidar representantes?')).toBeInTheDocument()
  expect(screen.getByText('Como apurar uma cotação e gerar pedidos?')).toBeInTheDocument()
  expect(screen.getByText('Como cancelar uma cotação?')).toBeInTheDocument()
})

test('3.3 — clicar numa pergunta expande a resposta correspondente', async () => {
  const user = userEvent.setup()
  renderLayout('/admin/produtos')

  await user.click(screen.getByRole('button', { name: 'Ajuda' }))

  const resumo = screen.getByText('Como criar uma nova cotação?')
  const details = resumo.closest('details') as HTMLDetailsElement
  expect(details.open).toBe(false)

  await user.click(resumo)

  expect(details.open).toBe(true)
  expect(
    screen.getByText(/acesse Cotações e clique em "Nova cotação"/),
  ).toBeInTheDocument()
})

describe('estilo Inferior (BottomNavBar)', () => {
  test('renderiza barra inferior fixa com 4 itens (3 fixos + Mais), sem sidebar', async () => {
    const { container } = renderLayout('/admin/produtos', 'INFERIOR')

    expect(await screen.findByRole('button', { name: 'Mais' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/admin')
    expect(screen.getByRole('link', { name: 'Cotações' })).toHaveAttribute('href', '/admin/cotacoes')
    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('href', '/admin/produtos')
    expect(container.querySelector('aside')).toBeNull()

    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('fixed')
    expect(nav).toHaveClass('bottom-0')
  })

  test('destaca o item ativo na barra inferior', async () => {
    renderLayout('/admin/produtos', 'INFERIOR')

    expect(await screen.findByRole('button', { name: 'Mais' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  test('botão Mais abre o menu com os itens restantes e navega ao clicar', async () => {
    const user = userEvent.setup()
    renderLayout('/admin', 'INFERIOR')

    await user.click(await screen.findByRole('button', { name: 'Mais' }))

    expect(screen.getByRole('menuitem', { name: 'Empresas' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Análises' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Configurações' })).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Empresas' }))

    expect(await screen.findByText('Empresas view')).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Empresas' })).not.toBeInTheDocument()
  })

  test('logout acessível pelo menu Mais navega para /login', async () => {
    const user = userEvent.setup()
    renderLayout('/admin', 'INFERIOR')

    await user.click(await screen.findByRole('button', { name: 'Mais' }))
    await user.click(screen.getByRole('menuitem', { name: 'Sair' }))

    expect(await screen.findByText('login view')).toBeInTheDocument()
  })

  test('mantém o conteúdo centralizado e o <main> como container de scroll', async () => {
    const { container } = renderLayout('/admin/produtos', 'INFERIOR')

    await screen.findByRole('button', { name: 'Mais' })
    const main = container.querySelector('main')
    expect(main).not.toBeNull()
    expect(main).toHaveClass('overflow-y-auto')
    expect(container.querySelector('main > div.mx-auto.max-w-7xl')).not.toBeNull()
  })
})
