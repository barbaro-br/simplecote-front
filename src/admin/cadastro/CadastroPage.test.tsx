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

test('nome "Supermercado do Zé" gera o endereço supermercado-do-ze (campo oculto)', async () => {
  server.use(http.get('*/public/compradores/validar-slug', () => HttpResponse.json('LIVRE')))
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Nome do supermercado'), 'Supermercado do Zé')

  expect(await screen.findByText('supermercado-do-ze.simplecote.app')).toBeInTheDocument()
  // O campo do slug fica oculto até o dono clicar em "Personalizar endereço".
  expect(screen.queryByLabelText('Endereço na web')).not.toBeInTheDocument()
})

test('endereço em uso é resolvido sozinho para a variação -2', async () => {
  server.use(
    http.get('*/public/compradores/validar-slug', ({ request }) => {
      const slug = new URL(request.url).searchParams.get('slug')
      return HttpResponse.json(slug === 'supermercado-do-ze' ? 'EM_USO' : 'LIVRE')
    })
  )
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Nome do supermercado'), 'Supermercado do Zé')

  expect(await screen.findByText('supermercado-do-ze-2.simplecote.app')).toBeInTheDocument()
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeEnabled()
  )
})

test('endereço sempre em uso revela o campo para personalização', async () => {
  server.use(http.get('*/public/compradores/validar-slug', () => HttpResponse.json('EM_USO')))
  const user = userEvent.setup()
  renderPage()

  await user.type(screen.getByLabelText('Nome do supermercado'), 'Supermercado do Zé')

  expect(await screen.findByText('Este endereço já está em uso.')).toBeInTheDocument()
  expect(screen.getByLabelText('Endereço na web')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled()
})

test('slug reservado, ao personalizar, bloqueia o envio sem chamar o back', async () => {
  let chamouBack = 0
  server.use(
    http.get('*/public/compradores/validar-slug', () => {
      chamouBack += 1
      return HttpResponse.json('LIVRE')
    })
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: 'Personalizar endereço' }))
  await user.type(screen.getByLabelText('Endereço na web'), 'admin')

  expect(await screen.findByText('Este endereço não está disponível.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Criar conta' })).toBeDisabled()
  expect(chamouBack).toBe(0)
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
