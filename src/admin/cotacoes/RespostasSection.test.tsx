import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { RespostasSection } from './RespostasSection'

function setup() {
  const celula = {
    participanteId: 'part-1',
    empresaId: 'e-1',
    empresa: 'Atacadão Central',
    preco: null as number | null,
    precoUnitario: null as number | null,
    status: 'PENDENTE' as 'PENDENTE' | 'COTADO' | 'NAO_COTADO',
  }
  const grid = {
    status: 'ABERTA',
    respondidos: 1,
    totalParticipantes: 1,
    itens: [
      {
        itemCotacaoId: 'i-1',
        nome: 'Arroz Tipo 1 5kg',
        unidade: 'Fardo',
        quantidadePorEmbalagem: 1,
        quantidadeSolicitada: 10,
        ultimoPrecoUnitario: null,
        menorPrecoUnitario: null,
        precos: [celula],
      },
    ],
  }
  const chamadas: Record<string, number> = {}

  server.use(
    http.get('*/api/cotacoes/c-1/ao-vivo', () => HttpResponse.json(grid)),
    http.get('*/api/cotacoes/c-1/participantes', () =>
      HttpResponse.json([
        {
          participanteId: 'part-1',
          empresaId: 'e-1',
          empresaNome: 'Atacadão Central',
          representanteNome: 'Francisco',
          conviteStatus: 'ENVIADO',
          participanteStatus: 'RESPONDIDO',
          linkMagico: 'http://localhost:8080/cotacao/tok',
        },
      ]),
    ),
    http.put('*/api/participantes/part-1/lances/i-1', async ({ request }) => {
      const body = (await request.json()) as { preco?: number; naoCotado?: boolean }
      chamadas.corrigir = (chamadas.corrigir ?? 0) + 1
      if (body.naoCotado) {
        celula.status = 'NAO_COTADO'
        celula.preco = null
      } else {
        celula.status = 'COTADO'
        celula.preco = body.preco ?? null
        celula.precoUnitario = body.preco ?? null
      }
      return new HttpResponse(null, { status: 204 })
    }),
    http.post('*/api/participantes/part-1/reabrir', () => {
      chamadas.reabrir = (chamadas.reabrir ?? 0) + 1
      return new HttpResponse(null, { status: 204 })
    }),
  )

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RespostasSection cotacaoId="c-1" />
    </QueryClientProvider>,
  )
  return { chamadas }
}

test('corrigir um lance reflete o novo valor após invalidate', async () => {
  setup()
  const user = userEvent.setup()

  // célula começa pendente ("—")
  const celulaBtn = await screen.findByRole('button', { name: '—' })
  await user.click(celulaBtn)

  await user.type(screen.getByLabelText('Preço da embalagem'), '42')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /42,00/ })).toBeInTheDocument()
  })
})

test('"Reabrir resposta" aparece para participante RESPONDIDO e chama a API', async () => {
  const { chamadas } = setup()
  const user = userEvent.setup()

  const btn = await screen.findByRole('button', { name: /reabrir resposta/i })
  await user.click(btn)

  await waitFor(() => expect(chamadas.reabrir).toBe(1))
})
