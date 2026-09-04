import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { toast } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { RepresentantesModal } from './RepresentantesModal'
import type { ParticipanteDaCotacao } from './cotacoes.schema'
import type { Representante } from '@/admin/representantes/representantes.schema'

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

type EmpresaTeste = { id: string; nome: string; ativo: boolean }

function setup(
  status: string,
  iniciais: ParticipanteDaCotacao[],
  extras: { empresas?: EmpresaTeste[]; representantes?: Representante[] } = {},
) {
  let lista = [...iniciais]
  const empresas = extras.empresas ?? iniciais.map((p) => ({ id: p.empresaId, nome: p.empresaNome, ativo: true }))

  server.use(
    http.get('*/api/empresas', () => HttpResponse.json(empresas)),
    http.get('*/api/representantes', () => HttpResponse.json(extras.representantes ?? [])),
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

test('em PEDIDOS_GERADOS, participante RESPONDIDO não mostra o menu "Mais opções"', async () => {
  setup('PEDIDOS_GERADOS', [participante('e1', 'Mercado A', 'RESPONDIDO')])

  expect(await screen.findByText('Respondido')).toBeInTheDocument()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).queryByTitle('Mais opções')).not.toBeInTheDocument()
})

test('em CANCELADA, participante VISUALIZOU não mostra o menu "Mais opções"', async () => {
  setup('CANCELADA', [participante('e1', 'Mercado A', 'VISUALIZOU')])

  expect(await screen.findByText('Visualizou')).toBeInTheDocument()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).queryByTitle('Mais opções')).not.toBeInTheDocument()
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

test('participante aberto exibe ícones de ação direto na linha (sem WhatsApp quando não há telefone), e o menu "⋯" só com Finalizar/Reabrir', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'VISUALIZOU')])

  const linha = (await screen.findByText('Mercado A')).closest('li')!

  expect(within(linha).queryByTitle('Enviar por WhatsApp')).not.toBeInTheDocument()
  expect(within(linha).getByTitle('Copiar link')).toBeInTheDocument()
  expect(within(linha).getByTitle('Reenviar convite')).toBeInTheDocument()
  expect(within(linha).getByTitle('Mais opções')).toBeInTheDocument()
})

test('participante com WhatsApp cadastrado exibe o ícone de WhatsApp na linha', async () => {
  setup('ABERTA', [
    { ...participante('e1', 'Mercado A', 'CONVIDADO'), whatsappRepresentante: '11987654321' },
  ])

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).getByTitle('Enviar por WhatsApp')).toBeInTheDocument()
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

test('linha com repEmail preenchido renderiza link mailto com o e-mail no href e no title', async () => {
  const empresaId = '11111111-1111-4111-8111-111111111111'
  setup('RASCUNHO', [], {
    empresas: [{ id: empresaId, nome: 'Mercado A', ativo: true }],
    representantes: [
      {
        id: '22222222-2222-4222-8222-222222222222',
        empresaId,
        nome: 'João Representante',
        email: 'joao@empresa.com',
        whatsapp: null,
        ativo: true,
      },
    ],
  })

  const link = await screen.findByTitle('joao@empresa.com')
  expect(link).toHaveAttribute('href', expect.stringContaining('mailto:joao@empresa.com'))
})

test('clicar no indicador de telefone copia o número formatado e mostra toast', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true, writable: true })
  const successSpy = vi.spyOn(toast, 'success')

  const empresaId = '11111111-1111-4111-8111-111111111111'
  setup('RASCUNHO', [], {
    empresas: [{ id: empresaId, nome: 'Mercado A', ativo: true }],
    representantes: [
      {
        id: '22222222-2222-4222-8222-222222222222',
        empresaId,
        nome: 'João Representante',
        email: 'joao@empresa.com',
        whatsapp: '11987654321',
        ativo: true,
      },
    ],
  })
  const botao = await screen.findByTitle('(11) 98765-4321')
  fireEvent.click(botao)

  expect(writeText).toHaveBeenCalledWith('(11) 98765-4321')
  expect(successSpy).toHaveBeenCalledWith('Telefone copiado!')

  successSpy.mockRestore()
})

test('linha sem e-mail/telefone não renderiza os indicadores', async () => {
  const comRep = '11111111-1111-4111-8111-111111111111'
  const semRep = '55555555-5555-4555-8555-555555555555'
  setup('RASCUNHO', [], {
    empresas: [
      { id: comRep, nome: 'Mercado A', ativo: true },
      { id: semRep, nome: 'Mercado B', ativo: true },
    ],
    representantes: [
      {
        id: '22222222-2222-4222-8222-222222222222',
        empresaId: comRep,
        nome: 'João Representante',
        email: 'joao@empresa.com',
        whatsapp: '11987654321',
        ativo: true,
      },
    ],
  })

  await screen.findByTitle('joao@empresa.com')

  const linhaSemRep = (await screen.findByText('Mercado B')).closest('li')
  expect(linhaSemRep).not.toBeNull()
  expect(within(linhaSemRep!).queryByTitle('joao@empresa.com')).not.toBeInTheDocument()
  expect(within(linhaSemRep!).queryByTitle('(11) 98765-4321')).not.toBeInTheDocument()
})
