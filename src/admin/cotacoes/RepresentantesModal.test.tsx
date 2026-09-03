import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { RepresentantesModal } from './RepresentantesModal'
import type { ParticipanteDaCotacao } from './cotacoes.schema'

function participante(
  empresaId: string,
  empresaNome: string,
  participanteStatus: ParticipanteDaCotacao['participanteStatus'],
  conviteStatus: ParticipanteDaCotacao['conviteStatus'] = 'ENVIADO',
): ParticipanteDaCotacao {
  return {
    participanteId: `part-${empresaId}`,
    empresaId,
    empresaNome,
    representanteNome: `Rep de ${empresaNome}`,
    whatsappRepresentante: null,
    emailRepresentante: null,
    conviteStatus,
    participanteStatus,
    linkMagico: 'https://exemplo.com/token',
  }
}

function setup(status: string, iniciais: ParticipanteDaCotacao[]) {
  let lista = [...iniciais]
  const empresas = iniciais.map((p) => ({ id: p.empresaId, nome: p.empresaNome, ativo: true }))

  server.use(
    http.get('*/api/empresas', () => HttpResponse.json(empresas)),
    http.get('*/api/representantes', () => HttpResponse.json([])),
    http.get('*/api/cotacoes/c-1/participantes', () => HttpResponse.json(lista)),
    http.post('*/api/participantes/:participanteId/finalizar', ({ params }) => {
      const participanteId = params.participanteId as string
      lista = lista.map((p) =>
        p.participanteId === participanteId
          ? { ...p, participanteStatus: 'RESPONDIDO' as const }
          : p,
      )
      return new HttpResponse(null, { status: 204 })
    }),
    http.post('*/api/participantes/:participanteId/reabrir', ({ params }) => {
      const participanteId = params.participanteId as string
      lista = lista.map((p) =>
        p.participanteId === participanteId
          ? { ...p, participanteStatus: 'VISUALIZOU' as const }
          : p,
      )
      return new HttpResponse(null, { status: 204 })
    }),
  )

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <RepresentantesModal
        cotacaoId="c-1"
        status={status}
        open
        onClose={() => {}}
        selecionadas={[]}
        onToggle={() => {}}
      />
    </QueryClientProvider>,
  )
}

test('VISUALIZOU mostra Finalizar (não Reabrir) e RESPONDIDO mostra Reabrir (não Finalizar)', async () => {
  setup('ABERTA', [
    participante('e1', 'Mercado A', 'VISUALIZOU'),
    participante('e2', 'Mercado B', 'RESPONDIDO'),
  ])

  await screen.findByRole('button', { name: 'Finalizar' })

  expect(screen.getAllByRole('button', { name: 'Finalizar' })).toHaveLength(1)
  expect(screen.getAllByRole('button', { name: 'Reabrir resposta' })).toHaveLength(1)
  expect(screen.getByText('Visualizou')).toBeInTheDocument()
  expect(screen.getByText('Respondido')).toBeInTheDocument()
})

test('Finalizar chama a mutation e a linha passa a refletir Respondido', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'VISUALIZOU')])
  const user = userEvent.setup()

  await user.click(await screen.findByRole('button', { name: 'Finalizar' }))

  await waitFor(() => {
    expect(screen.queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument()
  })
  expect(await screen.findByText('Respondido')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reabrir resposta' })).toBeInTheDocument()
})

test('em PEDIDOS_GERADOS, participante RESPONDIDO não mostra o botão "Reabrir resposta"', async () => {
  setup('PEDIDOS_GERADOS', [participante('e1', 'Mercado A', 'RESPONDIDO')])

  expect(await screen.findByText('Respondido')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Reabrir resposta' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('em CANCELADA, participante VISUALIZOU não mostra o botão "Finalizar"', async () => {
  setup('CANCELADA', [participante('e1', 'Mercado A', 'VISUALIZOU')])

  expect(await screen.findByText('Visualizou')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Reabrir resposta' })).not.toBeInTheDocument()
})

test('em ENCERRADA, os botões Finalizar/Reabrir continuam sendo exibidos (sem regressão)', async () => {
  setup('ENCERRADA', [
    participante('e1', 'Mercado A', 'VISUALIZOU'),
    participante('e2', 'Mercado B', 'RESPONDIDO'),
  ])

  await screen.findByRole('button', { name: 'Finalizar' })

  expect(screen.getAllByRole('button', { name: 'Finalizar' })).toHaveLength(1)
  expect(screen.getAllByRole('button', { name: 'Reabrir resposta' })).toHaveLength(1)
})

test('participante com conviteStatus FALHOU exibe rótulo de erro, distinto do "Não enviado"', async () => {
  setup('ABERTA', [
    participante('e1', 'Mercado A', 'CONVIDADO', 'FALHOU'),
    participante('e2', 'Mercado B', 'CONVIDADO', null),
  ])

  expect(await screen.findByText('Falha no envio')).toBeInTheDocument()
  expect(screen.getByText('Não enviado')).toBeInTheDocument()
  expect(screen.queryByText('Enviado')).not.toBeInTheDocument()
})

test('participante VISUALIZOU com conviteStatus FALHOU não mostra badge de convite', async () => {
  setup('ABERTA', [
    participante('e1', 'Mercado A', 'VISUALIZOU', 'FALHOU'),
  ])

  expect(await screen.findByText('Visualizou')).toBeInTheDocument()
  expect(screen.queryByText('Falha no envio')).not.toBeInTheDocument()
  expect(screen.queryByText('Enviado')).not.toBeInTheDocument()
  expect(screen.queryByText('Não enviado')).not.toBeInTheDocument()
})

test('participante RESPONDIDO com conviteStatus FALHOU não mostra badge de convite', async () => {
  setup('ABERTA', [
    participante('e1', 'Mercado A', 'RESPONDIDO', 'FALHOU'),
  ])

  expect(await screen.findByText('Respondido')).toBeInTheDocument()
  expect(screen.queryByText('Falha no envio')).not.toBeInTheDocument()
  expect(screen.queryByText('Enviado')).not.toBeInTheDocument()
  expect(screen.queryByText('Não enviado')).not.toBeInTheDocument()
})
