import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import type { StatusCotacao } from '@/shared/domain/tipos-base'
import { CotacaoDetalhePage } from './CotacaoDetalhePage'

afterEach(() => vi.useRealTimers())

type Item = {
  id: string
  produtoId: string
  nomeSnapshot: string
  codigoBarrasSnapshot: string | null
  unidadeSnapshot: string
  quantidadeSolicitada: number
  quantidadePorEmbalagemSnapshot: number
}

function novoItem(produtoId: string, quantidade: number, nomeSnapshot = 'Arroz Tipo 1 5kg'): Item {
  return {
    id: `item-${Math.random().toString(36).slice(2, 8)}`,
    produtoId,
    nomeSnapshot,
    codigoBarrasSnapshot: null,
    unidadeSnapshot: 'Fardo',
    quantidadeSolicitada: quantidade,
    quantidadePorEmbalagemSnapshot: 1,
  }
}

function participante(
  participanteId: string,
  empresaNome: string,
  participanteStatus: 'CONVIDADO' | 'VISUALIZOU' | 'RESPONDIDO',
) {
  return {
    participanteId,
    empresaId: `emp-${participanteId}`,
    empresaNome,
    representanteNome: `Rep de ${empresaNome}`,
    whatsappRepresentante: null,
    emailRepresentante: null,
    conviteStatus: 'ENVIADO',
    participanteStatus,
    linkMagico: 'https://exemplo.com/token',
  }
}

