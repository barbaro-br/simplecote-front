import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { server } from '@/setupTests'
import { useFilaDeSincronizacao } from './useFilaDeSincronizacao'
import { cotacaoKey } from './cotacao-token.api'

const TOKEN = 'tok-fila'

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

function semear(entradas: Record<string, unknown>) {
  localStorage.setItem(`simplecote:fila:${TOKEN}`, JSON.stringify(entradas))
}

const mockStore: Record<string, string> = {}
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => mockStore[k] || null,
    setItem: (k: string, v: string) => { mockStore[k] = String(v) },
    removeItem: (k: string) => delete mockStore[k],
    clear: () => { for (const k in mockStore) delete mockStore[k] }
  }
})

beforeEach(() => globalThis.localStorage.clear())
afterEach(() => vi.useRealTimers())

test('no mount, fila não-vazia dispara um reenvio imediato de cada entrada na ordem', async () => {
  vi.useFakeTimers()
  const puts: string[] = []
  server.use(
    http.put(`*/public/cotacoes/${TOKEN}/lances`, async ({ request }) => {
      const body = (await request.json()) as { lances: { itemCotacaoId: string }[] }
      puts.push(body.lances[0].itemCotacaoId)
      return HttpResponse.json({})
    }),
  )
  semear({
    'i-1': { preco: 10, tentativas: 1, ultimaTentativaEm: 1 },
    'i-2': { naoCotado: true, tentativas: 1, ultimaTentativaEm: 2 },
  })

  const { result } = renderHook(() => useFilaDeSincronizacao(TOKEN), { wrapper: wrapper() })

  await vi.advanceTimersByTimeAsync(0)
  expect(puts).toEqual(['i-1', 'i-2'])
  await vi.waitFor(() => expect(result.current.pendencias).toBe(0))
  expect(localStorage.getItem(`simplecote:fila:${TOKEN}`)).toBeNull()
})

test('timer de 10s reenvia a entrada que falhou por rede', async () => {
  vi.useFakeTimers()
  let tentativa = 0
  server.use(
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () => {
      tentativa += 1
      return tentativa === 1 ? HttpResponse.error() : HttpResponse.json({})
    }),
  )
  semear({ 'i-1': { preco: 5, tentativas: 0, ultimaTentativaEm: 1 } })

  const { result } = renderHook(() => useFilaDeSincronizacao(TOKEN), { wrapper: wrapper() })

  // mount → 1ª tentativa falha, entrada permanece
  await vi.waitFor(() => expect(result.current.statusPorItem['i-1']).toBe('falhou'))
  expect(result.current.pendencias).toBe(1)

  // 10s depois → retry, agora com sucesso
  await vi.advanceTimersByTimeAsync(10_000)
  await vi.waitFor(() => expect(result.current.pendencias).toBe(0))
  expect(tentativa).toBe(2)
})

test('evento online força retry imediato', async () => {
  vi.useFakeTimers()
  let tentativa = 0
  server.use(
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () => {
      tentativa += 1
      return tentativa === 1 ? HttpResponse.error() : HttpResponse.json({})
    }),
  )
  semear({ 'i-1': { preco: 5, tentativas: 0, ultimaTentativaEm: 1 } })

  const { result } = renderHook(() => useFilaDeSincronizacao(TOKEN), { wrapper: wrapper() })
  await vi.waitFor(() => expect(result.current.statusPorItem['i-1']).toBe('falhou'))

  window.dispatchEvent(new Event('online'))
  await vi.waitFor(() => expect(result.current.pendencias).toBe(0))
  expect(tentativa).toBe(2)
})

test('sucesso do PUT atualiza o cache com o precoUnitario devolvido', async () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const w = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
  const resposta = {
    cotacaoId: 'c-1',
    titulo: 'Cotação',
    status: 'ABERTA',
    prazo: null,
    podeEditar: true,
    participanteStatus: 'PENDENTE',
    representanteNome: 'Ana',
    empresaNome: 'Empresa X',
    compradorNome: 'Supermercado',
    itens: [
      {
        itemCotacaoId: 'i-1',
        nome: 'Arroz',
        codigoBarras: null,
        unidade: 'Fardo',
        quantidadeSolicitada: 10,
        quantidadePorEmbalagemSnapshot: 20,
        preco: 10,
        precoUnitario: 0.5,
        statusLance: 'COTADO',
      },
    ],
  }
  server.use(
    http.put(`*/public/cotacoes/${TOKEN}/lances`, () => HttpResponse.json(resposta)),
  )
  semear({ 'i-1': { preco: 10, tentativas: 0, ultimaTentativaEm: 1 } })

  renderHook(() => useFilaDeSincronizacao(TOKEN), { wrapper: w })

  await vi.waitFor(() => {
    expect(qc.getQueryData(cotacaoKey(TOKEN))).toEqual(resposta)
  })
})

test('respostas concorrentes de itens diferentes não sobrescrevem o precoUnitario um do outro', async () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const w = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )

  const item = (id: string, preco: number | null, precoUnitario: number | null) => ({
    itemCotacaoId: id,
    nome: id === 'i-1' ? 'Arroz' : 'Feijão',
    codigoBarras: null,
    unidade: 'Fardo',
    quantidadeSolicitada: 10,
    quantidadePorEmbalagemSnapshot: 20,
    preco,
    precoUnitario,
    statusLance: 'COTADO' as const,
  })

  // Cache inicial: dois itens ainda sem preço unitário (como viria do GET).
  qc.setQueryData(cotacaoKey(TOKEN), {
    cotacaoId: 'c-1',
    titulo: 'Cotação',
    status: 'ABERTA',
    prazo: null,
    podeEditar: true,
    participanteStatus: 'PENDENTE',
    representanteNome: 'Ana',
    empresaNome: 'Empresa X',
    compradorNome: 'Supermercado',
    itens: [item('i-1', null, null), item('i-2', null, null)],
  })

  // Resposta de cada PUT traz só o item daquela requisição atualizado; o outro
  // item volta "stale" (precoUnitario null), reproduzindo o snapshot desatualizado.
  server.use(
    http.put(`*/public/cotacoes/${TOKEN}/lances`, async ({ request }) => {
      const body = (await request.json()) as { lances: { itemCotacaoId: string }[] }
      const id = body.lances[0].itemCotacaoId
      return HttpResponse.json({
        cotacaoId: 'c-1',
        titulo: 'Cotação',
        status: 'ABERTA',
        prazo: null,
        podeEditar: true,
        participanteStatus: 'PENDENTE',
        representanteNome: 'Ana',
        empresaNome: 'Empresa X',
        compradorNome: 'Supermercado',
        itens: [
          item('i-1', id === 'i-1' ? 10 : null, id === 'i-1' ? 0.5 : null),
          item('i-2', id === 'i-2' ? 20 : null, id === 'i-2' ? 0.25 : null),
        ],
      })
    }),
  )

  semear({
    'i-1': { preco: 10, tentativas: 0, ultimaTentativaEm: 1 },
    'i-2': { preco: 20, tentativas: 0, ultimaTentativaEm: 2 },
  })

  renderHook(() => useFilaDeSincronizacao(TOKEN), { wrapper: w })

  await vi.waitFor(() => {
    const cache = qc.getQueryData(cotacaoKey(TOKEN)) as {
      itens: { itemCotacaoId: string; precoUnitario: number | null }[]
    }
    expect(cache.itens.find((i) => i.itemCotacaoId === 'i-1')?.precoUnitario).toBe(0.5)
    expect(cache.itens.find((i) => i.itemCotacaoId === 'i-2')?.precoUnitario).toBe(0.25)
  })
})
