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
      const gtin = new URL(request.url).searchParams.get('gtin')
      if (gtin === '1111111111111') {
        return HttpResponse.json({ gtin, nome: 'Arroz Tio João 5kg' })
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
  await user.type(dialog.getByLabelText('Nome do produto'), 'Feijão 1kg')

  const quantidadeInput = dialog.getByLabelText('Qtd. por embalagem')
  await user.clear(quantidadeInput)
  await user.type(quantidadeInput, '10')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('produto inativo aparece apagado com "Ativar"; clicar reativa', async () => {
  const lista = [
    { id: '1', nome: 'Arroz 5kg', codigoBarras: '1234567890123', unidade: 'Fardo', quantidadePorEmbalagem: 30, ativo: true },
    { id: '9', nome: 'Produto Descontinuado', codigoBarras: null, unidade: 'Caixa', quantidadePorEmbalagem: 1, ativo: false },
  ]
  server.use(
    http.get('*/api/produtos', () => HttpResponse.json(lista)),
    http.post('*/api/produtos/:id/ativar', ({ params }) => {
      const p = lista.find((x) => x.id === params.id)
      if (p) p.ativo = true
      return new HttpResponse(null, { status: 204 })
    }),
  )

  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText(/Produto Descontinuado/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Ativar' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Ativar' }))

  await waitFor(() => {
    expect(screen.queryByRole('button', { name: 'Ativar' })).not.toBeInTheDocument()
  })
  expect(screen.getAllByRole('button', { name: 'Inativar' })).toHaveLength(2)
})

test('edita um produto existente', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()
  
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Editar/i }))

  const dialog = within(screen.getByRole('dialog'))
  const nomeInput = dialog.getByLabelText('Nome do produto')
  await user.clear(nomeInput)
  await user.type(nomeInput, 'Arroz 5kg Editado')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('lookup por código de barras: acha → preenche o nome e avisa que foi sugerido', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText(/Código de barras/i), '1111111111111')
  await user.click(dialog.getByRole('button', { name: 'Buscar' }))

  await waitFor(() => {
    expect(dialog.getByLabelText('Nome do produto')).toHaveValue('Arroz Tio João 5kg')
  })
  expect(dialog.getByText(/sugerido pelo código de barras/i)).toBeInTheDocument()
})

test('lookup sem resultado (404): degrada para preenchimento manual e ainda salva', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText(/Código de barras/i), '9999999999999')
  await user.click(dialog.getByRole('button', { name: 'Buscar' }))

  expect(await dialog.findByText(/não encontrado/i)).toBeInTheDocument()

  await user.type(dialog.getByLabelText('Nome do produto'), 'Produto Manual')
  const quantidade = dialog.getByLabelText('Qtd. por embalagem')
  await user.clear(quantidade)
  await user.type(quantidade, '5')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('sem código de barras: "Buscar" fica desabilitado e o produto salva normalmente', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  expect(dialog.getByRole('button', { name: 'Buscar' })).toBeDisabled()

  await user.type(dialog.getByLabelText('Nome do produto'), 'Sem Código')
  const quantidade = dialog.getByLabelText('Qtd. por embalagem')
  await user.clear(quantidade)
  await user.type(quantidade, '5')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