function setup(status: StatusCotacao, itensIniciais: Item[] = [], prazoVencido = false) {
  const state = {
    id: 'c-1',
    titulo: 'Compra semanal',
    status,
    prazo: status === 'ABERTA' ? '2026-08-30T12:00:00Z' : null,
    criadaEm: '2026-08-01T12:00:00Z',
    encerradaEm: null as string | null,
    itens: [...itensIniciais],
    prazoVencido,
  }
  const chamadas: Record<string, number> = {}
  let prazoRecebido: string | null = null
  const produtos: Array<Record<string, unknown>> = [
    { id: 'p-1', nome: 'Arroz Tipo 1 5kg', codigoBarras: null, unidade: 'Fardo', quantidadePorEmbalagem: 1, ativo: true },
  ]

  server.use(
    http.get('*/api/analises/produtos/insight', () => HttpResponse.json({})),
    http.get('*/api/cotacoes/c-1', () => HttpResponse.json(state)),
    http.get('*/api/cotacoes/c-1/apuracao/previa', () => {
      chamadas.previa = (chamadas.previa ?? 0) + 1
      return HttpResponse.json({ pedidos: [], itensSemVencedor: [] })
    }),
    http.get('*/api/produtos', () => HttpResponse.json(produtos)),
    http.get('*/api/representantes', () => HttpResponse.json([])),
    http.post('*/api/produtos', async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      const novo = { id: 'novo-1', ...body, ativo: true }
      produtos.push(novo)
      chamadas.criarProduto = (chamadas.criarProduto ?? 0) + 1
      return HttpResponse.json(novo, { status: 201 })
    }),
    http.post('*/api/cotacoes/c-1/itens', async ({ request }) => {
      const body = (await request.json()) as { produtoId: string; quantidade: number }
      const nome = (produtos.find((p) => p.id === body.produtoId)?.nome as string) ?? 'Arroz Tipo 1 5kg'
      state.itens.push(novoItem(body.produtoId, body.quantidade, nome))
      return HttpResponse.json(state, { status: 201 })
    }),
    http.delete('*/api/cotacoes/c-1/itens/:itemId', ({ params }) => {
      state.itens = state.itens.filter((i) => i.id !== params.itemId)
      return new HttpResponse(null, { status: 204 })
    }),
    http.post('*/api/cotacoes/c-1/abrir', async ({ request }) => {
      const body = (await request.json()) as { prazo: string }
      prazoRecebido = body.prazo
      chamadas.abrir = (chamadas.abrir ?? 0) + 1
      state.status = 'ABERTA'
      state.prazo = body.prazo
      return HttpResponse.json(state)
    }),
    http.post('*/api/cotacoes/c-1/apurar', () => {
      chamadas.apurar = (chamadas.apurar ?? 0) + 1
      state.status = 'PEDIDOS_GERADOS'
      return HttpResponse.json(state)
    }),
    // Seções ParticipantesSection / RespostasSection (montadas por status)
    http.get('*/api/cotacoes/c-1/participantes', () => HttpResponse.json([])),
    http.get('*/api/empresas', () => HttpResponse.json([])),
    http.get('*/api/cotacoes/c-1/ao-vivo', () =>
      HttpResponse.json({ status: state.status, respondidos: 0, totalParticipantes: 0, itens: [] }),
    ),
    http.post('*/api/cotacoes/c-1/:acao', ({ params }) => {
      chamadas[params.acao as string] = (chamadas[params.acao as string] ?? 0) + 1
      return HttpResponse.json(state)
    }),
  )

  const router = createMemoryRouter(
    [{ path: '/admin/cotacoes/:id', element: <CotacaoDetalhePage /> }],
    { initialEntries: ['/admin/cotacoes/c-1'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return {
    chamadas,
    getPrazoRecebido: () => prazoRecebido,
  }
}

test('3.1 — RASCUNHO mostra Abrir e Cancelar visível (sem menu, sem Duplicar nem outros botões de primeiro nível)', async () => {
  setup('RASCUNHO')
  expect(await screen.findByRole('heading', { name: 'Compra semanal' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Abrir' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Duplicar' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Encerrar' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Apurar' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /mais opções/i })).not.toBeInTheDocument()
})

test('breadcrumb mostra Cotações apontando para /admin/cotacoes e o título como segmento atual', async () => {
  setup('ABERTA')
  expect(await screen.findByRole('link', { name: 'Cotações' })).toHaveAttribute('href', '/admin/cotacoes')
  expect(screen.queryByRole('link', { name: 'Compra semanal' })).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Compra semanal' })).toBeInTheDocument()
})

test('3.2 — ABERTA mostra Encerrar e Cancelar visível, não Abrir', async () => {
  setup('ABERTA')
  expect(await screen.findByRole('button', { name: 'Encerrar' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Abrir' })).not.toBeInTheDocument()
})

test('3.5 — Cancelar visível abre o diálogo de confirmação existente', async () => {
  setup('ABERTA')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Cancelar' }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent('Cancelar a cotação é irreversível')
})

test('3.3 — em ENCERRADA o botão "Cancelar" não aparece', async () => {
  setup('ENCERRADA')
  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
})

test('3.4 — em PEDIDOS_GERADOS o botão "Cancelar" não aparece', async () => {
  setup('PEDIDOS_GERADOS')
  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
})

test('3.4 — em CANCELADA o botão "Cancelar" não aparece', async () => {
  setup('CANCELADA')
  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
})

test('3.2 — em RASCUNHO adiciona e remove item', async () => {
  setup('RASCUNHO')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
  const dialog = within(screen.getByRole('dialog'))
  await dialog.findByText('Arroz Tipo 1 5kg')
  // Clicar na linha adiciona o item na hora (sem rascunho/salvar em lote).
  await user.click(dialog.getByRole('button', { name: 'Adicionar Arroz Tipo 1 5kg à cotação' }))
  await user.click(dialog.getByRole('button', { name: 'Concluído' }))

  const linhaItem = await screen.findByRole('cell', { name: 'Arroz Tipo 1 5kg' })
  expect(linhaItem).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Remover' }))
  await waitFor(() => {
    expect(screen.queryByRole('cell', { name: 'Arroz Tipo 1 5kg' })).not.toBeInTheDocument()
  })
})

test('3.5 — cadastra Produto novo no modal aninhado e adiciona à cotação', async () => {
  setup('RASCUNHO')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
  await user.click(
    within(screen.getByRole('dialog', { name: 'Adicionar Itens' })).getByRole('button', {
      name: /Cadastrar novo produto/i,
    }),
  )

  // 2º modal (cadastro) abre empilhado sobre o 1º, que segue montado
  const cadastro = () => screen.getByRole('dialog', { name: 'Cadastrar novo produto' })
  await user.type(within(cadastro()).getByLabelText('Nome do produto'), 'Feijão Carioca 1kg')
  const qtd = within(cadastro()).getByLabelText('Qtd. por embalagem')
  await user.clear(qtd)
  await user.type(qtd, '10')
  await user.click(within(cadastro()).getByRole('button', { name: /Salvar/i }))

  // código de barras vazio → confirmação antes do POST
  await user.click(await screen.findByRole('button', { name: 'Salvar sem código' }))

  // 2º modal fecha; a lista de itens segue aberta
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Cadastrar novo produto' })).not.toBeInTheDocument(),
  )
  const dialogLista = within(screen.getByRole('dialog', { name: 'Adicionar Itens' }))

  // Adiciona o produto recém-criado à cotação
  await dialogLista.findByText('Feijão Carioca 1kg')
  await user.click(dialogLista.getByRole('button', { name: 'Adicionar Feijão Carioca 1kg à cotação' }))
  await user.click(dialogLista.getByRole('button', { name: 'Concluído' }))

  expect(await screen.findByRole('cell', { name: 'Feijão Carioca 1kg' })).toBeInTheDocument()
})

test('editar um produto no modal não perde os itens já adicionados à cotação', async () => {
  const produtosEditaveis = [
    { id: 'p-1', nome: 'Arroz Tipo 1 5kg', codigoBarras: null, unidade: 'Fardo', quantidadePorEmbalagem: 1, ativo: true },
    { id: 'p-2', nome: 'Feijão Carioca 1kg', codigoBarras: null, unidade: 'Pacote', quantidadePorEmbalagem: 1, ativo: true },
  ]
  setup('RASCUNHO')
  server.use(
    http.get('*/api/produtos', () => HttpResponse.json(produtosEditaveis)),
    http.put('*/api/produtos/:id', async ({ params, request }) => {
      const valores = (await request.json()) as { nome: string }
      const p = produtosEditaveis.find((x) => x.id === params.id)
      if (p) p.nome = valores.nome
      return HttpResponse.json(p ?? {})
    }),
  )
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Adicionar item' }))
  const lista = () => within(screen.getByRole('dialog', { name: 'Adicionar Itens' }))
  await lista().findByText('Feijão Carioca 1kg')

  // Adiciona o Feijão à cotação (fica com o estado "Na cotação")
  await user.click(lista().getByRole('button', { name: 'Adicionar Feijão Carioca 1kg à cotação' }))
  await waitFor(() => {
    const linha = screen.getByText('Feijão Carioca 1kg').closest('li') as HTMLElement
    expect(within(linha).getByText('Na cotação')).toBeInTheDocument()
  })

  // Edita OUTRO produto (Arroz): o modal de produto abre empilhado, sem fechar a lista
  await user.click(lista().getByRole('button', { name: 'Editar Arroz Tipo 1 5kg' }))
  const form = await screen.findByRole('dialog', { name: 'Cadastrar novo produto' })
  expect(form).toHaveTextContent('Editar Produto')
  const nome = within(form).getByLabelText('Nome do produto')
  await user.clear(nome)
  await user.type(nome, 'Arroz Integral 5kg')
  await user.click(within(form).getByRole('button', { name: /salvar/i }))
  await user.click(await screen.findByRole('button', { name: 'Salvar sem código' }))
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Cadastrar novo produto' })).not.toBeInTheDocument(),
  )

  // O Feijão continua marcado como "Na cotação" e o Arroz aparece com o nome novo
  expect(await lista().findByText('Arroz Integral 5kg')).toBeInTheDocument()
  const linhaFeijao = screen.getByText('Feijão Carioca 1kg').closest('li') as HTMLElement
  expect(within(linhaFeijao).getByText('Na cotação')).toBeInTheDocument()
})

test('3.2 — em ABERTA o botão "Adicionar item" aparece junto à grade (mas não "Remover")', async () => {
  setup('ABERTA', [novoItem('p-1', 5)])
  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.getByRole('button', { name: 'Adicionar item' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Remover' })).not.toBeInTheDocument()
})

test('3.2 — em ENCERRADA a grade não mostra "Adicionar item"', async () => {
  setup('ENCERRADA', [novoItem('p-1', 5)])
  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.queryByRole('button', { name: 'Adicionar item' })).not.toBeInTheDocument()
})

test('3.4 — Apurar só chama a API após confirmação no diálogo', async () => {
  const { chamadas } = setup('ENCERRADA')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Apurar' }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent('não pode ser desfeito')
  expect(chamadas.apurar ?? 0).toBe(0)

  await user.click(within(dialog).getByRole('button', { name: 'Apurar' }))
  await waitFor(() => expect(chamadas.apurar).toBe(1))
})

test('4.3 — Encerrar abre diálogo de confirmação e só chama a API após confirmar', async () => {
  const { chamadas } = setup('ABERTA')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Encerrar' }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent('deixará de aceitar novas respostas')
  expect(chamadas.encerrar ?? 0).toBe(0)

  await user.click(within(dialog).getByRole('button', { name: 'Encerrar' }))
  await waitFor(() => expect(chamadas.encerrar).toBe(1))
})

test('3.4 — Abrir envia o prazo em ISO', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-09-03T12:00:00Z'))
  const { chamadas, getPrazoRecebido } = setup('RASCUNHO')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Abrir' }))
  const dialog = await screen.findByRole('dialog')

  await user.click(within(dialog).getByRole('gridcell', { name: '15' }))
  await user.selectOptions(within(dialog).getByLabelText('Hora'), '10')
  await user.click(within(dialog).getByRole('button', { name: 'Abrir Cotação' }))

  await waitFor(() => expect(chamadas.abrir).toBe(1))
  const prazo = getPrazoRecebido()
  expect(prazo).toBeTruthy()
  // ISO-8601 canônico (com offset Z)
  expect(new Date(prazo as string).toISOString()).toBe(prazo)
})

// --- duplicar-cotacao-ui removido: "Duplicar" deixou de existir na tela de detalhe. ---

test('Caminho Triste: Erro 500 ao carregar a cotação exibe mensagem de erro e não quebra a tela', async () => {
  server.use(
    http.get('*/api/cotacoes/c-1', () => HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }))
  )
  
  const router = createMemoryRouter([{ path: '/admin/cotacoes/:id', element: <CotacaoDetalhePage /> }], { initialEntries: ['/admin/cotacoes/c-1'] })
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><RouterProvider router={router} /></QueryClientProvider>)
  
  expect(await screen.findByText(/Erro ao carregar a cotação/i)).toBeInTheDocument()
})

