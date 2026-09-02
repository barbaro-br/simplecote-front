import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { RedefinirSenhaPage } from './RedefinirSenhaPage'

function renderPage(token: string) {
  const router = createMemoryRouter(
    [
      { path: '/redefinir-senha/:token', element: <RedefinirSenhaPage /> },
      { path: '/login', element: <div>login view</div> },
      { path: '/esqueci-senha', element: <div>esqueci senha view</div> },
    ],
    { initialEntries: [`/redefinir-senha/${token}`] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

test('submissão com token válido exibe a confirmação de sucesso', async () => {
  const user = userEvent.setup()
  renderPage('token-valido')

  await user.type(screen.getByLabelText('Nova senha'), 'senha12345')
  await user.type(screen.getByLabelText('Confirmar senha'), 'senha12345')
  await user.click(screen.getByRole('button', { name: 'Redefinir senha' }))

  expect(await screen.findByText(/Sua senha foi alterada com sucesso/)).toBeInTheDocument()
})

test('após sucesso, mostra o contador de redirecionamento e mantém o link clicável', async () => {
  const user = userEvent.setup()
  renderPage('token-valido')

  await user.type(screen.getByLabelText('Nova senha'), 'senha12345')
  await user.type(screen.getByLabelText('Confirmar senha'), 'senha12345')
  await user.click(screen.getByRole('button', { name: 'Redefinir senha' }))

  expect(await screen.findByText(/Redirecionando em 3/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ir para o login' })).toHaveAttribute('href', '/login')
})

test('confirmação não bate: aponta a divergência e não envia', async () => {
  const user = userEvent.setup()
  renderPage('token-valido')

  await user.type(screen.getByLabelText('Nova senha'), 'senha12345')
  await user.type(screen.getByLabelText('Confirmar senha'), 'senha-diferente')
  await user.click(screen.getByRole('button', { name: 'Redefinir senha' }))

  expect(await screen.findByText('As senhas não conferem')).toBeInTheDocument()
  expect(screen.getByLabelText('Nova senha')).toBeInTheDocument()
})

test('token inválido: exibe mensagem clara sem expor o formulário', async () => {
  const user = userEvent.setup()
  renderPage('token-invalido')

  await user.type(screen.getByLabelText('Nova senha'), 'senha12345')
  await user.type(screen.getByLabelText('Confirmar senha'), 'senha12345')
  await user.click(screen.getByRole('button', { name: 'Redefinir senha' }))

  expect(await screen.findByText(/inválido ou expirou/)).toBeInTheDocument()
  expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Solicitar novo link' })).toBeInTheDocument()
})
