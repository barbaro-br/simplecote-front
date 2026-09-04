import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { UsuariosPage } from './UsuariosPage'

const U1 = '55555555-5555-4555-8555-555555555555'
const U2 = '66666666-6666-4666-8666-666666666666'
const U_NOVO = '77777777-7777-4777-8777-777777777777'

type Usuario = { id: string; nome: string; email: string; papel: string; ativo: boolean }

let usuarios: Usuario[]
let senhaBody: any

beforeEach(() => {
  usuarios = [
    { id: U1, nome: 'Ana Admin', email: 'ana@x.com', papel: 'ADMIN', ativo: true },
    { id: U2, nome: 'Beto Velho', email: 'beto@x.com', papel: 'OPERADOR', ativo: false },
  ]
  senhaBody = undefined
  server.use(
    http.get('*/api/usuarios', () => HttpResponse.json(usuarios)),
    http.post('*/api/usuarios', async ({ request }) => {
      const body = (await request.json()) as any
      const novo: Usuario = { id: U_NOVO, ativo: true, nome: body.nome, email: body.email, papel: body.papel }
      usuarios.push(novo)
      return HttpResponse.json(novo, { status: 201 })
    }),
    http.put('*/api/usuarios/:id', async ({ request, params }) => {
      const body = (await request.json()) as any
      const u = usuarios.find((x) => x.id === params.id)!
      Object.assign(u, body)
      return HttpResponse.json(u)
    }),
    http.post('*/api/usuarios/:id/senha', async ({ request }) => {
      senhaBody = await request.json()
      return new HttpResponse(null, { status: 204 })
    }),
    http.post('*/api/usuarios/:id/inativar', ({ params }) => {
      const u = usuarios.find((x) => x.id === params.id)
      if (u) u.ativo = false
      return new HttpResponse(null, { status: 204 })
    }),
  )
})

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <UsuariosPage />
    </QueryClientProvider>,
  )
}

test('lista usuários com papel (badge) e status', async () => {
  renderPage()
  expect(await screen.findByText('Ana Admin')).toBeInTheDocument()
  expect(screen.getByText('Administrador')).toBeInTheDocument()
  expect(screen.getByText('Operador')).toBeInTheDocument()
  expect(screen.getByText('Inativo')).toBeInTheDocument()
})

test('estado vazio', async () => {
  usuarios = []
  renderPage()
  expect(await screen.findByText(/Nenhum usuário cadastrado/i)).toBeInTheDocument()
})

test('estado de erro não quebra', async () => {
  server.use(
    http.get('*/api/usuarios', () =>
      HttpResponse.json({ title: 'Erro', status: 500, detail: 'boom' }, { status: 500 }),
    ),
  )
  renderPage()
  expect(await screen.findByText(/Erro ao carregar usuários/i)).toBeInTheDocument()
})

test('criar: tem campo de senha, valida e recarrega a lista', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana Admin')

  await user.click(screen.getByRole('button', { name: /Novo usuário/i }))
  const dialog = within(screen.getByRole('dialog'))
  expect(dialog.getByLabelText(/Senha inicial/i)).toBeInTheDocument()

  // nome vazio + email inválido → validação
  await user.type(dialog.getByLabelText('E-mail'), 'nao-e-email')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))
  expect(await dialog.findByText(/Nome é obrigatório/i)).toBeInTheDocument()
  expect(dialog.getByText(/E-mail inválido/i)).toBeInTheDocument()

  // senha curta → erro
  await user.type(dialog.getByLabelText('Nome'), 'Carla')
  await user.clear(dialog.getByLabelText('E-mail'))
  await user.type(dialog.getByLabelText('E-mail'), 'carla@x.com')
  await user.type(dialog.getByLabelText(/Senha inicial/i), 'curta')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))
  expect(await dialog.findByText(/Mínimo 8 caracteres/i)).toBeInTheDocument()

  // senha ok → salva
  await user.type(dialog.getByLabelText(/Senha inicial/i), '123')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(await screen.findByText('Carla')).toBeInTheDocument()
})

test('editar: não tem campo de senha; erro do backend aparece', async () => {
  server.use(
    http.put('*/api/usuarios/:id', () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Conflito', status: 409, detail: 'E-mail em uso' },
        { status: 409, headers: { 'content-type': 'application/problem+json' } },
      ),
    ),
  )
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana Admin')

  await user.click(screen.getAllByRole('button', { name: 'Editar' })[0])
  const dialog = within(screen.getByRole('dialog'))
  expect(dialog.queryByLabelText(/Senha inicial/i)).toBeNull()

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))
  expect(await dialog.findByText('E-mail em uso')).toBeInTheDocument()
})