test('Caminho Triste: Erro 500 ao tentar Abrir a cotação mantém o modal fechado e exibe alerta de erro', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-09-03T12:00:00Z'))
  setup('RASCUNHO')
  server.use(
    http.post('*/api/cotacoes/c-1/abrir', () => HttpResponse.json({ message: 'Falha no banco de dados' }, { status: 500 }))
  )
  
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  // Tenta abrir
  await user.click(screen.getByRole('button', { name: 'Abrir' }))
  const dialog = await screen.findByRole('dialog')
  await user.click(within(dialog).getByRole('gridcell', { name: '15' }))
  await user.click(within(dialog).getByRole('button', { name: 'Abrir Cotação' }))

  // Verifica se o alerta apareceu e a tela não ficou branca
  expect(await screen.findByRole('alert')).toHaveTextContent('Erro na requisição')
})

test('diálogo de Apurar lista participantes não finalizados (VISUALIZOU)', async () => {
  setup('ENCERRADA')
  server.use(
    http.get('*/api/cotacoes/c-1/participantes', () =>
      HttpResponse.json([
        participante('p1', 'Mercado A', 'VISUALIZOU'),
        participante('p2', 'Mercado B', 'RESPONDIDO'),
      ]),
    ),
  )
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Apurar' }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent('Participantes que não finalizaram a resposta')
  expect(within(dialog).getByText('Mercado A')).toBeInTheDocument()
  expect(within(dialog).queryByText('Mercado B')).not.toBeInTheDocument()
})

