import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { ParticipantesSection } from './ParticipantesSection'

const EMPRESAS = [
  { id: 'e-1', nome: 'Atacadão Central', ativo: true },
  { id: 'e-2', nome: 'Distribuidora Sul', ativo: true },
]

function participante(empresaId: string, empresaNome: string) {
  return {
    participanteId: `p-${empresaId}`,
    empresaId,
    empresaNome,
    representanteNome: `Rep ${empresaNome}`,
    conviteStatus: null,
    participanteStatus: 'CONVIDADO',
    linkMagico: `http://localhost:8080/cotacao/tok-${empresaId}`,
  }
}

function setup(opts: { convidarStatus?: number } = {}) {
  const lista: ReturnType<typeof participante>[] = []
  server.use(
    http.get('*/api/empresas', () => HttpResponse.json(EMPRESAS)),
    http.get('*/api/cotacoes/c-1/participantes', () => HttpResponse.json(lista)),
    http.post('*/api/cotacoes/c-1/participantes', async ({ request }) => {
      if (opts.convidarStatus && opts.convidarStatus >= 400) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Erro', status: opts.convidarStatus, detail: 'Empresa sem representante ativo.' },
          { status: opts.convidarStatus },
        )
      }
      const body = (await request.json()) as { empresaIds: string[] }
      body.empresaIds.forEach((id) => {
        const e = EMPRESAS.find((x) => x.id === id)!
        lista.push(participante(id, e.nome))
      })
      return HttpResponse.json(lista.map((p) => ({ id: p.participanteId, representanteId: 'r', status: 'CONVIDADO', linkMagico: p.linkMagico })), { status: 201 })
    }),
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <ParticipantesSection cotacaoId="c-1" titulo="Cotação 1" prazo="2026-08-30T10:00:00Z" podeConvidar />
    </QueryClientProvider>,
  )
}

test('convidar 2 empresas adiciona 2 participantes à lista e exibe botões', async () => {
  setup()
  const user = userEvent.setup()

  await user.click(await screen.findByLabelText('Atacadão Central'))
  await user.click(screen.getByLabelText('Distribuidora Sul'))
  await user.click(screen.getByRole('button', { name: /convidar selecionadas/i }))

  const tabela = await screen.findByRole('table')
  await waitFor(() => {
    expect(within(tabela).getByText('Atacadão Central')).toBeInTheDocument()
    expect(within(tabela).getByText('Distribuidora Sul')).toBeInTheDocument()
  })

  // verifica botões
  const wppButtons = await screen.findAllByRole('button', { name: /enviar por whatsapp/i })
  expect(wppButtons).toHaveLength(2)

  const mailButtons = await screen.findAllByRole('button', { name: /enviar por e-mail/i })
  expect(mailButtons).toHaveLength(2)

  const menuButtons = await screen.findAllByRole('button', { name: /mais opções/i })
  expect(menuButtons).toHaveLength(2)
})

test('erro ProblemDetail no convite é exibido sem alterar a lista', async () => {
  setup({ convidarStatus: 422 })
  const user = userEvent.setup()

  await user.click(await screen.findByLabelText('Atacadão Central'))
  await user.click(screen.getByRole('button', { name: /convidar selecionadas/i }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Empresa sem representante ativo.')
  expect(screen.getByText('Nenhuma empresa convidada.')).toBeInTheDocument()
})
