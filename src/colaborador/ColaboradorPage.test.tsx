import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect, test } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { ColaboradorPage } from './ColaboradorPage'

vi.mock('./LeitorCodigoBarras', () => ({
  LeitorCodigoBarras: ({ onRead, onClose }: any) => (
    <div>
      <button onClick={() => onRead('1234567890123')}>Simular Leitura 1234567890123</button>
      <button onClick={onClose}>Fechar câmera</button>
    </div>
  )
}))

const TOKEN = 'tok-colab'

const produtos = [
  { id: 'p-1', nome: 'Arroz Tipo 1 5kg', codigoBarras: '7891234567890', unidade: 'Fardo', quantidadePorEmbalagem: 1, ativo: true },
  { id: 'p-2', nome: 'Feijão Carioca 1kg', codigoBarras: null, unidade: 'Caixa', quantidadePorEmbalagem: 1, ativo: true },
]

function estado(over: Record<string, unknown> = {}) {
  return { 
    nomeLoja: 'Sara Supermercado', 
    cotacoesAbertas: [{ id: 'c-1', titulo: 'Compra semanal' }], 
    ...over 
  }
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

test('sem cotação aberta mostra a mensagem de ausência, sem formulário', async () => {
  server.use(
    http.get(`*/public/colaborador/${TOKEN}`, () =>
      HttpResponse.json(estado({ cotacoesAbertas: [] })),
    ),
    http.get(`*/public/colaborador/${TOKEN}/produtos`, () => HttpResponse.json(produtos)),
  )
  renderPage()

  expect(await screen.findByText(/nenhuma cotação aberta no momento/i)).toBeInTheDocument()
  expect(screen.getByText('Sara Supermercado')).toBeInTheDocument()
  expect(screen.queryByLabelText('Buscar produto')).not.toBeInTheDocument()
})

test('com 1 cotação aberta: título simples, busca, seleciona e adiciona o produto', async () => {
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
  expect(posts[0]).toEqual({ cotacaoId: 'c-1', produtoId: 'p-1', quantidade: 3 })

  // Sucesso reseta a seleção/busca: volta a lista com o campo de busca vazio.
  await waitFor(() => expect(screen.getByLabelText('Buscar produto')).toHaveValue(''))
  expect(screen.getByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
})

test('com N cotações abertas: abas horizontais roláveis, trocar de aba muda a cotação-alvo', async () => {
  const posts: unknown[] = []
  server.use(
    http.get(`*/public/colaborador/${TOKEN}`, () => HttpResponse.json(estado({
      cotacoesAbertas: [
        { id: 'c-1', titulo: 'Hortifruti' },
        { id: 'c-2', titulo: 'Bebidas' }
      ]
    }))),
    http.get(`*/public/colaborador/${TOKEN}/produtos`, () => HttpResponse.json(produtos)),
    http.post(`*/public/colaborador/${TOKEN}/itens`, async ({ request }) => {
      posts.push(await request.json())
      return HttpResponse.json({})
    }),
  )
  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByRole('button', { name: 'Hortifruti' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Bebidas' })).toBeInTheDocument()

  // Change tab
  await user.click(screen.getByRole('button', { name: 'Bebidas' }))

  await user.click(screen.getByRole('button', { name: /feijão/i }))
  await user.click(screen.getByRole('button', { name: 'Adicionar' }))

  await waitFor(() => expect(posts).toHaveLength(1))
  expect(posts[0]).toEqual({ cotacaoId: 'c-2', produtoId: 'p-2', quantidade: 1 })
})

test('bipar código encontrado no lookup', async () => {
  const posts: unknown[] = []
  server.use(
    http.get(`*/public/colaborador/${TOKEN}`, () => HttpResponse.json(estado())),
    http.get(`*/public/colaborador/${TOKEN}/produtos`, () => HttpResponse.json(produtos)),
    http.get(`*/public/colaborador/${TOKEN}/produtos/lookup`, () => HttpResponse.json({ gtin: '1234567890123', nome: 'Produto Encontrado', marca: 'Marca X' })),
    http.post(`*/public/colaborador/${TOKEN}/produtos/bipado`, async ({ request }) => {
      posts.push(await request.json())
      return HttpResponse.json({})
    }),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByRole('button', { name: /bipar código de barras/i }))
  await user.click(await screen.findByRole('button', { name: 'Simular Leitura 1234567890123' }))

  expect(await screen.findByText('Produto Encontrado')).toBeInTheDocument()
  expect(screen.getByText('Marca X')).toBeInTheDocument()

  const quantidade = screen.getByLabelText('Quantidade')
  await user.clear(quantidade)
  await user.type(quantidade, '2')
  
  await user.click(screen.getByRole('button', { name: 'Adicionar' }))
  
  await waitFor(() => expect(posts).toHaveLength(1))
  expect(posts[0]).toEqual({ 
    cotacaoId: 'c-1', 
    gtin: '1234567890123', 
    nome: 'Produto Encontrado',
    unidade: 'Unidade',
    quantidadePorEmbalagem: 1,
    quantidade: 2 
  })
})

test('bipar código não encontrado no lookup (404) exibe formulário', async () => {
  const posts: unknown[] = []
  server.use(
    http.get(`*/public/colaborador/${TOKEN}`, () => HttpResponse.json(estado())),
    http.get(`*/public/colaborador/${TOKEN}/produtos`, () => HttpResponse.json(produtos)),
    http.get(`*/public/colaborador/${TOKEN}/produtos/lookup`, () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })),
    http.post(`*/public/colaborador/${TOKEN}/produtos/bipado`, async ({ request }) => {
      posts.push(await request.json())
      return HttpResponse.json({})
    }),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByRole('button', { name: /bipar código de barras/i }))
  await user.click(await screen.findByRole('button', { name: 'Simular Leitura 1234567890123' }))

  expect(await screen.findByText(/Produto não encontrado/i)).toBeInTheDocument()

  await user.type(screen.getByLabelText('Nome'), 'Novo Produto')
  const unidade = screen.getByLabelText('Unidade')
  await user.clear(unidade)
  await user.type(unidade, 'Caixa')
  
  const qtdEmb = screen.getByLabelText('Qtd/Emb')
  await user.clear(qtdEmb)
  await user.type(qtdEmb, '12')

  const quantidade = screen.getByLabelText('Quantidade')
  await user.clear(quantidade)
  await user.type(quantidade, '5')

  await user.click(screen.getByRole('button', { name: 'Adicionar' }))

  await waitFor(() => expect(posts).toHaveLength(1))
  expect(posts[0]).toEqual({ 
    cotacaoId: 'c-1', 
    gtin: '1234567890123', 
    nome: 'Novo Produto',
    unidade: 'Caixa',
    quantidadePorEmbalagem: 12,
    quantidade: 5 
  })
})

test('token inválido mostra o estado de "link inválido"', async () => {
  server.use(
    http.get(`*/public/colaborador/${TOKEN}`, () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Not Found', status: 404, detail: 'Link de colaborador não encontrado.' },
        { status: 404 },
      ),
    ),
    http.get(`*/public/colaborador/${TOKEN}/produtos`, () => HttpResponse.json([])),
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
        { type: 'about:blank', title: 'Erro', status: 409, detail: 'Cotação já foi fechada.' },
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

  expect(await screen.findByRole('alert')).toHaveTextContent('Cotação já foi fechada.')
  expect(screen.getByLabelText('Quantidade')).toHaveValue(5)
  expect(screen.getByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
})


