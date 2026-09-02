import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { EsqueciSenhaPage } from './EsqueciSenhaPage'

const MENSAGEM_GENERICA = /Se este e-mail estiver cadastrado, enviaremos um link/

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/esqueci-senha', element: <EsqueciSenhaPage /> },
      { path: '/login', element: <div>login view</div> },
    ],
    { initialEntries: ['/esqueci-senha'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

test('solicitação com e-mail cadastrado exibe a confirmação genérica', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('E-mail'), 'admin@dev.local')
  await user.click(screen.getByRole('button', { name: 'Enviar link' }))

  expect(await screen.findByText(MENSAGEM_GENERICA)).toBeInTheDocument()
})

test('solicitação com e-mail inexistente exibe a MESMA confirmação genérica', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('E-mail'), 'nao-existe@dev.local')
  await user.click(screen.getByRole('button', { name: 'Enviar link' }))

  expect(await screen.findByText(MENSAGEM_GENERICA)).toBeInTheDocument()
})

test('validação: submeter e-mail vazio mostra erro inline e não envia', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: 'Enviar link' }))

  expect(await screen.findByText('E-mail obrigatório')).toBeInTheDocument()
  expect(screen.queryByText(MENSAGEM_GENERICA)).not.toBeInTheDocument()
})

test('e-mail gmail.com mostra botão "Abrir Gmail" com target=_blank', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('E-mail'), 'usuario@gmail.com')
  await user.click(screen.getByRole('button', { name: 'Enviar link' }))

  const link = await screen.findByRole('link', { name: 'Abrir Gmail' })
  expect(link).toHaveAttribute('href', 'https://mail.google.com/mail/u/0/#search/in%3Ainbox')
  expect(link).toHaveAttribute('target', '_blank')
})

test('e-mail outlook.com mostra botão "Abrir Outlook" com target=_blank', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('E-mail'), 'usuario@outlook.com')
  await user.click(screen.getByRole('button', { name: 'Enviar link' }))

  const link = await screen.findByRole('link', { name: 'Abrir Outlook' })
  expect(link).toHaveAttribute('href', 'https://outlook.live.com/mail/0/inbox')
  expect(link).toHaveAttribute('target', '_blank')
})

test('domínio não reconhecido não mostra botão de provedor de e-mail', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('E-mail'), 'usuario@empresa.com.br')
  await user.click(screen.getByRole('button', { name: 'Enviar link' }))

  expect(await screen.findByText(MENSAGEM_GENERICA)).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Abrir Gmail' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Abrir Outlook' })).not.toBeInTheDocument()
})
