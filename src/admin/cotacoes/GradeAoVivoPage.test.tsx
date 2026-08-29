import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { GradeAoVivoPage } from './GradeAoVivoPage'

function gradeInicial() {
  return {
    status: 'ABERTA',
    respondidos: 1,
    totalParticipantes: 2,
    itens: [
      {
        itemCotacaoId: 'i1',
        nome: 'Arroz 5kg',
        unidade: 'Fardo',
        quantidadePorEmbalagem: 30,
        quantidadeSolicitada: 10,
        ultimoPrecoUnitario: 4.2,
        ultimaCompraEmpresa: 'Atacado União',
        ultimaCompraEm: '2026-07-01T12:00:00Z',
        menorPrecoUnitario: 4.0,
        precos: [
          { participanteId: 'p1', empresaId: 'e1', empresa: 'Atacado União', preco: 120, precoUnitario: 4.0, status: 'COTADO' },
          { participanteId: 'p2', empresaId: 'e2', empresa: 'Distribuidora Norte', preco: null, precoUnitario: null, status: 'PENDENTE' },
        ],
      },
      {
        itemCotacaoId: 'i2',
        nome: 'Feijão 1kg',
        unidade: 'Fardo',
        quantidadePorEmbalagem: 10,
        quantidadeSolicitada: 5,
        ultimoPrecoUnitario: null,
        ultimaCompraEmpresa: null,
        ultimaCompraEm: null,
        menorPrecoUnitario: null,
        precos: [
          { participanteId: 'p1', empresaId: 'e1', empresa: 'Atacado União', preco: null, precoUnitario: null, status: 'NAO_COTADO' },
          { participanteId: 'p2', empresaId: 'e2', empresa: 'Distribuidora Norte', preco: null, precoUnitario: null, status: 'PENDENTE' },
        ],
      },
    ],
  }
}

function renderPage() {
  const router = createMemoryRouter(
    [{ path: '/admin/cotacoes/:id/ao-vivo', element: <GradeAoVivoPage /> }],
    { initialEntries: ['/admin/cotacoes/c-1/ao-vivo'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

test('2.1/2.2 — cabeçalho, células por status e menor preço destacado', async () => {
  const grade = gradeInicial()
  server.use(http.get('*/api/cotacoes/c-1/ao-vivo', () => HttpResponse.json(grade)))

  renderPage()

  expect(await screen.findByRole('heading', { name: 'Grade ao vivo' })).toBeInTheDocument()
  expect(screen.getByText('1/2 responderam')).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Atacado União' })).toBeInTheDocument()
  expect(screen.getByText('Cotado')).toBeInTheDocument()
  expect(screen.getByText('Não cotou')).toBeInTheDocument()
  expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0)

  const celMenor = screen.getByRole('button', {
    name: 'Corrigir lance de Atacado União para Arroz 5kg',
  })
  expect(celMenor.className).toMatch(/text-success/)
})

test('3.1 — popover de última compra: com dado e sem dado', async () => {
  const grade = gradeInicial()
  server.use(http.get('*/api/cotacoes/c-1/ao-vivo', () => HttpResponse.json(grade)))
  const user = userEvent.setup()

  renderPage()
  await screen.findByRole('heading', { name: 'Grade ao vivo' })

  await user.hover(screen.getByText('Arroz 5kg'))
  const tip = await screen.findByRole('tooltip')
  expect(tip).toHaveTextContent('Última compra')
  expect(tip).toHaveTextContent('Atacado União')
  expect(tip).toHaveTextContent('/un')
  await user.unhover(screen.getByText('Arroz 5kg'))

  await user.hover(screen.getByText('Feijão 1kg'))
  expect(await screen.findByText(/Sem compra anterior/i)).toBeInTheDocument()
})

test('4.1 — corrigir lance pela célula reflete na grade sem esperar o poll', async () => {
  const grade = gradeInicial()
  server.use(
    http.get('*/api/cotacoes/c-1/ao-vivo', () => HttpResponse.json(grade)),
    http.put('*/api/participantes/:pid/lances/:iid', async ({ params, request }) => {
      const body = (await request.json()) as { preco?: number }
      const item = grade.itens.find((i) => i.itemCotacaoId === params.iid)
      const cel = item?.precos.find((c) => c.participanteId === params.pid)
      if (cel && body.preco != null) {
        cel.preco = body.preco
        cel.precoUnitario = body.preco / (item!.quantidadePorEmbalagem || 1)
        cel.status = 'COTADO'
      }
      return new HttpResponse(null, { status: 204 })
    }),
  )
  const user = userEvent.setup()

  renderPage()
  await screen.findByRole('heading', { name: 'Grade ao vivo' })

  await user.click(
    screen.getByRole('button', { name: 'Corrigir lance de Distribuidora Norte para Arroz 5kg' }),
  )
  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Preço da embalagem'), '99')
  await user.click(dialog.getByRole('button', { name: 'Salvar' }))

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

  const celCorrigida = await screen.findByRole('button', {
    name: 'Corrigir lance de Distribuidora Norte para Arroz 5kg',
  })
  expect(within(celCorrigida).getByText('Cotado')).toBeInTheDocument()
})

test('2.3 — polling: revalida a cada 5s em ABERTA e para fora de ABERTA', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  try {
    let fetches = 0
    const estado = { status: 'ABERTA' as string }
    server.use(
      http.get('*/api/cotacoes/c-1/ao-vivo', () => {
        fetches++
        return HttpResponse.json({ status: estado.status, respondidos: 0, totalParticipantes: 1, itens: [] })
      }),
    )

    renderPage()
    await vi.waitFor(() => expect(fetches).toBe(1))

    await vi.advanceTimersByTimeAsync(5000)
    expect(fetches).toBe(2)

    estado.status = 'ENCERRADA'
    await vi.advanceTimersByTimeAsync(5000)
    expect(fetches).toBe(3)

    await vi.advanceTimersByTimeAsync(20000)
    expect(fetches).toBe(3)
  } finally {
    vi.useRealTimers()
  }
})
