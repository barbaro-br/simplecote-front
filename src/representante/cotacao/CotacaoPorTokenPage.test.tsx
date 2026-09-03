import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { CotacaoPorTokenPage } from './CotacaoPorTokenPage'
import type { ItemLance } from './cotacao-token.schema'
import type { LanceStatus } from '@/shared/domain/tipos-base'

const TOKEN = 'tok-page'
const CHAVE_FILA = `simplecote:fila:${TOKEN}`
const CHAVE_TUTORIAL = 'simplecote:tutorial-preco:v1'
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
    ] as ItemLance[],
  }
}
function cotacao(over: Partial<ReturnType<typeof base>> = {}) {
  return { ...base(), ...over }
}

function itemDe(id: string, nome: string, statusLance: LanceStatus = 'PENDENTE'): ItemLance {
  return { ...base().itens[0], itemCotacaoId: id, nome, statusLance }
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
const bolha = () => screen.queryByRole('status')

const mockStore: Record<string, string> = {}
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (k: string) => mockStore[k] || null,
    setItem: (k: string, v: string) => { mockStore[k] = String(v) },
    removeItem: (k: string) => delete mockStore[k],
    clear: () => { for (const k in mockStore) delete mockStore[k] }
  }
})

beforeEach(() => {
  window.localStorage.clear()
  // Sem isto o tutorial de primeira visita cobriria todas as telas.
  window.localStorage.setItem(CHAVE_TUTORIAL, '1')
})

test('token válido: mostra a saudação, o contexto e os itens, com a bolha de progresso', async () => {
  server.use(http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())))
  renderPage()

  // A saudação virou texto secundário na barra inferior (não é mais heading).
  expect(await screen.findByText(/olá, francisco/i)).toBeInTheDocument()
  expect(screen.getByText(/Atacadão Central · cotação de Supermercado X/)).toBeInTheDocument()
  expect(screen.getByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /finalizar/i })).toBeInTheDocument()

  // O item de mock está sem preço → bolha "0 de 1".
  expect(screen.getByRole('status', { name: /0 de 1 itens com preço/i })).toBeInTheDocument()
})

test('prazo alerta < 2h renderiza classe text-destructive', async () => {
  const daquiUmPouco = new Date()
  daquiUmPouco.setMinutes(daquiUmPouco.getMinutes() + 60) // 1h no futuro

  server.use(http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao({ prazo: daquiUmPouco.toISOString() }))))
  renderPage()

  const prazoEl = await screen.findByText(/Prazo:/i)
  expect(prazoEl).toHaveClass('text-destructive')
})

test('podeEditar falso: campos desabilitados e sem botão de finalizar/bolha', async () => {
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () =>
      HttpResponse.json(cotacao({ podeEditar: false, participanteStatus: 'RESPONDIDO' })),
    ),
  )
  renderPage()

  expect(await screen.findByText(/sua resposta já foi enviada/i)).toBeInTheDocument()
  expect(campoPreco()).toBeDisabled()
  expect(screen.queryByRole('button', { name: /finalizar/i })).not.toBeInTheDocument()
  expect(bolha()).not.toBeInTheDocument()
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
  const fila = JSON.parse(window.localStorage.getItem(CHAVE_FILA) ?? '{}')
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
  expect(window.localStorage.getItem(CHAVE_FILA)).toBeNull()
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
  expect(window.localStorage.getItem(CHAVE_FILA)).toBeNull()
})

test('finalizar: bloqueado com pendência; libera (via online) e, após confirmar, limpa a fila com 204', async () => {
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

  const finalizarBtn = await screen.findByRole('button', { name: /^finalizar$/i })
  await waitFor(() => expect(finalizarBtn).toBeEnabled())

  await user.click(finalizarBtn)
  await user.click(await screen.findByRole('button', { name: /confirmar/i }))
  await waitFor(() => expect(window.localStorage.getItem(CHAVE_FILA)).toBeNull())
})

