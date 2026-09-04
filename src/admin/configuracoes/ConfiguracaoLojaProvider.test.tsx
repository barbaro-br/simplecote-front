import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfiguracaoLojaProvider } from './ConfiguracaoLojaProvider'
import { resetarMock, definirConfiguracaoMock } from './configuracoes.api'

function renderProvider() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ConfiguracaoLojaProvider>
        <span>conteúdo</span>
      </ConfiguracaoLojaProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetarMock()
  document.documentElement.classList.remove('dark')
})

afterEach(() => {
  document.documentElement.classList.remove('dark')
})

test('tema ESCURO adiciona a classe dark ao elemento raiz', async () => {
  definirConfiguracaoMock({ tema: 'ESCURO' })
  renderProvider()

  await waitFor(() => {
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

test('tema CLARO não adiciona a classe dark', async () => {
  definirConfiguracaoMock({ tema: 'CLARO' })
  renderProvider()

  await screen.findByText('conteúdo')
  await waitFor(() => {
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

test('tema ausente não adiciona a classe dark', async () => {
  renderProvider()

  await screen.findByText('conteúdo')
  await waitFor(() => {
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
