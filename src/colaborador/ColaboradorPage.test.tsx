import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { ColaboradorPage } from './ColaboradorPage'

const TOKEN = 'tok-colab'

const produtos = [
  { id: 'p-1', nome: 'Arroz Tipo 1 5kg', codigoBarras: '7891234567890', unidade: 'Fardo', quantidadePorEmbalagem: 1, ativo: true },
  { id: 'p-2', nome: 'Feijão Carioca 1kg', codigoBarras: null, unidade: 'Caixa', quantidadePorEmbalagem: 1, ativo: true },
]

function estado(over: Record<string, unknown> = {}) {
  return { nomeLoja: 'Sara Supermercado', cotacaoId: 'c-1', cotacaoTitulo: 'Compra semanal', ...over }
}

function renderPage() {
  const router = createMemoryRouter([{ path: '/colaborador/:token', element: <ColaboradorPage /> }], {
    initialEntries: [`/colaborador/${TOKEN}`],
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

test('sem cotação em rascunho mostra a mensagem de ausência, sem formulário', async () => {
  server.use(
    http.get(`*/public/colaborador/${TOKEN}`, () =>
      HttpResponse.json(estado({ cotacaoId: null, cotacaoTitulo: null })),
    ),
  )
  renderPage()

  expect(await screen.findByText(/nenhuma cotação em rascunho no momento/i)).toBeInTheDocument()
  expect(screen.getByText('Sara Supermercado')).toBeInTheDocument()
  expect(screen.queryByLabelText('Buscar produto')).not.toBeInTheDocument()
})

test('com cotação em rascunho: busca, seleciona e adiciona um produto com a quantidade correta', async () => {
  const posts: unknown[] = []
  server.use(
    http.get(`*/public/colaborador/${TOKEN}`, () => HttpResponse.json(estado())),
    http.get(`*/public/colaborador/${TOKEN}/produtos`, () => HttpResponse.json(produtos)),
    http.post(`*/public/colaborador/${TOKEN}/itens`, async ({ request }) => {
      posts.push(await request.json())
      return HttpResponse.json({})
    }),
  )
  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByText('Compra semanal')).toBeInTheDocument()

  await user.type(screen.getByLabelText('Buscar produto'), 'arroz')
  expect(screen.getByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.queryByText('Feijão Carioca 1kg')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /arroz tipo 1 5kg/i }))

  const quantidade = screen.getByLabelText('Quantidade')
  await user.clear(quantidade)
  await user.type(quantidade, '3')
  await user.click(screen.getByRole('button', { name: 'Adicionar' }))

  await waitFor(() => expect(posts).toHaveLength(1))
  expect(posts[0]).toEqual({ produtoId: 'p-1', quantidade: 3 })

  // Sucesso reseta a seleção/busca: volta a lista com o campo de busca vazio.
  await waitFor(() => expect(screen.getByLabelText('Buscar produto')).toHaveValue(''))
  expect(screen.getByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
})

test('token inválido mostra o estado de "link inválido"', async () => {
  server.use(
    http.get(`*/public/colaborador/${TOKEN}`, () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Not Found', status: 404, detail: 'Link de colaborador não encontrado.' },
        { status: 404 },
      ),
    ),
  )
  renderPage()

  expect(await screen.findByRole('heading', { name: /link inválido/i })).toBeInTheDocument()
})

test('erro ao adicionar exibe a mensagem sem perder a seleção e a quantidade', async () => {
  server.use(
    http.get(`*/public/colaborador/${TOKEN}`, () => HttpResponse.json(estado())),
    http.get(`*/public/colaborador/${TOKEN}/produtos`, () => HttpResponse.json(produtos)),
    http.post(`*/public/colaborador/${TOKEN}/itens`, () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Erro', status: 409, detail: 'Não há cotação em rascunho no momento.' },
        { status: 409 },
      ),
    ),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByRole('button', { name: /arroz tipo 1 5kg/i }))
  const quantidade = screen.getByLabelText('Quantidade')
  await user.clear(quantidade)
  await user.type(quantidade, '5')
  await user.click(screen.getByRole('button', { name: 'Adicionar' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Não há cotação em rascunho no momento.')
  expect(screen.getByLabelText('Quantidade')).toHaveValue(5)
  expect(screen.getByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
})
