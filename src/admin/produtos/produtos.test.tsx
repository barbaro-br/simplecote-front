import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { ProdutosPage } from './ProdutosPage'

beforeEach(() => {
  server.use(
    http.get('*/api/produtos', () =>
      HttpResponse.json([
        { id: '1', nome: 'Arroz 5kg', codigoBarras: '1234567890123', unidade: 'Fardo', quantidadePorEmbalagem: 30, ativo: true }
      ])
    ),
    http.post('*/api/produtos', async ({ request }) => {
      const data = await request.json() as any
      return HttpResponse.json({
        id: '2',
        nome: data.nome,
        codigoBarras: data.codigoBarras,
        unidade: data.unidade,
        quantidadePorEmbalagem: data.quantidadePorEmbalagem,
        ativo: true
      }, { status: 201 })
    }),
    http.put('*/api/produtos/:id', async ({ request }) => {
      const data = await request.json() as any
      return HttpResponse.json({
        id: '1',
        nome: data.nome,
        codigoBarras: data.codigoBarras,
        unidade: data.unidade,
        quantidadePorEmbalagem: data.quantidadePorEmbalagem,
        ativo: true
      }, { status: 200 })
    }),
    http.get('*/api/produtos/lookup', ({ request }) => {
      const url = new URL(request.url)
      const gtin = url.searchParams.get('gtin')
      if (gtin === '1111111111111') {
        return HttpResponse.json({ gtin, nome: 'Produto GTIN 111' })
      }
      return new HttpResponse(null, { status: 404 })
    }),
    http.post('*/api/produtos/:id/inativar', () => {
      return new HttpResponse(null, { status: 204 })
    })
  )
})

function renderComQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

test('lista os produtos do catálogo', async () => {
  renderComQuery(<ProdutosPage />)
  expect(await screen.findByText(/Carregando catálogo/i)).toBeInTheDocument()
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  expect(screen.getByText('Fardo')).toBeInTheDocument()
})

test('abre o formulário de novo produto, preenche e salva', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()
  
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByPlaceholderText('Nome do produto'), 'Feijão 1kg')

  const quantidadeInput = dialog.getByPlaceholderText('Quantidade por embalagem')
  await user.clear(quantidadeInput)
  await user.type(quantidadeInput, '10')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('edita um produto existente', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()
  
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Editar/i }))

  const dialog = within(screen.getByRole('dialog'))
  const nomeInput = dialog.getByPlaceholderText('Nome do produto')
  await user.clear(nomeInput)
  await user.type(nomeInput, 'Arroz 5kg Editado')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('busca nome do produto pelo código de barras', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()
  
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByPlaceholderText('Código de barras (GTIN)'), '1111111111111')

  await user.click(dialog.getByRole('button', { name: /Buscar Nome/i }))

  await waitFor(() => {
    expect(dialog.getByPlaceholderText('Nome do produto')).toHaveValue('Produto GTIN 111')
  })
})
