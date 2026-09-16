import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { Toaster } from 'sonner'
import { server } from '@/setupTests'
import { ConfigurarPedidoModal } from './ConfigurarPedidoModal'

function renderModal(open = true) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const onClose = vi.fn()
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <ConfigurarPedidoModal open={open} onClose={onClose} />
          </QueryClientProvider>
        ),
      },
      { path: '/admin/pedidos-avulsos/:id', element: <div data-testid="tela-montagem">Tela de montagem</div> },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
  return { router, onClose }
}

beforeEach(() => {
  server.use(
    http.get('*/api/empresas', () =>
      HttpResponse.json([
        { id: 'emp-1', nome: 'Empresa A', ativo: true, podeExcluir: true },
        { id: 'emp-2', nome: 'Empresa B', ativo: true, podeExcluir: true },
      ]),
    ),
    http.get('*/api/representantes', () =>
      HttpResponse.json([
        { id: 'rep-1', empresaId: 'emp-1', nome: 'João Rep', email: 'joao@rep.com', ativo: true, whatsapp: null },
      ]),
    ),
    http.get('*/api/condicoes-pagamento', () =>
      HttpResponse.json([{ id: 'cp-1', descricao: '14/21/28', ativo: true }]),
    ),
  )
})

test('modal renderiza com campos empresa e condição de pagamento', async () => {
  renderModal()

  expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/condição de pagamento/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /abrir pedido/i })).toBeInTheDocument()
})

test('submit sem empresa exibe erro de validação e não chama API', async () => {
  const user = userEvent.setup()
  renderModal()

  await user.click(screen.getByRole('button', { name: /abrir pedido/i }))

  expect(await screen.findByText('Selecione a empresa')).toBeInTheDocument()
})

test('submit com empresa válida chama POST /api/pedidos/avulsos e navega para /:id', async () => {
  let corpoRecebido: unknown
  server.use(
    http.post('*/api/pedidos/avulsos', async ({ request }) => {
      corpoRecebido = await request.json()
      return HttpResponse.json(
        {
          id: 'ped-novo',
          status: 'ABERTO',
          itens: [],
          quantidadeItens: 0,
          total: 0,
          geradoEm: '2026-09-15T12:00:00Z',
          condicaoPagamento: '14/21/28',
          prazoEntregaEstimado: null,
          empresaNome: 'Empresa A',
          representanteNome: 'João Rep',
        },
        { status: 201 },
      )
    }),
  )

  const user = userEvent.setup()
  const { router } = renderModal()

  // Seleciona empresa
  await user.click(screen.getByLabelText(/empresa/i))
  await user.click(await screen.findByRole('option', { name: 'Empresa A' }))

  // Seleciona condição
  await user.click(screen.getByLabelText(/condição de pagamento/i))
  await user.click(await screen.findByRole('option', { name: '14/21/28' }))

  await user.click(screen.getByRole('button', { name: /abrir pedido/i }))

  // Navegou para a tela de montagem
  await screen.findByTestId('tela-montagem')
  expect(router.state.location.pathname).toBe('/admin/pedidos-avulsos/ped-novo')
  expect(corpoRecebido).toMatchObject({ empresaId: 'emp-1', condicaoPagamentoId: 'cp-1' })
})

test('ao selecionar empresa sem representante, não exibe painel de representante', async () => {
  // Simula que Empresa B não tem representante cadastrado
  const user = userEvent.setup()
  renderModal()

  await user.click(await screen.findByLabelText(/empresa/i))
  await user.click(await screen.findByRole('option', { name: 'Empresa B' }))

  // Empresa B sem representante: painel de representante NÃO deve aparecer
  await screen.findByText('Empresa B', { selector: 'span' })
  expect(screen.queryByText(/Representante:/)).not.toBeInTheDocument()
})
