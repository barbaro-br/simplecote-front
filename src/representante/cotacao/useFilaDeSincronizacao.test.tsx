import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { server } from '@/setupTests'
import { useFilaDeSincronizacao } from './useFilaDeSincronizacao'

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
