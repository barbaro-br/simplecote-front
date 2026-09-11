import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'
import { server } from '@/setupTests'
import { ProdutosPage } from './ProdutosPage'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

vi.mock('@/shared/components/LeitorCodigoBarras', () => ({
  LeitorCodigoBarras: ({ onRead, onClose }: any) => (
    <div>
      <button onClick={() => onRead('1111111111111')}>Simular leitura</button>
      <button onClick={onClose}>Fechar câmera</button>
    </div>
  ),
}))

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
    }),
    http.get('*/api/produtos/sugestoes', () =>
      HttpResponse.json({ doProprioCatalogo: [], doCatalogoGlobal: [] }),
    ),
  )
})

const APOS_DEBOUNCE_SUGESTAO = 400

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

test('busca filtra por nome parcial, sem diferenciar caixa ou acento', async () => {
  const lista = [
    { id: '1', nome: 'Açúcar refinado 1kg', codigoBarras: '111', unidade: 'Unidade', quantidadePorEmbalagem: 1, ativo: true },
    { id: '2', nome: 'Arroz 5kg', codigoBarras: '222', unidade: 'Fardo', quantidadePorEmbalagem: 30, ativo: true },
  ]
  server.use(http.get('*/api/produtos', () => HttpResponse.json(lista)))

  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()
  expect(await screen.findByText('Açúcar refinado 1kg')).toBeInTheDocument()

  await user.type(screen.getByRole('searchbox', { name: 'Buscar produto' }), 'acucar')

  expect(screen.getByText('Açúcar refinado 1kg')).toBeInTheDocument()
  expect(screen.queryByText('Arroz 5kg')).not.toBeInTheDocument()
})

test('busca filtra por código de barras parcial', async () => {
  const lista = [
    { id: '1', nome: 'Arroz 5kg', codigoBarras: '1234567890123', unidade: 'Fardo', quantidadePorEmbalagem: 30, ativo: true },
    { id: '2', nome: 'Feijão 1kg', codigoBarras: '9999999999999', unidade: 'Caixa', quantidadePorEmbalagem: 1, ativo: true },
  ]
  server.use(http.get('*/api/produtos', () => HttpResponse.json(lista)))

  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()

  await user.type(screen.getByRole('searchbox', { name: 'Buscar produto' }), '456789')

  expect(screen.getByText('Arroz 5kg')).toBeInTheDocument()
  expect(screen.queryByText('Feijão 1kg')).not.toBeInTheDocument()
})

test('limpar a busca restaura a lista completa', async () => {
  const lista = [
    { id: '1', nome: 'Arroz 5kg', codigoBarras: '123', unidade: 'Fardo', quantidadePorEmbalagem: 30, ativo: true },
    { id: '2', nome: 'Feijão 1kg', codigoBarras: '456', unidade: 'Caixa', quantidadePorEmbalagem: 1, ativo: true },
  ]
  server.use(http.get('*/api/produtos', () => HttpResponse.json(lista)))

  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()

  const busca = screen.getByRole('searchbox', { name: 'Buscar produto' })
  await user.type(busca, 'feijao')
  expect(screen.queryByText('Arroz 5kg')).not.toBeInTheDocument()

  await user.clear(busca)

  expect(screen.getByText('Arroz 5kg')).toBeInTheDocument()
  expect(screen.getByText('Feijão 1kg')).toBeInTheDocument()
})

test('termo sem correspondência mostra estado vazio de busca', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()

  await user.type(screen.getByRole('searchbox', { name: 'Buscar produto' }), 'naoexiste')

  expect(screen.getByText('Nenhum produto encontrado para a busca.')).toBeInTheDocument()
  expect(screen.queryByText('Arroz 5kg')).not.toBeInTheDocument()
  expect(screen.queryByText('Nenhum produto cadastrado.')).not.toBeInTheDocument()
})

test('abre o formulário de novo produto, preenche e salva', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()
  
  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText(/Código de barras/i), '7891234567890')
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

test('sugestão ao digitar o nome: escolher sugestão do catálogo global preenche nome e código', async () => {
  server.use(
    http.get('*/api/produtos/sugestoes', ({ request }) => {
      const q = new URL(request.url).searchParams.get('q')
      if (q === 'Feij') {
        return HttpResponse.json({
          doProprioCatalogo: [],
          doCatalogoGlobal: [{ codigoBarras: '7899999999999', nome: 'Feijão Preto 1kg', marca: 'Marca Z' }],
        })
      }
      return HttpResponse.json({ doProprioCatalogo: [], doCatalogoGlobal: [] })
    }),
  )
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome do produto'), 'Feij')
  await sleep(APOS_DEBOUNCE_SUGESTAO)

  const sugestao = await dialog.findByText('Feijão Preto 1kg')
  await user.click(sugestao)

  expect(dialog.getByLabelText('Nome do produto')).toHaveValue('Feijão Preto 1kg')
  expect(dialog.getByLabelText(/Código de barras/i)).toHaveValue('7899999999999')
  expect(dialog.getByText(/preenchidos da base compartilhada/i)).toBeInTheDocument()
})