test('Finalizar abre a confirmação; POST só sai após "Confirmar"; "Cancelar" não envia', async () => {
  let posts = 0
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())),
    http.post(`*/public/cotacoes/${TOKEN}/finalizar`, () => {
      posts += 1
      return new HttpResponse(null, { status: 204 })
    }),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByRole('button', { name: /^finalizar$/i }))
  expect(await screen.findByText('Enviar cotação?')).toBeInTheDocument()
  expect(posts).toBe(0)

  await user.click(screen.getByRole('button', { name: /cancelar/i }))
  await waitFor(() => expect(screen.queryByText('Enviar cotação?')).not.toBeInTheDocument())
  expect(posts).toBe(0)

  await user.click(screen.getByRole('button', { name: /^finalizar$/i }))
  await user.click(await screen.findByRole('button', { name: /confirmar/i }))
  await waitFor(() => expect(posts).toBe(1))
})

test('sucesso: 204 mostra "Cotação enviada!" e, ao fechar, a tela fica somente leitura', async () => {
  let editavel = true
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () =>
      HttpResponse.json(
        cotacao({
          podeEditar: editavel,
          participanteStatus: editavel ? 'VISUALIZOU' : 'RESPONDIDO',
        }),
      ),
    ),
    http.post(`*/public/cotacoes/${TOKEN}/finalizar`, () => {
      editavel = false
      return new HttpResponse(null, { status: 204 })
    }),
  )
  const user = userEvent.setup()
  renderPage()

  await user.click(await screen.findByRole('button', { name: /^finalizar$/i }))
  await user.click(await screen.findByRole('button', { name: /confirmar/i }))

  expect(await screen.findByText('Cotação enviada!')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /fechar/i }))
  expect(await screen.findByText(/sua resposta já foi enviada/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /finalizar/i })).not.toBeInTheDocument()
})

test('a bolha acompanha a digitação de preço', async () => {
  server.use(http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())))
  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByRole('status', { name: /0 de 1 itens com preço/i })).toBeInTheDocument()
  await user.type(campoPreco(), '7')
  expect(screen.getByRole('status', { name: /1 de 1 itens com preço/i })).toBeInTheDocument()
})

test('a bolha destaca (bg-primary) quando todos os itens têm preço', async () => {
  const cotado = { ...cotacao(), itens: [{ ...base().itens[0], preco: 12, statusLance: 'COTADO' }] }
  server.use(http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotado)))
  renderPage()

  const el = await screen.findByRole('status', { name: /1 de 1 itens com preço/i })
  expect(el).toHaveClass('bg-primary')
})

test('primeira visita: mostra o tutorial; concluir grava a chave e não repete', async () => {
  window.localStorage.removeItem(CHAVE_TUTORIAL)
  server.use(http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(cotacao())))
  const { unmount } = renderPage()

  expect(await screen.findByText('Conheça o card de produto')).toBeInTheDocument()
  // fireEvent (não userEvent): o overlay full-screen + a barra fixa confundem o
  // hit-test do userEvent no jsdom; o clique do botão em si é coberto por TutorialOnboarding.test.tsx.
  fireEvent.click(screen.getByRole('button', { name: /pular tutorial/i }))
  await waitFor(() => expect(screen.queryByText('Conheça o card de produto')).not.toBeInTheDocument())
  expect(window.localStorage.getItem(CHAVE_TUTORIAL)).not.toBeNull()

  unmount()
  renderPage()
  expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.queryByText('Conheça o card de produto')).not.toBeInTheDocument()
})

test('preencher um item não marca os demais (presentes desde o início) como "Novo"', async () => {
  const inicial = cotacao({
    itens: [itemDe('i-1', 'Arroz Tipo 1 5kg'), itemDe('i-2', 'Feijão Preto 1kg')],
  })
  const atualizado = cotacao({
    itens: [
      { ...itemDe('i-1', 'Arroz Tipo 1 5kg'), preco: 12.5, statusLance: 'COTADO' },
      itemDe('i-2', 'Feijão Preto 1kg'),
    ],
  })
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(inicial)),
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () => HttpResponse.json(atualizado)),
  )
  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.getByText('Feijão Preto 1kg')).toBeInTheDocument()
  expect(screen.queryByText('Novo')).not.toBeInTheDocument()

  const campos = screen.getAllByLabelText(/preço da embalagem/i)
  await user.type(campos[0], '12.5')
  await sleep(APOS_DEBOUNCE)

  // i-1 agora COTADO; i-2 (presente desde o início) NÃO deve ganhar "Novo".
  expect(screen.queryByText('Novo')).not.toBeInTheDocument()
})