test('diálogo de Apurar sem participantes não finalizados não lista nada', async () => {
  setup('ENCERRADA')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Apurar' }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).not.toHaveTextContent('Participantes que não finalizaram a resposta')
})

function gradeComLances(participantesIds: string[]) {
  return {
    status: 'ABERTA',
    respondidos: 0,
    totalParticipantes: participantesIds.length,
    itens: [
      {
        itemCotacaoId: 'item-1',
        nome: 'Arroz Tipo 1 5kg',
        unidade: 'Fardo',
        quantidadePorEmbalagem: 1,
        quantidadeSolicitada: 5,
        ultimoPrecoUnitario: 10,
        menorPrecoUnitario: 10,
        precos: participantesIds.map((participanteId) => ({
          participanteId,
          empresaId: `emp-${participanteId}`,
          empresa: 'Empresa',
          preco: 10,
          precoUnitario: 10,
          status: 'COTADO',
        })),
      },
    ],
  }
}

test('diálogo de Encerrar sem pendências não mostra o aviso nem o botão de finalizar em massa', async () => {
  setup('ABERTA')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Encerrar' }))

  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveTextContent('deixará de aceitar novas respostas')
  expect(dialog).not.toHaveTextContent('preencheram preço mas não finalizaram')
  expect(screen.queryByRole('button', { name: 'Finalizar todos antes de encerrar' })).not.toBeInTheDocument()
})

