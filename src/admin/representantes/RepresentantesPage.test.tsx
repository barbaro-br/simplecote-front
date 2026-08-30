import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { RepresentantesPage } from './RepresentantesPage'

const E1 = '11111111-1111-4111-8111-111111111111'
const E2 = '22222222-2222-4222-8222-222222222222'
const R1 = '33333333-3333-4333-8333-333333333333'
const R_NOVO = '44444444-4444-4444-8444-444444444444'

type Rep = {
  id: string
  empresaId: string
  nome: string
  email: string
  whatsapp: string | null
  ativo: boolean
}

let reps: Rep[]

const EMPRESAS_ATIVAS = [
  { id: E1, nome: 'Fornecedor A', ativo: true },
  { id: E2, nome: 'Fornecedor B', ativo: true },
]
const EMPRESAS_TODAS = [...EMPRESAS_ATIVAS, { id: 'e3', nome: 'Fornecedor Velho', ativo: false }]

beforeEach(() => {
  reps = [
    { id: R1, empresaId: E1, nome: 'João Silva', email: 'joao@a.com', whatsapp: null, ativo: true },
  ]
  server.use(
    http.get('*/api/empresas', ({ request }) => {
      const incluir = new URL(request.url).searchParams.get('incluirInativos') === 'true'
      return HttpResponse.json(incluir ? EMPRESAS_TODAS : EMPRESAS_ATIVAS)
    }),
    http.get('*/api/representantes', () => HttpResponse.json(reps)),
    http.post('*/api/representantes', async ({ request }) => {
      const body = (await request.json()) as any
      const novo: Rep = { id: R_NOVO, ativo: true, whatsapp: null, ...body }
      reps.push(novo)
      return HttpResponse.json(novo, { status: 201 })
    }),
    http.put('*/api/representantes/:id', async ({ request, params }) => {
      const body = (await request.json()) as any
      const r = reps.find((x) => x.id === params.id)!
      Object.assign(r, body)
      return HttpResponse.json(r)
    }),
    http.post('*/api/representantes/:id/inativar', ({ params }) => {
      const r = reps.find((x) => x.id === params.id)
      if (r) r.ativo = false
      return new HttpResponse(null, { status: 204 })
    }),
  )
})

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RepresentantesPage />
    </QueryClientProvider>,
  )
}

test('lista os representantes com o nome da empresa', async () => {
  renderPage()
  expect(await screen.findByText('João Silva')).toBeInTheDocument()
  expect(screen.getByText('Fornecedor A')).toBeInTheDocument()
})

test('estado vazio', async () => {
  reps = []
  renderPage()
  expect(await screen.findByText(/Nenhum representante cadastrado/i)).toBeInTheDocument()
})

test('estado de erro não quebra a tela', async () => {
  server.use(
    http.get('*/api/representantes', () =>
      HttpResponse.json({ title: 'Erro', status: 500, detail: 'boom' }, { status: 500 }),
    ),
  )
  renderPage()
  expect(await screen.findByText(/Erro ao carregar representantes/i)).toBeInTheDocument()
})

test('criar: mostra o select de empresas ativas, valida e recarrega a lista', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('João Silva')

  await user.click(screen.getByRole('button', { name: /Novo representante/i }))
  const dialog = within(screen.getByRole('dialog'))

  // select presente com as empresas ATIVAS (sem a inativa)
  const select = dialog.getByLabelText('Empresa')
  expect(within(select as HTMLElement).getByRole('option', { name: 'Fornecedor A' })).toBeInTheDocument()
  expect(within(select as HTMLElement).queryByRole('option', { name: 'Fornecedor Velho' })).toBeNull()

  // submit sem empresa → erro
  await user.type(dialog.getByLabelText('Nome'), 'Maria')
  await user.type(dialog.getByLabelText('E-mail'), 'maria@b.com')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))
  expect(await dialog.findByText(/Escolha uma empresa/i)).toBeInTheDocument()

  // escolhe empresa e salva
  await user.selectOptions(select, E2)
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(await screen.findByText('Maria')).toBeInTheDocument()
})

test('criar: email inválido dispara validação', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('João Silva')

  await user.click(screen.getByRole('button', { name: /Novo representante/i }))
  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome'), 'Maria')
  await user.type(dialog.getByLabelText('E-mail'), 'nao-e-email')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  expect(await dialog.findByText(/E-mail inválido/i)).toBeInTheDocument()
})

test('criar: erro do backend aparece no form', async () => {
  server.use(
    http.post('*/api/representantes', () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Conflito', status: 409, detail: 'E-mail já cadastrado' },
        { status: 409, headers: { 'content-type': 'application/problem+json' } },
      ),
    ),
  )
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('João Silva')

  await user.click(screen.getByRole('button', { name: /Novo representante/i }))
  const dialog = within(screen.getByRole('dialog'))
  await user.selectOptions(dialog.getByLabelText('Empresa'), E1)
  await user.type(dialog.getByLabelText('Nome'), 'Maria')
  await user.type(dialog.getByLabelText('E-mail'), 'maria@b.com')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  expect(await dialog.findByText('E-mail já cadastrado')).toBeInTheDocument()
})

test('editar: sem select de empresa, mostra a empresa atual como texto', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('João Silva')

  await user.click(screen.getByRole('button', { name: 'Editar' }))
  const dialog = within(screen.getByRole('dialog'))

  expect(dialog.queryByLabelText('Empresa')).toBeNull()
  expect(dialog.getByText(/Empresa:\s*Fornecedor A/)).toBeInTheDocument()
  expect(dialog.getByText(/fale com o suporte/i)).toBeInTheDocument()
})

test('inativar: pede confirmação e marca como inativo; sem botão de reativar', async () => {
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('João Silva')

  await user.click(screen.getByRole('button', { name: 'Inativar' }))
  const confirm = within(await screen.findByRole('dialog'))
  await user.click(confirm.getByRole('button', { name: 'Inativar' }))

  expect(await screen.findByText('Inativo')).toBeInTheDocument()
  // representante inativo não expõe "Inativar" nem "Ativar"
  expect(screen.queryByRole('button', { name: 'Ativar' })).toBeNull()
  expect(screen.queryByRole('button', { name: 'Inativar' })).toBeNull()
})
