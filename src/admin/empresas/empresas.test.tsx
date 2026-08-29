import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { EmpresasPage } from './EmpresasPage'

beforeEach(() => {
  server.use(
    http.get('*/api/empresas', () =>
      HttpResponse.json([
        {
          id: '1',
          nome: 'Fornecedor A LTDA',
          ativo: true
        }
      ])
    ),
    http.post('*/api/empresas', async ({ request }) => {
      const data = await request.json() as any
      return HttpResponse.json({
        id: '2',
        ...data,
        ativo: true
      }, { status: 201 })
    }),
    http.post('*/api/representantes', async ({ request }) => {
      const data = await request.json() as any
      return HttpResponse.json({
        id: 'r1',
        ...data
      }, { status: 201 })
    }),
    http.put('*/api/empresas/:id', async ({ request }) => {
      const data = await request.json() as any
      return HttpResponse.json({
        id: '1',
        ...data,
        ativo: true
      }, { status: 200 })
    }),
    http.post('*/api/empresas/:id/inativar', () => {
      return new HttpResponse(null, { status: 204 })
    })
  )
})

function renderComQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

test('lista as empresas cadastradas', async () => {
  renderComQuery(<EmpresasPage />)
  expect(await screen.findByText(/Carregando fornecedores/i)).toBeInTheDocument()
  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
})

test('abre formulário, preenche empresa e representante, e salva', async () => {
  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()
  
  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Nova Empresa/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByPlaceholderText('Nome da empresa (ex: Atacadão)'), 'Novo Fornecedor')
  await user.type(dialog.getByPlaceholderText('Nome do representante'), 'João Silva')
  await user.type(dialog.getByPlaceholderText('E-mail'), 'joao@email.com')
  await user.type(dialog.getByPlaceholderText('WhatsApp (opcional)'), '11999999999')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('edita o nome de uma empresa existente', async () => {
  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()
  
  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Editar/i }))

  const dialog = within(screen.getByRole('dialog'))
  const nomeInput = dialog.getByPlaceholderText('Nome da empresa (ex: Atacadão)')
  await user.clear(nomeInput)
  await user.type(nomeInput, 'Fornecedor A Editado')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