test('diálogo de Encerrar com pendências lista os nomes e finaliza em massa ao clicar', async () => {
  setup('ABERTA')
  let lista = [
    participante('p1', 'Mercado A', 'VISUALIZOU'),
    participante('p2', 'Mercado B', 'RESPONDIDO'),
  ]
  server.use(
    http.get('*/api/cotacoes/c-1/participantes', () => HttpResponse.json(lista)),
    http.get('*/api/cotacoes/c-1/ao-vivo', () => HttpResponse.json(gradeComLances(['p1', 'p2']))),
    http.post('*/api/participantes/:participanteId/finalizar', ({ params }) => {
      const participanteId = params.participanteId as string
      lista = lista.map((p) =>
        p.participanteId === participanteId ? { ...p, participanteStatus: 'RESPONDIDO' as const } : p,
      )
      return new HttpResponse(null, { status: 204 })
    }),
  )
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Encerrar' }))

  const dialog = screen.getByRole('dialog')
  expect(await within(dialog).findByText('Mercado A')).toBeInTheDocument()
  expect(within(dialog).queryByText('Mercado B')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Finalizar todos antes de encerrar' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Finalizar todos antes de encerrar' }))

  await waitFor(() => {
    expect(within(screen.getByRole('dialog')).queryByText('Mercado A')).not.toBeInTheDocument()
  })
  expect(screen.queryByRole('button', { name: 'Finalizar todos antes de encerrar' })).not.toBeInTheDocument()
})

