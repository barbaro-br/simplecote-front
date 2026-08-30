import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { PedidoPorTokenPage } from './PedidoPorTokenPage'

const TOKEN = 'tok-pedido'

function pedido(over: Record<string, unknown> = {}) {
  return {
    id: 'p-1',
    cotacaoId: 'c-1',
    participanteId: 'part-1',
    empresaNome: 'Atacadão Central',
    status: 'ENVIADO',
    observacao: null,
    geradoEm: '2026-08-28T12:00:00Z',
    enviadoEm: '2026-08-28T13:00:00Z',
    confirmadoEm: null,
    total: 300,
    itens: [
      {
        id: 'ip-1',
        itemCotacaoId: 'ic-1',
        lanceId: 'l-1',
        nomeSnapshot: 'Arroz Tipo 1 5kg',
        unidadeSnapshot: 'Fardo',
        quantidadePorEmbalagemSnapshot: 1,
        quantidade: 10,
        precoEmbalagem: 30,
        precoUnitario: 30,
        subtotal: 300,
      },
    ],
    ...over,
  }
}

function renderPage() {
  const router = createMemoryRouter([{ path: '/pedido/:token', element: <PedidoPorTokenPage /> }], {
    initialEntries: [`/pedido/${TOKEN}`],
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

test('mostra os dados do pedido', async () => {
  server.use(http.get(`*/public/pedidos/${TOKEN}`, () => HttpResponse.json(pedido())))
  renderPage()

  expect(await screen.findByRole('heading', { name: /pedido/i })).toBeInTheDocument()
  expect(screen.getByText('Atacadão Central')).toBeInTheDocument()
  expect(screen.getByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
})

test('confirmar chama a API e a tela reflete o pedido confirmado', async () => {
  server.use(
    http.get(`*/public/pedidos/${TOKEN}`, () => HttpResponse.json(pedido())),
    http.post(`*/public/pedidos/${TOKEN}/confirmar`, () =>
      HttpResponse.json(pedido({ status: 'CONFIRMADO', confirmadoEm: '2026-08-28T14:00:00Z' })),
    ),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByRole('button', { name: /confirmar/i }))

  expect(await screen.findByText(/pedido confirmado/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /confirmar/i })).not.toBeInTheDocument()
})

test('erro ProblemDetail na confirmação é exibido', async () => {
  server.use(
    http.get(`*/public/pedidos/${TOKEN}`, () => HttpResponse.json(pedido())),
    http.post(`*/public/pedidos/${TOKEN}/confirmar`, () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Conflito', status: 409, detail: 'Este pedido já foi confirmado.' },
        { status: 409 },
      ),
    ),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByRole('button', { name: /confirmar/i }))

  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('Este pedido já foi confirmado.'),
  )
})

test('token inválido: estado de link inválido', async () => {
  server.use(
    http.get(`*/public/pedidos/${TOKEN}`, () =>
      HttpResponse.json({ type: 'about:blank', title: 'x', status: 404, detail: 'não encontrado' }, { status: 404 }),
    ),
  )
  renderPage()
  expect(await screen.findByRole('heading', { name: /link inválido/i })).toBeInTheDocument()
})