test('sugestão ao digitar o nome: "já no seu catálogo" é só aviso, não preenche nada ao aparecer', async () => {
  server.use(
    http.get('*/api/produtos/sugestoes', ({ request }) => {
      const q = new URL(request.url).searchParams.get('q')
      if (q === 'Arroz Novo') {
        return HttpResponse.json({
          doProprioCatalogo: [{ id: '1', nome: 'Arroz 5kg', codigoBarras: '1234567890123', unidade: 'Fardo', quantidadePorEmbalagem: 30, ativo: true }],
          doCatalogoGlobal: [],
        })
      }
      return HttpResponse.json({ doProprioCatalogo: [], doCatalogoGlobal: [] })
    }),
  )
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome do produto'), 'Arroz Novo')
  await sleep(APOS_DEBOUNCE_SUGESTAO)

  await dialog.findByText('Já no seu catálogo')
  expect(dialog.getByLabelText(/Código de barras/i)).toHaveValue('')
  expect(dialog.getByLabelText('Nome do produto')).toHaveValue('Arroz Novo')
})

test('Enter no campo de código de barras aciona a busca, sem submeter o formulário', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  const codigoInput = dialog.getByLabelText(/Código de barras/i)
  await user.type(codigoInput, '1111111111111{Enter}')

  await waitFor(() => {
    expect(dialog.getByLabelText('Nome do produto')).toHaveValue('Arroz Tio João 5kg')
  })
  expect(dialog.getByText(/sugerido pelo código de barras/i)).toBeInTheDocument()
  expect(dialog.queryByText(/Informe o nome do produto/i)).not.toBeInTheDocument()
})

test('Enter em outro campo (nome) continua submetendo o formulário', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText(/Código de barras/i), '7891234567890')
  await user.type(dialog.getByLabelText('Nome do produto'), 'Arroz Parboilizado{Enter}')

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
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

test('sem código de barras: "Buscar" fica desabilitado e salvar pede confirmação', async () => {
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

  // Confirmação "Salvar sem código de barras?" aparece antes do POST.
  expect(await screen.findByText('Salvar sem código de barras?')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Salvar sem código' }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('mensagens de erro localizadas para quantidadePorEmbalagem (vazio ou fracionado)', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  
  // Limpa o campo pra simular vazio (type_error / required_error)
  const quantidadeInput = dialog.getByLabelText('Qtd. por embalagem')
  await user.clear(quantidadeInput)
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))
  expect(await dialog.findByText('Informe a quantidade por embalagem')).toBeInTheDocument()
  
  // Digita um número fracionado (int_error)
  await user.type(quantidadeInput, '1.5')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))
  expect(await dialog.findByText('A quantidade deve ser um número inteiro')).toBeInTheDocument()
})

test('Bipar monta o leitor; a leitura preenche o código de barras e dispara o lookup', async () => {
  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.click(dialog.getByRole('button', { name: 'Bipar' }))

  // Leitor mockado montado; simula uma leitura.
  await user.click(await screen.findByRole('button', { name: 'Simular leitura' }))

  await waitFor(() => {
    expect(dialog.getByLabelText(/Código de barras/i)).toHaveValue('1111111111111')
  })
  await waitFor(() => {
    expect(dialog.getByLabelText('Nome do produto')).toHaveValue('Arroz Tio João 5kg')
  })
})

test('cancelar a confirmação não chama POST e mantém o formulário aberto', async () => {
  let posts = 0
  server.use(
    http.post('*/api/produtos', async ({ request }) => {
      posts++
      const data = (await request.json()) as any
      return HttpResponse.json(
        { id: '2', nome: data.nome, codigoBarras: data.codigoBarras, unidade: data.unidade, quantidadePorEmbalagem: data.quantidadePorEmbalagem, ativo: true },
        { status: 201 },
      )
    }),
  )

  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome do produto'), 'Sem Código')
  const quantidade = dialog.getByLabelText('Qtd. por embalagem')
  await user.clear(quantidade)
  await user.type(quantidade, '5')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  expect(await screen.findByText('Salvar sem código de barras?')).toBeInTheDocument()

  const confirmacao = within(
    screen.getByRole('heading', { name: 'Salvar sem código de barras?' }).closest('[role="dialog"]') as HTMLElement,
  )
  await user.click(confirmacao.getByRole('button', { name: 'Cancelar' }))

  await waitFor(() => {
    expect(screen.queryByText('Salvar sem código de barras?')).not.toBeInTheDocument()
  })
  expect(screen.getByLabelText('Nome do produto')).toHaveValue('Sem Código')
  expect(posts).toBe(0)
})

test('Salvar sem código na confirmação chama POST e fecha o formulário', async () => {
  let posts = 0
  server.use(
    http.post('*/api/produtos', async ({ request }) => {
      posts++
      const data = (await request.json()) as any
      return HttpResponse.json(
        { id: '2', nome: data.nome, codigoBarras: data.codigoBarras, unidade: data.unidade, quantidadePorEmbalagem: data.quantidadePorEmbalagem, ativo: true },
        { status: 201 },
      )
    }),
  )

  renderComQuery(<ProdutosPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Arroz 5kg')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Novo produto/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome do produto'), 'Sem Código')
  const quantidade = dialog.getByLabelText('Qtd. por embalagem')
  await user.clear(quantidade)
  await user.type(quantidade, '5')
  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  expect(await screen.findByText('Salvar sem código de barras?')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Salvar sem código' }))

  await waitFor(() => expect(posts).toBe(1))
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('abre o histórico de compras de um produto pelo botão da linha', async () => {
  server.use(
    http.get('*/api/analises/produtos/insight', () => HttpResponse.json({})),
  )
  const user = userEvent.setup()
  renderComQuery(<ProdutosPage />)
  await screen.findByText('Arroz 5kg')

  await user.click(screen.getByRole('button', { name: 'Arroz 5kg' }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent('Histórico — Arroz 5kg')
  expect(
    await within(dialog).findByText(/ainda não foi comprado em nenhuma cotação/i),
  ).toBeInTheDocument()
})