test('Encerrar continua funcionando normalmente mesmo com o aviso visível', async () => {
  const { chamadas } = setup('ABERTA')
  server.use(
    http.get('*/api/cotacoes/c-1/participantes', () =>
      HttpResponse.json([participante('p1', 'Mercado A', 'VISUALIZOU')]),
    ),
    http.get('*/api/cotacoes/c-1/ao-vivo', () => HttpResponse.json(gradeComLances(['p1']))),
  )
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Encerrar' }))

  const dialog = screen.getByRole('dialog')
  expect(await within(dialog).findByText('Mercado A')).toBeInTheDocument()

  await user.click(within(dialog).getByRole('button', { name: 'Encerrar' }))
  await waitFor(() => expect(chamadas.encerrar).toBe(1))
})

const previaMock = {
  pedidos: [
    {
      id: 'ped-1',
      cotacaoId: 'c-1',
      participanteId: 'p1',
      empresaNome: 'Mercado A',
      status: 'GERADO',
      observacao: null,
      geradoEm: '2026-08-01T12:00:00Z',
      enviadoEm: null,
      confirmadoEm: null,
      itens: [
        {
          id: 'ipi-1',
          itemCotacaoId: 'item-1',
          lanceId: 'lance-1',
          nomeSnapshot: 'Arroz Tipo 1 5kg',
          unidadeSnapshot: 'Fardo',
          quantidadePorEmbalagemSnapshot: 1,
          quantidade: 5,
          precoEmbalagem: 50,
          precoUnitario: 10,
          subtotal: 50,
        },
      ],
      total: 50,
    },
  ],
  itensSemVencedor: [
    {
      id: 'item-2',
      produtoId: 'p-2',
      nomeSnapshot: 'Feijão Carioca 1kg',
      codigoBarrasSnapshot: null,
      unidadeSnapshot: 'Pacote',
      quantidadeSolicitada: 3,
      quantidadePorEmbalagemSnapshot: 1,
    },
  ],
}

test('prévia só é carregada quando o diálogo de Apurar abre', async () => {
  const { chamadas } = setup('ENCERRADA')
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  expect(chamadas.previa ?? 0).toBe(0)

  await user.click(screen.getByRole('button', { name: 'Apurar' }))

  await waitFor(() => expect(chamadas.previa).toBe(1))
})

test('prévia renderiza empresas, itens ganhos, totais e itens sem vencedor', async () => {
  setup('ENCERRADA')
  server.use(
    http.get('*/api/cotacoes/c-1/apuracao/previa', () => HttpResponse.json(previaMock)),
  )
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Apurar' }))

  const dialog = await screen.findByRole('dialog')
  expect(await within(dialog).findByText('Mercado A')).toBeInTheDocument()
  expect(within(dialog).getByText('R$ 50,00')).toBeInTheDocument()
  expect(within(dialog).getByText(/Arroz Tipo 1 5kg/)).toBeInTheDocument()
  expect(within(dialog).getByText('Itens sem vencedor:')).toBeInTheDocument()
  expect(within(dialog).getByText('Feijão Carioca 1kg')).toBeInTheDocument()
})

test('erro na prévia mostra a mensagem e o botão Apurar segue disponível', async () => {
  setup('ENCERRADA')
  server.use(
    http.get('*/api/cotacoes/c-1/apuracao/previa', () =>
      HttpResponse.json({ title: 'Erro', status: 500, detail: 'Falha ao montar a prévia' }, { status: 500 }),
    ),
  )
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Apurar' }))

  const dialog = await screen.findByRole('dialog')
  expect(await within(dialog).findByText('Falha ao montar a prévia')).toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: 'Apurar' })).toBeEnabled()
})

