import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { useAuth } from '@/shared/auth/useAuth'
import { ConfiguracaoLojaProvider } from './ConfiguracaoLojaProvider'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'

const TOKEN = 'simplecote_token'

function BotaoLogout() {
  const { logout } = useAuth()
  return (
    <button type="button" onClick={logout}>
      Sair
    </button>
  )
}

function renderProvider(autenticado = false, children: ReactNode = <span>conteúdo</span>) {
  if (autenticado) {
    sessionStorage.setItem(TOKEN, 'token-teste')
  } else {
    sessionStorage.removeItem(TOKEN)
  }
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ConfiguracaoLojaProvider>{children}</ConfiguracaoLojaProvider>
      </QueryClientProvider>
    </AuthProvider>,
  )
}

beforeEach(() => {
  document.documentElement.classList.remove('dark')
  sessionStorage.removeItem(TOKEN)
  document.title = 'SimpleCote'
})

afterEach(() => {
  document.documentElement.classList.remove('dark')
  sessionStorage.removeItem(TOKEN)
  document.title = 'SimpleCote'
})

test('tema ESCURO adiciona a classe dark ao elemento raiz', async () => {
  server.use(
    http.get('*/api/configuracoes', () => HttpResponse.json({ tema: 'ESCURO' }))
  )
  renderProvider(true)

  await waitFor(() => {
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

test('tema CLARO não adiciona a classe dark', async () => {
  server.use(
    http.get('*/api/configuracoes', () => HttpResponse.json({ tema: 'CLARO' }))
  )
  renderProvider(true)

  await screen.findByText('conteúdo')
  await waitFor(() => {
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

test('tema ausente não adiciona a classe dark', async () => {
  server.use(
    http.get('*/api/configuracoes', () => HttpResponse.json({}))
  )
  renderProvider(true)

  await screen.findByText('conteúdo')
  await waitFor(() => {
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

test('desautenticado não busca /api/configuracoes nem aplica tema', async () => {
  let chamadas = 0
  server.use(
    http.get('*/api/configuracoes', () => {
      chamadas += 1
      return HttpResponse.json({ tema: 'ESCURO' })
    })
  )
  renderProvider(false)

  await screen.findByText('conteúdo')
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(chamadas).toBe(0)
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('autenticado com config carregada usa "<nome da loja> · SimpleCote" no título da aba', async () => {
  server.use(
    http.get('*/api/configuracoes', () => HttpResponse.json({ nome: 'Mercado Teste' }))
  )
  renderProvider(true)

  await waitFor(() => {
    expect(document.title).toBe('Mercado Teste · SimpleCote')
  })
})

test('config sem nome mantém o título da aba como "SimpleCote"', async () => {
  server.use(
    http.get('*/api/configuracoes', () => HttpResponse.json({ tema: 'CLARO' }))
  )
  renderProvider(true)

  await waitFor(() => {
    expect(document.title).toBe('SimpleCote')
  })
})

test('logout volta o título da aba para "SimpleCote"', async () => {
  const user = userEvent.setup()
  server.use(
    http.get('*/api/configuracoes', () => HttpResponse.json({ nome: 'Mercado Teste' }))
  )
  renderProvider(true, <BotaoLogout />)

  await waitFor(() => {
    expect(document.title).toBe('Mercado Teste · SimpleCote')
  })

  await user.click(screen.getByRole('button', { name: 'Sair' }))

  await waitFor(() => {
    expect(document.title).toBe('SimpleCote')
  })
  expect(sessionStorage.getItem(TOKEN)).toBeNull()
})
