import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { NovaCotacaoWizard } from './NovaCotacaoWizard'

type Item = {
  id: string
  produtoId: string
  nomeSnapshot: string
  codigoBarrasSnapshot: string | null
  unidadeSnapshot: string
  quantidadeSolicitada: number
  quantidadePorEmbalagemSnapshot: number
}

const COTACAO_ID = 'nova-1'

const PRODUTO = {
  id: 'p-1',
  nome: 'Arroz Tipo 1 5kg',
  codigoBarras: null,
  unidade: 'Fardo',
  quantidadePorEmbalagem: 1,
  ativo: true,
}

const EMPRESA = { id: 'emp-1', nome: 'Fornecedor A LTDA', ativo: true }

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

function setupWizard(itensIniciais: Item[] = []) {
  const state = {
    id: COTACAO_ID,
    titulo: 'Compra semanal',
    status: 'RASCUNHO',
    prazo: null,
    criadaEm: '2026-08-28T12:00:00Z',
    encerradaEm: null,
    itens: [...itensIniciais],
  }
  const chamadas: { convidar?: string[]; abrir?: unknown } = {}

  server.use(
    http.get('*/api/cotacoes/nova-1', () => HttpResponse.json(state)),
    http.get('*/api/produtos', () => HttpResponse.json([PRODUTO])),
    http.get('*/api/analises/produtos/insight', () => HttpResponse.json({})),
    http.get('*/api/empresas', () => HttpResponse.json([EMPRESA])),
    http.get('*/api/representantes', () => HttpResponse.json([])),
    http.get('*/api/cotacoes/nova-1/participantes', () => HttpResponse.json([])),
    http.post('*/api/cotacoes/nova-1/itens', async ({ request }) => {
      const body = (await request.json()) as { produtoId: string; quantidade: number }
      state.itens.push(novoItem(body.produtoId, body.quantidade))
      return HttpResponse.json(state, { status: 201 })
    }),
    http.post('*/api/cotacoes/nova-1/participantes', async ({ request }) => {
      const body = (await request.json()) as { empresaIds: string[] }
      chamadas.convidar = body.empresaIds
      return HttpResponse.json({}, { status: 200 })
    }),
    http.post('*/api/cotacoes/nova-1/abrir', async ({ request }) => {
      chamadas.abrir = await request.json()
      state.status = 'ABERTA'
      return HttpResponse.json(state)
    }),
  )

  const router = createMemoryRouter(
    [
      { path: '/montar', element: <NovaCotacaoWizard cotacaoId={COTACAO_ID} /> },
      { path: '/admin/cotacoes/:id', element: <div>detalhe</div> },
    ],
    { initialEntries: ['/montar'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { chamadas }
}

test('fluxo completo: cria item, seleciona empresa, escolhe prazo e abre', async () => {
  const { chamadas } = setupWizard()
  const user = userEvent.setup()

  // Passo 1 — adicionar item
  await user.click(await screen.findByRole('button', { name: 'Adicionar item' }))
  const modalItens = screen.getByRole('dialog', { name: 'Adicionar Itens' })
  await user.click(await within(modalItens).findByText('Arroz Tipo 1 5kg'))
  await user.click(within(modalItens).getByRole('button', { name: 'Concluído' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

  // Passo 2 — selecionar empresa
  await user.click(screen.getByRole('button', { name: 'Avançar' }))
  await user.click(screen.getByRole('button', { name: 'Selecionar empresas' }))
  const modalEmpresas = await screen.findByRole('dialog')
  await user.click(within(modalEmpresas).getByText('Fornecedor A LTDA'))
  await user.click(within(modalEmpresas).getByRole('button', { name: 'Pronto' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(screen.getByText(/1 empresa selecionada/)).toBeInTheDocument()

  // Passo 3 — prazo e revisar
  await user.click(screen.getByRole('button', { name: 'Avançar' }))
  expect(screen.getByText(/1 item · 1 empresa/)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Escolher prazo' }))
  const modalPrazo = await screen.findByRole('dialog')
  await user.click(within(modalPrazo).getByRole('button', { name: '+24h' }))
  await user.click(within(modalPrazo).getByRole('button', { name: 'Abrir Cotação' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

  const abrir = screen.getByRole('button', { name: 'Abrir' })
  expect(abrir).toBeEnabled()

  await user.click(abrir)

  await waitFor(() => expect(chamadas.convidar).toEqual(['emp-1']))
  expect(chamadas.abrir).toMatchObject({ prazo: expect.any(String) })
  expect(await screen.findByText('detalhe')).toBeInTheDocument()
})

test('"Abrir" desabilitado sem item nem empresa', async () => {
  setupWizard([])
  const user = userEvent.setup()

  await screen.findByRole('button', { name: 'Avançar' })
  await user.click(screen.getByRole('button', { name: 'Avançar' }))
  await user.click(screen.getByRole('button', { name: 'Avançar' }))

  expect(screen.getByRole('button', { name: 'Abrir' })).toBeDisabled()
})

test('"Abrir" desabilitado com item mas sem empresa', async () => {
  setupWizard([novoItem('p-1', 1)])
  const user = userEvent.setup()

  await screen.findByRole('button', { name: 'Avançar' })
  await user.click(screen.getByRole('button', { name: 'Avançar' }))
  await user.click(screen.getByRole('button', { name: 'Avançar' }))

  expect(screen.getByRole('button', { name: 'Abrir' })).toBeDisabled()
})

test('voltar entre passos preserva itens, empresas e prazo', async () => {
  setupWizard()
  const user = userEvent.setup()

  // Passo 1 — adicionar item
  await user.click(await screen.findByRole('button', { name: 'Adicionar item' }))
  const modalItens = screen.getByRole('dialog', { name: 'Adicionar Itens' })
  await user.click(await within(modalItens).findByText('Arroz Tipo 1 5kg'))
  await user.click(within(modalItens).getByRole('button', { name: 'Concluído' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

  // Passo 2 — selecionar empresa
  await user.click(screen.getByRole('button', { name: 'Avançar' }))
  await user.click(screen.getByRole('button', { name: 'Selecionar empresas' }))
  const modalEmpresas = await screen.findByRole('dialog')
  await user.click(within(modalEmpresas).getByText('Fornecedor A LTDA'))
  await user.click(within(modalEmpresas).getByRole('button', { name: 'Pronto' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

  // Passo 3 — escolher prazo
  await user.click(screen.getByRole('button', { name: 'Avançar' }))
  await user.click(screen.getByRole('button', { name: 'Escolher prazo' }))
  const modalPrazo = await screen.findByRole('dialog')
  await user.click(within(modalPrazo).getByRole('button', { name: '+24h' }))
  await user.click(within(modalPrazo).getByRole('button', { name: 'Abrir Cotação' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(screen.getByText(/1 item · 1 empresa · expira/)).toBeInTheDocument()

  // Volta até o passo 1 e confere o item preservado
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  await user.click(screen.getByRole('button', { name: 'Voltar' }))
  expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()

  // Avança de novo: empresa e prazo continuam preservados
  await user.click(screen.getByRole('button', { name: 'Avançar' }))
  expect(screen.getByText(/1 empresa selecionada/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Avançar' }))
  expect(screen.getByText(/1 item · 1 empresa · expira/)).toBeInTheDocument()
})