test('trocar senha: form próprio; senhas diferentes não enviam; iguais enviam só {senha}', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana Admin')

  await user.click(screen.getAllByRole('button', { name: 'Trocar senha' })[0])
  const dialog = within(screen.getByRole('dialog'))
  expect(dialog.getByRole('heading', { name: 'Trocar senha' })).toBeInTheDocument()

  await user.type(dialog.getByLabelText('Nova senha'), 'senha1234')
  await user.type(dialog.getByLabelText('Confirmar senha'), 'outra1234')
  await user.click(dialog.getByRole('button', { name: 'Trocar senha' }))

  expect(await dialog.findByText(/As senhas não conferem/i)).toBeInTheDocument()
  expect(senhaBody).toBeUndefined()

  await user.clear(dialog.getByLabelText('Confirmar senha'))
  await user.type(dialog.getByLabelText('Confirmar senha'), 'senha1234')
  await user.click(dialog.getByRole('button', { name: 'Trocar senha' }))

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(senhaBody).toEqual({ senha: 'senha1234' })
})

test('inativar: confirmação marca inativo; sem botão de reativar', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana Admin')

  // Ana (ativa) é a única com "Inativar"
  await user.click(screen.getByRole('button', { name: 'Inativar' }))
  const confirm = within(await screen.findByRole('dialog'))
  await user.click(confirm.getByRole('button', { name: 'Inativar' }))

  await waitFor(() => expect(screen.getAllByText('Inativo')).toHaveLength(2))
  expect(screen.queryByRole('button', { name: 'Ativar' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Inativar' })).toBeNull()
})

test('cadastro: revelar senha alterna type e aria-label do botão', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana Admin')

  await user.click(screen.getByRole('button', { name: /Novo usuário/i }))
  const dialog = within(screen.getByRole('dialog'))

  const senha = dialog.getByLabelText(/Senha inicial/i)
  expect(senha).toHaveAttribute('type', 'password')

  const botao = dialog.getByRole('button', { name: 'Mostrar senha' })
  await user.click(botao)
  expect(senha).toHaveAttribute('type', 'text')
  expect(dialog.getByRole('button', { name: 'Ocultar senha' })).toBeInTheDocument()

  await user.click(dialog.getByRole('button', { name: 'Ocultar senha' }))
  expect(senha).toHaveAttribute('type', 'password')
})

test('cadastro: indicador de tamanho mínimo muda ao atingir 8+', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana Admin')

  await user.click(screen.getByRole('button', { name: /Novo usuário/i }))
  const dialog = within(screen.getByRole('dialog'))

  const senha = dialog.getByLabelText(/Senha inicial/i)
  const indicador = () => dialog.getByText('8+ caracteres')

  await user.type(senha, 'curta')
  expect(indicador()).toHaveClass('text-muted-foreground')

  await user.type(senha, '123')
  expect(indicador()).toHaveClass('text-success')
})

test('cadastro: indicador ao vivo não substitui a validação de submit', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana Admin')

  await user.click(screen.getByRole('button', { name: /Novo usuário/i }))
  const dialog = within(screen.getByRole('dialog'))

  await user.type(dialog.getByLabelText('Nome'), 'Carla')
  await user.type(dialog.getByLabelText('E-mail'), 'carla@x.com')
  await user.type(dialog.getByLabelText(/Senha inicial/i), 'curta')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  expect(await dialog.findByText(/Mínimo 8 caracteres/i)).toBeInTheDocument()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('trocar senha: revelar de cada campo é independente', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana Admin')

  await user.click(screen.getAllByRole('button', { name: 'Trocar senha' })[0])
  const dialog = within(screen.getByRole('dialog'))

  const nova = dialog.getByLabelText('Nova senha')
  const confirmar = dialog.getByLabelText('Confirmar senha')
  expect(nova).toHaveAttribute('type', 'password')
  expect(confirmar).toHaveAttribute('type', 'password')

  await user.click(dialog.getByRole('button', { name: 'Mostrar nova senha' }))
  expect(nova).toHaveAttribute('type', 'text')
  expect(confirmar).toHaveAttribute('type', 'password')
  expect(dialog.getByRole('button', { name: 'Ocultar nova senha' })).toBeInTheDocument()

  await user.click(dialog.getByRole('button', { name: 'Mostrar confirmação de senha' }))
  expect(confirmar).toHaveAttribute('type', 'text')
  expect(nova).toHaveAttribute('type', 'text')
})

test('trocar senha: indicador de coincidência muda ao vivo', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana Admin')

  await user.click(screen.getAllByRole('button', { name: 'Trocar senha' })[0])
  const dialog = within(screen.getByRole('dialog'))

  await user.type(dialog.getByLabelText('Nova senha'), 'senha1234')
  await user.type(dialog.getByLabelText('Confirmar senha'), 'outra1234')
  expect(dialog.getByText('As senhas ainda não coincidem')).toBeInTheDocument()

  await user.clear(dialog.getByLabelText('Confirmar senha'))
  await user.type(dialog.getByLabelText('Confirmar senha'), 'senha1234')
  expect(dialog.getByText('As senhas coincidem')).toBeInTheDocument()
})