test('primeiro carregamento não marca nada como "Novo" mesmo com statusLance misto', async () => {
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () =>
      HttpResponse.json(
        cotacao({
          itens: [
            itemDe('i-1', 'Arroz Tipo 1 5kg', 'COTADO'),
            itemDe('i-2', 'Feijão Preto 1kg', 'PENDENTE'),
          ],
        }),
      ),
    ),
  )
  renderPage()

  expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.getByText('Feijão Preto 1kg')).toBeInTheDocument()
  expect(screen.queryByText('Novo')).not.toBeInTheDocument()
})

test('refetch com snapshot obsoleto não reverte a contagem de item já precificado localmente', async () => {
  const inicial = cotacao({ itens: [itemDe('i-1', 'Arroz Tipo 1 5kg')] })
  const obsoleto = cotacao({ itens: [itemDe('i-1', 'Arroz Tipo 1 5kg')] })
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(inicial)),
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () => HttpResponse.json(obsoleto)),
  )
  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByRole('status', { name: /0 de 1 itens com preço/i })).toBeInTheDocument()
  await user.type(campoPreco(), '12.5')
  expect(screen.getByRole('status', { name: /1 de 1 itens com preço/i })).toBeInTheDocument()

  // A resposta do PUT traz um snapshot obsoleto (item ainda com preco null).
  // A contagem local não pode retroceder para um item que o representante já precificou.
  await sleep(APOS_DEBOUNCE)
  expect(screen.getByRole('status', { name: /1 de 1 itens com preço/i })).toBeInTheDocument()
})

test('item novo trazido por uma atualização entra na contagem como "sem preço"', async () => {
  const inicial = cotacao({ itens: [itemDe('i-1', 'Arroz Tipo 1 5kg')] })
  const atualizado = cotacao({
    itens: [
      { ...itemDe('i-1', 'Arroz Tipo 1 5kg'), preco: 12.5, statusLance: 'COTADO' },
      itemDe('i-2', 'Feijão Preto 1kg'),
    ],
  })
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(inicial)),
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () => HttpResponse.json(atualizado)),
  )
  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByRole('status', { name: /0 de 1 itens com preço/i })).toBeInTheDocument()
  await user.type(campoPreco(), '12.5')
  await sleep(APOS_DEBOUNCE)

  expect(await screen.findByText('Feijão Preto 1kg')).toBeInTheDocument()
  expect(screen.getByRole('status', { name: /1 de 2 itens com preço/i })).toBeInTheDocument()
})

test('primeiro carregamento semeia a contagem a partir de d.itens (mistura de com/sem preço)', async () => {
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () =>
      HttpResponse.json(
        cotacao({
          itens: [
            { ...itemDe('i-1', 'Arroz Tipo 1 5kg'), preco: 12.5, statusLance: 'COTADO' },
            itemDe('i-2', 'Feijão Preto 1kg'),
            itemDe('i-3', 'Óleo de Soja 900ml'),
          ],
        }),
      ),
    ),
  )
  renderPage()

  expect(await screen.findByRole('status', { name: /1 de 3 itens com preço/i })).toBeInTheDocument()
})

test('item que chega numa atualização depois do primeiro load é marcado "Novo"', async () => {
  const inicial = cotacao({ itens: [itemDe('i-1', 'Arroz Tipo 1 5kg')] })
  const atualizado = cotacao({
    itens: [
      { ...itemDe('i-1', 'Arroz Tipo 1 5kg'), preco: 10, statusLance: 'COTADO' },
      itemDe('i-2', 'Feijão Preto 1kg'),
    ],
  })
  server.use(
    http.get(`*/public/cotacoes/${TOKEN}`, () => HttpResponse.json(inicial)),
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () => HttpResponse.json(atualizado)),
  )
  const user = userEvent.setup()
  renderPage()

  expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
  expect(screen.queryByText('Feijão Preto 1kg')).not.toBeInTheDocument()
  expect(screen.queryByText('Novo')).not.toBeInTheDocument()

  await user.type(await screen.findByLabelText(/preço da embalagem/i), '10')
  await sleep(APOS_DEBOUNCE)

  expect(await screen.findByText('Feijão Preto 1kg')).toBeInTheDocument()
  expect(screen.getByText('Novo')).toBeInTheDocument()
})
