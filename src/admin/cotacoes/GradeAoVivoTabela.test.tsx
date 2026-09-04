import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { GradeAoVivoTabela } from './GradeAoVivoTabela'
import type { GridAoVivo } from './cotacoes.schema'

const gradeBase: GridAoVivo = {
  status: 'ABERTA',
  respondidos: 1,
  totalParticipantes: 1,
  itens: [
    {
      itemCotacaoId: 'item-1',
      nome: 'Arroz',
      unidade: 'Fardo',
      quantidadePorEmbalagem: 20,
      quantidadeSolicitada: 10,
      ultimoPrecoUnitario: null,
      menorPrecoUnitario: null,
      precos: [
        { participanteId: 'p1', empresaId: 'e1', empresa: 'Atacadão', preco: 100, precoUnitario: 5, status: 'COTADO' },
      ],
    },
  ],
}

function renderGrade(g: GridAoVivo) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <GradeAoVivoTabela cotacaoId="c-1" grade={g} />
    </QueryClientProvider>,
  )
}

test('em ABERTA, a quantidade é editável e o "+" dispara o PATCH', async () => {
  let corpo: unknown
  server.use(
    http.patch('*/api/cotacoes/c-1/itens/:itemId/quantidade', async ({ request }) => {
      corpo = await request.json()
      return new HttpResponse(null, { status: 204 })
    }),
  )

  renderGrade(gradeBase)
  await screen.findByText('Arroz')

  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: /Aumentar quantidade de Arroz/i }))

  await waitFor(() => expect(corpo).toEqual({ quantidade: 11 }))
})

test('em PEDIDOS_GERADOS, a quantidade é somente leitura', () => {
  renderGrade({ ...gradeBase, status: 'PEDIDOS_GERADOS' })

  expect(screen.getByText('qtd 10')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Aumentar quantidade/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('spinbutton', { name: 'Quantidade de Arroz' })).not.toBeInTheDocument()
})

test('em CANCELADA, a quantidade é somente leitura (sem campo digitável)', () => {
  renderGrade({ ...gradeBase, status: 'CANCELADA' })

  expect(screen.getByText('qtd 10')).toBeInTheDocument()
  expect(screen.queryByRole('spinbutton', { name: 'Quantidade de Arroz' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Aumentar quantidade/i })).not.toBeInTheDocument()
})

function patchQuantidadeHandler(capturar: (corpo: unknown) => void) {
  server.use(
    http.patch('*/api/cotacoes/c-1/itens/:itemId/quantidade', async ({ request }) => {
      capturar(await request.json())
      return new HttpResponse(null, { status: 204 })
    }),
  )
}

test('digitar um valor válido e sair do campo dispara o PATCH com o valor digitado', async () => {
  const chamadas: unknown[] = []
  patchQuantidadeHandler((corpo) => chamadas.push(corpo))

  renderGrade(gradeBase)
  await screen.findByText('Arroz')

  const user = userEvent.setup()
  const input = screen.getByRole('spinbutton', { name: 'Quantidade de Arroz' })

  await user.clear(input)
  await user.type(input, '50')
  await user.tab()

  await waitFor(() => expect(chamadas).toEqual([{ quantidade: 50 }]))
})

test('digitar Enter no campo tem o mesmo efeito do blur', async () => {
  const chamadas: unknown[] = []
  patchQuantidadeHandler((corpo) => chamadas.push(corpo))

  renderGrade(gradeBase)
  await screen.findByText('Arroz')

  const user = userEvent.setup()
  const input = screen.getByRole('spinbutton', { name: 'Quantidade de Arroz' })

  await user.clear(input)
  await user.type(input, '50{Enter}')

  await waitFor(() => expect(chamadas).toEqual([{ quantidade: 50 }]))
})

