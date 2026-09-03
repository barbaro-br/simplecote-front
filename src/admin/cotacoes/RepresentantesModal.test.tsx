import { render, screen, within } from '@testing-library/react'
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

async function abrirMenu(user: ReturnType<typeof userEvent.setup>, nomeEmpresa: string) {
  const linha = (await screen.findByText(nomeEmpresa)).closest('li')
  if (!linha) throw new Error(`Linha da empresa "${nomeEmpresa}" não encontrada`)
  await user.click(within(linha).getByTitle('Mais opções'))
}

test('VISUALIZOU mostra Finalizar (não Reabrir) e RESPONDIDO mostra Reabrir (não Finalizar)', async () => {
  setup('ABERTA', [
    participante('e1', 'Mercado A', 'VISUALIZOU'),
    participante('e2', 'Mercado B', 'RESPONDIDO'),
  ])
  const user = userEvent.setup()

  await screen.findByText('Visualizou')
  await screen.findByText('Respondido')

  await abrirMenu(user, 'Mercado A')
  expect(screen.getByRole('menuitem', { name: 'Finalizar' })).toBeInTheDocument()
  expect(screen.queryByRole('menuitem', { name: 'Reabrir resposta' })).not.toBeInTheDocument()
  await user.keyboard('{Escape}')

  await abrirMenu(user, 'Mercado B')
  expect(screen.getByRole('menuitem', { name: 'Reabrir resposta' })).toBeInTheDocument()
  expect(screen.queryByRole('menuitem', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('Finalizar chama a mutation e a linha passa a refletir Respondido', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'VISUALIZOU')])
  const user = userEvent.setup()

  await abrirMenu(user, 'Mercado A')
  await user.click(screen.getByRole('menuitem', { name: 'Finalizar' }))

  expect(await screen.findByText('Respondido')).toBeInTheDocument()

  await abrirMenu(user, 'Mercado A')
  expect(screen.getByRole('menuitem', { name: 'Reabrir resposta' })).toBeInTheDocument()
  expect(screen.queryByRole('menuitem', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('em PEDIDOS_GERADOS, participante RESPONDIDO não mostra "Reabrir resposta" no menu', async () => {
  setup('PEDIDOS_GERADOS', [participante('e1', 'Mercado A', 'RESPONDIDO')])
  const user = userEvent.setup()

  expect(await screen.findByText('Respondido')).toBeInTheDocument()

  await abrirMenu(user, 'Mercado A')
  expect(screen.queryByRole('menuitem', { name: 'Reabrir resposta' })).not.toBeInTheDocument()
  expect(screen.queryByRole('menuitem', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('em CANCELADA, participante VISUALIZOU não mostra "Finalizar" no menu', async () => {
  setup('CANCELADA', [participante('e1', 'Mercado A', 'VISUALIZOU')])
  const user = userEvent.setup()

  expect(await screen.findByText('Visualizou')).toBeInTheDocument()

  await abrirMenu(user, 'Mercado A')
  expect(screen.queryByRole('menuitem', { name: 'Finalizar' })).not.toBeInTheDocument()
  expect(screen.queryByRole('menuitem', { name: 'Reabrir resposta' })).not.toBeInTheDocument()
})

test('em ENCERRADA, os itens Finalizar/Reabrir continuam sendo exibidos (sem regressão)', async () => {
  setup('ENCERRADA', [
    participante('e1', 'Mercado A', 'VISUALIZOU'),
    participante('e2', 'Mercado B', 'RESPONDIDO'),
  ])
  const user = userEvent.setup()

  await screen.findByText('Visualizou')
  await screen.findByText('Respondido')

  await abrirMenu(user, 'Mercado A')
  expect(screen.getByRole('menuitem', { name: 'Finalizar' })).toBeInTheDocument()
  expect(screen.queryByRole('menuitem', { name: 'Reabrir resposta' })).not.toBeInTheDocument()
  await user.keyboard('{Escape}')

  await abrirMenu(user, 'Mercado B')
  expect(screen.getByRole('menuitem', { name: 'Reabrir resposta' })).toBeInTheDocument()
  expect(screen.queryByRole('menuitem', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('participante convidado não exibe ações soltas na linha, apenas o menu "⋯"', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'VISUALIZOU')])

  await screen.findByText('Mercado A')

  expect(screen.queryByTitle('Enviar por WhatsApp')).not.toBeInTheDocument()
  expect(screen.queryByTitle('Copiar Link')).not.toBeInTheDocument()
  expect(screen.queryByTitle('Reenviar E-mail')).not.toBeInTheDocument()
  expect(screen.getByTitle('Mais opções')).toBeInTheDocument()
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
