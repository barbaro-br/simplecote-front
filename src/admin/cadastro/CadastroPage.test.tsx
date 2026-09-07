import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { CadastroPage } from './CadastroPage'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CadastroPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

test('e-mail inválido e senha curta não enviam', async () => {
  let postCadastro = 0
  server.use(
    http.get('*/public/compradores/validar-slug', () => HttpResponse.json('LIVRE')),
    http.post('*/public/cadastro', () => {
      postCadastro += 1
      return new HttpResponse(null, { status: 201 })
    })
  )
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Nome do supermercado'), 'Mercado')
  await user.type(screen.getByLabelText('E-mail'), 'email-invalido')
  await user.type(screen.getByLabelText('Senha'), 'curta')

  await screen.findByText('Disponível')
  await user.click(screen.getByRole('button', { name: 'Criar conta' }))

  expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
  expect(screen.getByText('A senha deve ter ao menos 8 caracteres')).toBeInTheDocument()
  expect(postCadastro).toBe(0)
})

test('nome "Supermercado do Zé" sugere o slug supermercado-do-ze', async () => {
  server.use(http.get('*/public/compradores/validar-slug', () => HttpResponse.json('LIVRE')))
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Nome do supermercado'), 'Supermercado do Zé')

  await waitFor(() => {
    expect((screen.getByLabelText('Endereço da loja') as HTMLInputElement).value).toBe(
      'supermercado-do-ze'
    )
  })
  expect(screen.getByText('supermercado-do-ze.simplecote.app')).toBeInTheDocument()
})

test('slug em uso bloqueia o envio', async () => {
  server.use(http.get('*/public/compradores/validar-slug', () => HttpResponse.json('EM_USO')))
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Nome do supermercado'), 'Supermercado do Zé')

  expect(await screen.findByText('Este endereço já está em uso.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled()
})

test('slug reservado bloqueia o envio sem chamar o back', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Endereço da loja'), 'admin')

  expect(await screen.findByText('Este endereço não está disponível.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled()
})

test('cadastro com sucesso mostra "Confira seu e-mail"', async () => {
  server.use(
    http.get('*/public/compradores/validar-slug', () => HttpResponse.json('LIVRE')),
    http.post('*/public/cadastro', () => new HttpResponse(null, { status: 201 }))
  )
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Nome do supermercado'), 'Mercado Central')
  await user.type(screen.getByLabelText('E-mail'), 'dono@mercado.com')
  await user.type(screen.getByLabelText('Senha'), 'senha-forte-123')

  await screen.findByText('Disponível')
  await user.click(screen.getByRole('button', { name: 'Criar conta' }))

  expect(await screen.findByText('Confira seu e-mail')).toBeInTheDocument()
  expect(screen.getByText(/dono@mercado.com/)).toBeInTheDocument()
})

test('erro de e-mail duplicado aparece no formulário', async () => {
  server.use(
    http.get('*/public/compradores/validar-slug', () => HttpResponse.json('LIVRE')),
    http.post('*/public/cadastro', () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Não processável', status: 422, detail: 'E-mail já cadastrado.' },
        { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
      )
    )
  )
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Nome do supermercado'), 'Mercado Central')
  await user.type(screen.getByLabelText('E-mail'), 'dono@mercado.com')
  await user.type(screen.getByLabelText('Senha'), 'senha-forte-123')

  await screen.findByText('Disponível')
  await user.click(screen.getByRole('button', { name: 'Criar conta' }))

  const alerta = await screen.findByRole('alert')
  expect(alerta).toHaveTextContent('E-mail já cadastrado.')
})
