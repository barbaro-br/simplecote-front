import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { ConfiguracaoLojaProvider } from './ConfiguracaoLojaProvider'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'

const TOKEN = 'simplecote_token'

function renderProvider(autenticado = false) {
  if (autenticado) {
    sessionStorage.setItem(TOKEN, 'token-teste')
  } else {
    sessionStorage.removeItem(TOKEN)
  }
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ConfiguracaoLojaProvider>
          <span>conteúdo</span>
        </ConfiguracaoLojaProvider>
      </QueryClientProvider>
    </AuthProvider>,
  )
}

beforeEach(() => {
  document.documentElement.classList.remove('dark')
  sessionStorage.removeItem(TOKEN)
})

afterEach(() => {
  document.documentElement.classList.remove('dark')
  sessionStorage.removeItem(TOKEN)
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
