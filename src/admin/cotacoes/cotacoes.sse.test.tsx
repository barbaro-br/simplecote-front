import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, expect, test, afterEach } from 'vitest'
import { toast } from 'sonner'
import { useGradeAoVivoSSE } from './cotacoes.api'

// O setupTests.ts já define um `EventSource` mock global (no-op). Aqui espião o
// `addEventListener` do protótipo para capturar e disparar o listener registrado
// pelo hook — sem precisar redefinir a global (que é não-configurável).
afterEach(() => {
  vi.restoreAllMocks()
})

function wrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

test('ItemAdicionado via SSE dispara toast de feedback no admin', () => {
  const successSpy = vi.spyOn(toast, 'success')
  const addEventListenerSpy = vi.spyOn(EventSource.prototype, 'addEventListener')
  const queryClient = new QueryClient()

  renderHook(() => useGradeAoVivoSSE('c-1', 'ABERTA'), {
    wrapper: wrapper(queryClient),
  })

  const itemCall = addEventListenerSpy.mock.calls.find(([name]) => name === 'ItemAdicionado')
  expect(itemCall).toBeDefined()
  ;(itemCall![1] as () => void)()

  expect(successSpy).toHaveBeenCalledTimes(1)
  expect(successSpy).toHaveBeenCalledWith('Colaborador adicionou um item à cotação.')
})

test('não registra listener SSE quando a cotação não está ABERTA', () => {
  const addEventListenerSpy = vi.spyOn(EventSource.prototype, 'addEventListener')
  const queryClient = new QueryClient()

  renderHook(() => useGradeAoVivoSSE('c-1', 'ENCERRADA'), {
    wrapper: wrapper(queryClient),
  })

  expect(addEventListenerSpy).not.toHaveBeenCalled()
})
