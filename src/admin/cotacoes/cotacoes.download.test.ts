import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { baixarArquivo } from '@/shared/api/api-client'

const criarObjectURL = vi.fn(() => 'blob:mock')
const revokeObjectURL = vi.fn()

beforeAll(() => {
  // jsdom não implementa a API de object URL — stub mínimo.
  ;(URL as unknown as { createObjectURL: unknown }).createObjectURL = criarObjectURL
  ;(URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = revokeObjectURL
})

afterAll(() => {
  delete (URL as unknown as { createObjectURL?: unknown }).createObjectURL
  delete (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL
})

test('baixarArquivo resolve quando o backend devolve um Blob e dispara o download', async () => {
  server.use(
    http.get('*/api/cotacoes/abc/resultado.xlsx', () =>
      new HttpResponse(new Blob(['conteudo-xlsx']), {
        headers: { 'Content-Type': 'application/octet-stream' },
      }),
    ),
  )
  const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

  await expect(
    baixarArquivo('/api/cotacoes/abc/resultado.xlsx', 'resultado.xlsx'),
  ).resolves.toBeUndefined()

  expect(criarObjectURL).toHaveBeenCalled()
  expect(clickSpy).toHaveBeenCalled()
  expect(revokeObjectURL).toHaveBeenCalled()

  clickSpy.mockRestore()
})

test('baixarArquivo lança ApiError quando a resposta não é ok', async () => {
  server.use(
    http.get('*/api/pedidos/err/pedido.pdf', () => new HttpResponse(null, { status: 500 })),
  )

  await expect(baixarArquivo('/api/pedidos/err/pedido.pdf', 'p.pdf')).rejects.toThrow(
    /não foi possível baixar/i,
  )
})
