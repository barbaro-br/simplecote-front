import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { CotacaoPorTokenPage } from './CotacaoPorTokenPage'

const TOKEN = 'tok-page'
const CHAVE_FILA = `simplecote:fila:${TOKEN}`
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
// debounce do ItemLanceCard é 800ms — espera com folga
const APOS_DEBOUNCE = 950

function base() {
  return {
    cotacaoId: 'c-1',
    titulo: 'Compra semanal',
    status: 'ABERTA',
    prazo: '2026-12-30T12:00:00Z',
    podeEditar: true,
    participanteStatus: 'VISUALIZOU',
    representanteNome: 'Francisco Almeida',
    empresaNome: 'Atacadão Central',
    compradorNome: 'Supermercado X',
    itens: [
      {
        itemCotacaoId: 'i-1',
        nome: 'Arroz Tipo 1 5kg',
        codigoBarras: null,
        unidade: 'Fardo',
        quantidadeSolicitada: 10,
        quantidadePorEmbalagemSnapshot: 1,
        preco: null,
        precoUnitario: null,
        statusLance: 'PENDENTE',
      },
    ],
  }
}
function cotacao(over: Partial<ReturnType<typeof base>> = {}) {
  return { ...base(), ...over }
}

function renderPage() {
  const router = createMemoryRouter([{ path: '/cotacao/:token', element: <CotacaoPorTokenPage /> }], {
    initialEntries: [`/cotacao/${TOKEN}`],
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

const campoPreco = () => screen.getByLabelText(/preço da embalagem/i)

beforeEach(() => localStorage.clear())

test('token válido: mostra a saudação, o contexto e os itens', async () => {
  server.use(http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())))
  renderPage()

  expect(await screen.findByRole('heading', { name: /olá, francisco/i })).toBeInTheDocument()
  expect(screen.getByText(/Atacadão Central · cotação de Supermercado X/)).toBeInTheDocument()
  expect(screen.getByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /finalizar resposta/i })).toBeInTheDocument()
})

test('podeEditar falso: campos desabilitados e sem botão de finalizar', async () => {
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () =>
      HttpResponse.json(cotacao({ podeEditar: false, participanteStatus: 'RESPONDIDO' })),
    ),
  )
  renderPage()

  expect(await screen.findByText(/sua resposta já foi enviada/i)).toBeInTheDocument()
  expect(campoPreco()).toBeDisabled()
  expect(screen.queryByRole('button', { name: /finalizar resposta/i })).not.toBeInTheDocument()
})

test('token inválido: estado de link inválido', async () => {
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Not Found', status: 404, detail: 'Cotação não encontrada.' },
        { status: 404 },
      ),
    ),
  )
  renderPage()
  expect(await screen.findByRole('heading', { name: /link inválido/i })).toBeInTheDocument()
})

test('autosave: digitar preço → 1 PUT só com aquele item → célula sincronizada', async () => {
  const puts: unknown[] = []
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())),
    http.put(`*/public/cotacoes/${TOKEN}/lances`, async ({ request }) => {
      puts.push(await request.json())
      return HttpResponse.json(cotacao())
    }),
  )
  const user = userEvent.setup()
  renderPage()

  await user.type(await screen.findByLabelText(/preço da embalagem/i), '12.5')
  await sleep(APOS_DEBOUNCE)

  await waitFor(() => expect(puts).toHaveLength(1))
  expect(puts[0]).toEqual({ lances: [{ itemCotacaoId: 'i-1', preco: 12.5 }] })
  expect(await screen.findByText('✓ salvo')).toBeInTheDocument()
})

test('falha de rede: entrada persiste no localStorage e célula mostra "sem conexão"', async () => {
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())),
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () => HttpResponse.error()),
  )
  const user = userEvent.setup()
  renderPage()

  await user.type(await screen.findByLabelText(/preço da embalagem/i), '30')
  await sleep(APOS_DEBOUNCE)

  expect(await screen.findByText(/sem conexão/i)).toBeInTheDocument()
  const fila = JSON.parse(localStorage.getItem(CHAVE_FILA) ?? '{}')
  expect(fila['i-1']).toMatchObject({ preco: 30 })
})

test('erro 422: ProblemDetail exibido e entrada some da fila', async () => {
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())),
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Unprocessable', status: 422, detail: 'Preço acima do teto permitido.' },
        { status: 422 },
      ),
    ),
  )
  const user = userEvent.setup()
  renderPage()

  await user.type(await screen.findByLabelText(/preço da embalagem/i), '999')
  await sleep(APOS_DEBOUNCE)

  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('Preço acima do teto permitido.'),
  )
  expect(localStorage.getItem(CHAVE_FILA)).toBeNull()
})

test('concorrência: duas edições rápidas no mesmo campo — estado final = último valor', async () => {
  const precos: number[] = []
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())),
    http.put(`*/public/cotacoes/${TOKEN}/lances`, async ({ request }) => {
      const body = (await request.json()) as { lances: { preco: number }[] }
      precos.push(body.lances[0].preco)
      return HttpResponse.json(cotacao())
    }),
  )
  const user = userEvent.setup()
  renderPage()

  const campo = await screen.findByLabelText(/preço da embalagem/i)
  await user.type(campo, '1')
  await sleep(300)
  await user.type(campo, '2') // "12"
  await sleep(APOS_DEBOUNCE)

  expect(await screen.findByText('✓ salvo')).toBeInTheDocument()
  expect(precos.at(-1)).toBe(12)
  expect(localStorage.getItem(CHAVE_FILA)).toBeNull()
})

test('finalizar: bloqueado com pendência; libera (via online) e limpa a fila com 204', async () => {
  let putFalha = true
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())),
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () =>
      putFalha ? HttpResponse.error() : HttpResponse.json(cotacao()),
    ),
    http.post(`*/public/cotacoes/${TOKEN}/finalizar`, () => new HttpResponse(null, { status: 204 })),
  )
  const user = userEvent.setup()
  renderPage()

  await user.type(await screen.findByLabelText(/preço da embalagem/i), '20')
  await sleep(APOS_DEBOUNCE)

  const btn = await screen.findByRole('button', { name: /sincronizando 1 preço/i })
  expect(btn).toBeDisabled()

  // rede volta → evento online força retry → fila esvazia
  putFalha = false
  window.dispatchEvent(new Event('online'))

  const finalizarBtn = await screen.findByRole('button', { name: /^finalizar resposta$/i })
  await waitFor(() => expect(finalizarBtn).toBeEnabled())

  await user.click(finalizarBtn)
  await waitFor(() => expect(localStorage.getItem(CHAVE_FILA)).toBeNull())
})
