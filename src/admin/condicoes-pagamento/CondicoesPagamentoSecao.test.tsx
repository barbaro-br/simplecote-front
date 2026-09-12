import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { CondicoesPagamentoSecao } from './CondicoesPagamentoSecao'

const ID_A = '123e4567-e89b-12d3-a456-426614174000'
const ID_B = '223e4567-e89b-12d3-a456-426614174000'

function renderComQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

beforeEach(() => {
  server.use(
    http.get('*/api/condicoes-pagamento', () =>
      HttpResponse.json([{ id: ID_A, descricao: '14/21/28', ativo: true }]),
    ),
    http.post('*/api/condicoes-pagamento', async ({ request }) => {
      const data = (await request.json()) as { descricao: string }
      return HttpResponse.json({ id: ID_B, ...data, ativo: true }, { status: 201 })
    }),
    http.post('*/api/condicoes-pagamento/:id/inativar', () => new HttpResponse(null, { status: 204 })),
    http.post('*/api/condicoes-pagamento/:id/ativar', () => new HttpResponse(null, { status: 204 })),
  )
})

test('lista as condições de pagamento', async () => {
  renderComQuery(<CondicoesPagamentoSecao />)
  expect(await screen.findByText('14/21/28')).toBeInTheDocument()
})

test('cadastra uma nova condição de pagamento', async () => {
  renderComQuery(<CondicoesPagamentoSecao />)
  const user = userEvent.setup()

  expect(await screen.findByText('14/21/28')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Nova Condição/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Descrição'), '30 dias')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('condição inativa aparece apagada com "Ativar"; clicar reativa', async () => {
  const lista = [
    { id: ID_A, descricao: '14/21/28', ativo: true },
    { id: ID_B, descricao: 'À vista', ativo: false },
  ]
  server.use(
    http.get('*/api/condicoes-pagamento', () => HttpResponse.json(lista)),
    http.post('*/api/condicoes-pagamento/:id/ativar', ({ params }) => {
      const c = lista.find((x) => x.id === params.id)
      if (c) c.ativo = true
      return new HttpResponse(null, { status: 204 })
    }),
  )

  renderComQuery(<CondicoesPagamentoSecao />)
  const user = userEvent.setup()

  expect(await screen.findByText('À vista')).toBeInTheDocument()
  expect(screen.getByText('Inativa')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Ativar' }))

  await waitFor(() => {
    expect(screen.queryByText('Inativa')).not.toBeInTheDocument()
  })
})

test('inativar uma condição ativa chama a API', async () => {
  const lista = [{ id: ID_A, descricao: '14/21/28', ativo: true }]
  server.use(
    http.get('*/api/condicoes-pagamento', () => HttpResponse.json(lista)),
    http.post('*/api/condicoes-pagamento/:id/inativar', ({ params }) => {
      const c = lista.find((x) => x.id === params.id)
      if (c) c.ativo = false
      return new HttpResponse(null, { status: 204 })
    }),
  )

  renderComQuery(<CondicoesPagamentoSecao />)
  const user = userEvent.setup()

  expect(await screen.findByText('14/21/28')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Inativar' }))

  await waitFor(() => {
    expect(screen.getByText('Inativa')).toBeInTheDocument()
  })
})