test('fechar e reabrir o diálogo de Apurar não quebra a prévia', async () => {
  setup('ENCERRADA')
  server.use(
    http.get('*/api/cotacoes/c-1/apuracao/previa', () => HttpResponse.json(previaMock)),
  )
  const user = userEvent.setup()
  await screen.findByRole('heading', { name: 'Compra semanal' })

  await user.click(screen.getByRole('button', { name: 'Apurar' }))
  const dialog1 = await screen.findByRole('dialog')
  expect(await within(dialog1).findByText('Mercado A')).toBeInTheDocument()

  await user.click(within(dialog1).getByRole('button', { name: 'Voltar' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Apurar' }))
  const dialog2 = await screen.findByRole('dialog')
  expect(await within(dialog2).findByText('Mercado A')).toBeInTheDocument()
})

test('banner de prazo vencido aparece com ABERTA + prazoVencido', async () => {
  setup('ABERTA', [], true)

  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.getByText(/Prazo vencido/)).toBeInTheDocument()
})

test('banner de prazo vencido ausente com ABERTA dentro do prazo', async () => {
  setup('ABERTA')

  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.queryByText(/Prazo vencido/)).not.toBeInTheDocument()
})

test('banner de prazo vencido ausente quando status não é ABERTA', async () => {
  setup('ENCERRADA', [], true)

  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.queryByText(/Prazo vencido/)).not.toBeInTheDocument()
})

test('cabeçalho mostra "3 de 4 convites entregues" com participantes mistos', async () => {
  setup('ABERTA')
  server.use(
    http.get('*/api/cotacoes/c-1/participantes', () =>
      HttpResponse.json([
        participante('p1', 'Mercado A', 'CONVIDADO'),
        participante('p2', 'Mercado B', 'CONVIDADO'),
        participante('p3', 'Mercado C', 'CONVIDADO'),
        { ...participante('p4', 'Mercado D', 'CONVIDADO'), conviteStatus: 'FALHOU' },
      ]),
    ),
  )

  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(await screen.findByText(/3 de 4 convites entregues/)).toBeInTheDocument()
})

test('resumo de convites entregues ausente em RASCUNHO', async () => {
  setup('RASCUNHO')

  await screen.findByRole('heading', { name: 'Compra semanal' })
  expect(screen.queryByText(/convites entregues/)).not.toBeInTheDocument()
})

test('ação "ver" no resumo abre o modal de Representantes', async () => {
  setup('ABERTA')
  server.use(
    http.get('*/api/cotacoes/c-1/participantes', () =>
      HttpResponse.json([
        participante('p1', 'Mercado A', 'CONVIDADO'),
        { ...participante('p2', 'Mercado B', 'CONVIDADO'), conviteStatus: 'FALHOU' },
      ]),
    ),
  )
  const user = userEvent.setup()

  await screen.findByRole('heading', { name: 'Compra semanal' })
  await screen.findByText(/1 de 2 convites entregues/)
  await user.click(screen.getByRole('button', { name: 'ver' }))

  expect(await screen.findByRole('dialog')).toBeInTheDocument()
})

test('RASCUNHO: fornecedor escolhido no modal vira chip com × na tela', async () => {
  setup('RASCUNHO')
  server.use(
    http.get('*/api/empresas', () =>
      HttpResponse.json([
        { id: 'e1', nome: 'Distribuidora Aurora', ramo: 'Hortifrúti', ativo: true },
        { id: 'e2', nome: 'Comercial Sul', ramo: 'Mercearia', ativo: true },
      ]),
    ),
  )
  const user = userEvent.setup()

  await screen.findByRole('heading', { name: 'Compra semanal' })
  // antes de escolher, a SubFaixa não cita fornecedores
  expect(screen.queryByText(/fornecedor/)).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Representantes' }))
  const dialog = await screen.findByRole('dialog')
  await user.click(within(dialog).getByText('Distribuidora Aurora'))
  await user.click(within(dialog).getByRole('button', { name: 'Pronto' }))

  // chip aparece na superfície, com ação de remover
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Remover Distribuidora Aurora da cotação' }),
    ).toBeInTheDocument(),
  )
  expect(screen.getByText(/1 fornecedor/)).toBeInTheDocument()

  // × tira o chip
  await user.click(screen.getByRole('button', { name: 'Remover Distribuidora Aurora da cotação' }))
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Remover Distribuidora Aurora da cotação' }),
    ).not.toBeInTheDocument(),
  )
})
