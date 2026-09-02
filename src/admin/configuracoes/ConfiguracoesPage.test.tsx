import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfiguracoesPage } from './ConfiguracoesPage'
import { resetarMock, definirFalhaAoSalvar } from './configuracoes.api'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ConfiguracoesPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  resetarMock()
})

test('carrega e exibe os valores atuais da configuração', async () => {
  renderPage()

  expect(await screen.findByLabelText('Nome da loja')).toHaveValue('Sara Supermercado')
  expect(screen.getByLabelText('Telefone da loja')).toHaveValue('(11) 4002-8922')
})

test('salvar alteração persiste e reflete o novo valor', async () => {
  const user = userEvent.setup()
  const { unmount } = renderPage()

  const nomeInput = await screen.findByLabelText('Nome da loja')
  await user.clear(nomeInput)
  await user.type(nomeInput, 'Sara Supermercado Novo')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled()
  })

  unmount()

  renderPage()
  expect(await screen.findByLabelText('Nome da loja')).toHaveValue('Sara Supermercado Novo')
})

test('falha ao salvar exibe a mensagem do backend e mantém os valores anteriores', async () => {
  definirFalhaAoSalvar('Telefone inválido')
  const user = userEvent.setup()
  renderPage()

  const nomeInput = await screen.findByLabelText('Nome da loja')
  await user.clear(nomeInput)
  await user.type(nomeInput, 'Outro Nome')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Telefone inválido')
  expect(screen.getByLabelText('Nome da loja')).toHaveValue('Outro Nome')
})

test('estilo de navegação selecionado persiste ao salvar', async () => {
  const user = userEvent.setup()
  const { unmount } = renderPage()

  expect(await screen.findByRole('radio', { name: 'Lateral' })).toBeChecked()
  await user.click(screen.getByRole('radio', { name: 'Inferior' }))
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled()
  })

  unmount()

  renderPage()
  expect(await screen.findByRole('radio', { name: 'Inferior' })).toBeChecked()
})