test('valor inválido não dispara o PATCH e o campo volta ao valor anterior', async () => {
  const chamadas: unknown[] = []
  patchQuantidadeHandler((corpo) => chamadas.push(corpo))

  renderGrade(gradeBase)
  await screen.findByText('Arroz')

  const input = screen.getByRole('spinbutton', { name: 'Quantidade de Arroz' })

  for (const invalido of ['', '0', '-1', 'abc']) {
    fireEvent.change(input, { target: { value: invalido } })
    fireEvent.blur(input)
    expect(input).toHaveValue(10)
  }

  expect(chamadas).toEqual([])
})

test('os botões [-] e [+] continuam ajustando em 1 unidade', async () => {
  const chamadas: unknown[] = []
  patchQuantidadeHandler((corpo) => chamadas.push(corpo))

  renderGrade(gradeBase)
  await screen.findByText('Arroz')

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /Aumentar quantidade de Arroz/i }))
  await waitFor(() => expect(chamadas).toEqual([{ quantidade: 11 }]))

  await user.click(screen.getByRole('button', { name: /Diminuir quantidade de Arroz/i }))
  await waitFor(() => expect(chamadas).toEqual([{ quantidade: 11 }, { quantidade: 9 }]))
})

test('célula NAO_COTADO renderiza o estado vazio como badge', () => {
  const gradeNaoCotado: GridAoVivo = {
    ...gradeBase,
    itens: [
      {
        ...gradeBase.itens[0],
        precos: [
          { participanteId: 'p1', empresaId: 'e1', empresa: 'Atacadão', preco: null, precoUnitario: null, status: 'NAO_COTADO' },
        ],
      },
    ],
  }

  renderGrade(gradeNaoCotado)

  const badge = screen.getByText('Não cotou')
  expect(badge).toHaveClass('rounded-full', 'bg-muted')
})

test('célula COTADO mostra preço e unitário na mesma linha, sem "COTADO" nem "MENOR"', () => {
  renderGrade(gradeBase)

  const celula = screen.getByRole('button', { name: /Corrigir lance de Atacadão para Arroz/i })
  expect(celula).toHaveTextContent(/100,00/)
  expect(celula).toHaveTextContent(/5,00/)
  expect(screen.queryByText(/COTADO/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/MENOR/i)).not.toBeInTheDocument()
})

test('célula PENDENTE não renderiza o traço "—" além da pílula', () => {
  const gradePendente: GridAoVivo = {
    ...gradeBase,
    itens: [
      {
        ...gradeBase.itens[0],
        precos: [
          { participanteId: 'p1', empresaId: 'e1', empresa: 'Atacadão', preco: null, precoUnitario: null, status: 'PENDENTE' },
        ],
      },
    ],
  }

  renderGrade(gradePendente)

  const celula = screen.getByRole('button', { name: /Corrigir lance de Atacadão para Arroz/i })
  expect(celula).toHaveTextContent('Pendente')
  expect(celula).not.toHaveTextContent('—')
})

test('célula COTADO menor preço mantém destaque verde sem o texto "MENOR"', () => {
  const gradeMenor: GridAoVivo = {
    ...gradeBase,
    itens: [
      {
        ...gradeBase.itens[0],
        menorPrecoUnitario: 5,
      },
    ],
  }

  renderGrade(gradeMenor)

  const celula = screen.getByRole('button', { name: /Corrigir lance de Atacadão para Arroz/i })
  expect(celula).toHaveClass('bg-success/5')
  expect(screen.queryByText(/MENOR/i)).not.toBeInTheDocument()
})

test('cabeçalho das Empresas e preço padrão alinhados à direita com cartão', () => {
  renderGrade(gradeBase)

  expect(screen.getByRole('columnheader', { name: 'Atacadão' })).toHaveClass('text-right')

  const celula = screen.getByRole('button', { name: /Corrigir lance de Atacadão para Arroz/i })
  expect(celula).toHaveClass('bg-card', 'border-border', 'text-right')
})

test('a grade tem contêiner de rolagem próprio com altura limitada', () => {
  renderGrade(gradeBase)

  const table = screen.getByRole('table')
  const container = table.parentElement

  expect(container).toHaveClass('overflow-x-auto', 'overflow-y-auto')
  expect(container?.className).toMatch(/max-h-\[65vh\]/)
})
