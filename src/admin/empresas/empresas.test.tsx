import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { EmpresasPage } from './EmpresasPage'

const EMPRESA_ID = '123e4567-e89b-12d3-a456-426614174000'
const REP_ID = '223e4567-e89b-12d3-a456-426614174000'

beforeEach(() => {
  server.use(
    http.get('*/api/empresas', () =>
      HttpResponse.json([{ id: EMPRESA_ID, nome: 'Fornecedor A LTDA', ativo: true }])
    ),
    http.get('*/api/representantes', () =>
      HttpResponse.json([
        { id: REP_ID, empresaId: EMPRESA_ID, nome: 'João', email: 'joao@x.com', whatsapp: null, ativo: true },
      ])
    ),
    http.post('*/api/empresas', async ({ request }) => {
      const data = (await request.json()) as { nome: string }
      return HttpResponse.json({ id: EMPRESA_ID, ...data, ativo: true }, { status: 201 })
    }),
    http.post('*/api/representantes', async ({ request }) => {
      const data = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ id: REP_ID, ...data }, { status: 201 })
    }),
    http.put('*/api/empresas/:id', async ({ request }) => {
      const data = (await request.json()) as { nome: string }
      return HttpResponse.json({ id: EMPRESA_ID, ...data, ativo: true }, { status: 200 })
    }),
    http.put('*/api/representantes/:id', async ({ request }) => {
      const data = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ id: REP_ID, empresaId: EMPRESA_ID, ...data, ativo: true }, { status: 200 })
    }),
    http.post('*/api/empresas/:id/inativar', () => new HttpResponse(null, { status: 204 })),
  )
})

function renderComQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

test('lista as empresas com o representante', async () => {
  renderComQuery(<EmpresasPage />)
  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  expect(await screen.findByText('João')).toBeInTheDocument()
})

test('abre formulário, preenche empresa e representante, e salva', async () => {
  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Nova Empresa/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome da empresa'), 'Novo Fornecedor')
  await user.type(dialog.getByLabelText('Nome do representante'), 'Maria')
  await user.type(dialog.getByLabelText('E-mail'), 'maria@email.com')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('empresa inativa aparece apagada com "Ativar"; clicar reativa e a linha acende', async () => {
  const lista = [
    { id: '1', nome: 'Fornecedor A LTDA', ativo: true },
    { id: '2', nome: 'Fornecedor Velho', ativo: false },
  ]
  server.use(
    http.get('*/api/empresas', () => HttpResponse.json(lista)),
    http.post('*/api/empresas/:id/ativar', ({ params }) => {
      const e = lista.find((x) => x.id === params.id)
      if (e) e.ativo = true
      return new HttpResponse(null, { status: 204 })
    }),
  )

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText(/Fornecedor Velho/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Ativar' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Ativar' }))

  await waitFor(() => {
    expect(screen.queryByRole('button', { name: 'Ativar' })).not.toBeInTheDocument()
  })
  expect(screen.getAllByRole('button', { name: 'Inativar' })).toHaveLength(2)
})

test('edita o nome e o representante de uma empresa existente', async () => {
  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  expect(await screen.findByText('João')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Editar/i }))

  const dialog = within(screen.getByRole('dialog'))

  // Representante já vem preenchido
  expect(dialog.getByLabelText('Nome do representante')).toHaveValue('João')

  const nomeInput = dialog.getByLabelText('Nome da empresa')
  await user.clear(nomeInput)
  await user.type(nomeInput, 'Fornecedor A Editado')

  const emailInput = dialog.getByLabelText('E-mail')
  await user.clear(emailInput)
  await user.type(emailInput, 'joao.novo@x.com')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('editar empresa sem representante cria o representante ao salvar', async () => {
  server.use(http.get('*/api/representantes', () => HttpResponse.json([])))

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Editar/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome do representante'), 'Carlos')
  await user.type(dialog.getByLabelText('E-mail'), 'carlos@x.com')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
