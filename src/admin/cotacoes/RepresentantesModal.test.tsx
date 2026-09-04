import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
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
  extra: Partial<Pick<ParticipanteDaCotacao, 'conviteEnviadoEm' | 'visualizadoEm' | 'respondidoEm'>> = {},
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
    conviteEnviadoEm: null,
    visualizadoEm: null,
    respondidoEm: null,
    ...extra,
  }
}

type EmpresaTeste = { id: string; nome: string; ativo: boolean }

function setup(
  status: string,
  iniciais: ParticipanteDaCotacao[],
  extras: { empresas?: EmpresaTeste[]; representantes?: Representante[]; desconvidarFalha?: boolean } = {},
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
    http.post('*/api/cotacoes/c-1/participantes', async ({ request }) => {
      const { empresaIds } = (await request.json()) as { empresaIds: string[] }
      lista = [
        ...lista,
        ...empresaIds.map((empresaId) => {
          const emp = empresas.find((e) => e.id === empresaId)!
          return participante(empresaId, emp.nome, 'CONVIDADO', null)
        }),
      ]
      return new HttpResponse(null, { status: 204 })
    }),
    http.delete('*/api/participantes/:participanteId', ({ params }) => {
      if (extras.desconvidarFalha) {
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Regra de negócio violada',
            status: 422,
            detail: 'Não é possível desconvidar um representante que já finalizou a resposta.',
          },
          { status: 422 },
        )
      }
      const participanteId = params.participanteId as string
      lista = lista.filter((p) => p.participanteId !== participanteId)
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

  const linhaA = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linhaA).getByRole('button', { name: 'Finalizar' })).toBeInTheDocument()
  expect(within(linhaA).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()

  const linhaB = (await screen.findByText('Mercado B')).closest('li')!
  expect(within(linhaB).getByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
  expect(within(linhaB).queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('Finalizar chama a mutation e a linha passa a refletir Respondido', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'VISUALIZOU')])
  const user = userEvent.setup()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(within(linha).getByRole('button', { name: 'Finalizar' }))

  expect(await screen.findByText('Respondido')).toBeInTheDocument()
  expect(within(linha).getByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('CONVIDADO mostra Finalizar e, ao acionar, a linha passa a mostrar Respondido', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')])
  const user = userEvent.setup()

  await screen.findByText('Enviado')
  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).getByRole('button', { name: 'Finalizar' })).toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()

  await user.click(within(linha).getByRole('button', { name: 'Finalizar' }))
  expect(await screen.findByText('Respondido')).toBeInTheDocument()

  expect(within(linha).getByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('em PEDIDOS_GERADOS, participante RESPONDIDO não mostra o botão "Reabrir"', async () => {
  setup('PEDIDOS_GERADOS', [participante('e1', 'Mercado A', 'RESPONDIDO')])

  expect(await screen.findByText('Respondido')).toBeInTheDocument()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('em CANCELADA, participante VISUALIZOU não mostra o botão "Finalizar"', async () => {
  setup('CANCELADA', [participante('e1', 'Mercado A', 'VISUALIZOU')])

  expect(await screen.findByText('Visualizou')).toBeInTheDocument()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()
})

test('em ENCERRADA, os botões Finalizar/Reabrir continuam sendo exibidos (sem regressão)', async () => {
  setup('ENCERRADA', [
    participante('e1', 'Mercado A', 'VISUALIZOU'),
    participante('e2', 'Mercado B', 'RESPONDIDO'),
  ])

  const linhaA = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linhaA).getByRole('button', { name: 'Finalizar' })).toBeInTheDocument()
  expect(within(linhaA).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()

  const linhaB = (await screen.findByText('Mercado B')).closest('li')!
  expect(within(linhaB).getByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
  expect(within(linhaB).queryByRole('button', { name: 'Finalizar' })).not.toBeInTheDocument()
})

test('participante aberto exibe ícones de ação direto na linha (sem WhatsApp quando não há telefone), e Finalizar/Reabrir como botão visível', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'VISUALIZOU')])

  const linha = (await screen.findByText('Mercado A')).closest('li')!

  expect(within(linha).queryByTitle('Enviar por WhatsApp')).not.toBeInTheDocument()
  expect(within(linha).getByTitle('Copiar link')).toBeInTheDocument()
  expect(within(linha).getByTitle('Reenviar convite')).toBeInTheDocument()
  expect(within(linha).getByRole('button', { name: 'Finalizar' })).toBeInTheDocument()
  expect(within(linha).queryByTitle('Mais opções')).not.toBeInTheDocument()
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

test('em RASCUNHO, o círculo continua sendo toggle de seleção (sem regressão)', async () => {
  const empresaId = '11111111-1111-4111-8111-111111111111'
  const onToggle = vi.fn()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  server.use(
    http.get('*/api/empresas', () => HttpResponse.json([{ id: empresaId, nome: 'Mercado A', ativo: true }])),
    http.get('*/api/representantes', () => HttpResponse.json([])),
    http.get('*/api/cotacoes/c-1/participantes', () => HttpResponse.json([])),
  )
  render(
    <QueryClientProvider client={queryClient}>
      <RepresentantesModal
        cotacaoId="c-1"
        status="RASCUNHO"
        open
        onClose={() => {}}
        selecionadas={[]}
        onToggle={onToggle}
      />
    </QueryClientProvider>,
  )
  const user = userEvent.setup()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(linha)

  expect(onToggle).toHaveBeenCalledWith(empresaId)
})

test('em cotação aberta, círculo desmarcado convida a empresa ao clicar', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')], {
    empresas: [
      { id: 'e1', nome: 'Mercado A', ativo: true },
      { id: 'e2', nome: 'Mercado B', ativo: true },
    ],
  })
  const user = userEvent.setup()

  const linhaB = (await screen.findByText('Mercado B')).closest('li')!
  await user.click(within(linhaB).getByTitle('Convidar'))

  expect(await within(linhaB).findByTitle('Desconvidar')).toBeInTheDocument()
})

test('círculo marcado abre confirmação; ao confirmar, desconvida e a linha volta a mostrar "Convidar"', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')])
  const user = userEvent.setup()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(within(linha).getByTitle('Desconvidar'))

  const tituloDialogo = await screen.findByText('Desconvidar Mercado A?')
  const dialogo = tituloDialogo.closest<HTMLElement>('[role="dialog"]')!
  await user.click(within(dialogo).getByRole('button', { name: 'Desconvidar' }))

  expect(await within(linha).findByTitle('Convidar')).toBeInTheDocument()
  expect(screen.queryByText('Desconvidar Mercado A?')).not.toBeInTheDocument()
})

test('ao cancelar a confirmação, a API não é chamada e a linha permanece convidada', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')])
  const user = userEvent.setup()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(within(linha).getByTitle('Desconvidar'))
  expect(await screen.findByText('Desconvidar Mercado A?')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Voltar' }))

  expect(screen.queryByText('Desconvidar Mercado A?')).not.toBeInTheDocument()
  expect(within(linha).getByTitle('Desconvidar')).toBeInTheDocument()
})

test('fora de ABERTA (ex.: ENCERRADA), o círculo de convidar/desconvidar não aparece e o botão "Convidar" continua como estava', async () => {
  setup('ENCERRADA', [participante('e1', 'Mercado A', 'RESPONDIDO')], {
    empresas: [
      { id: 'e1', nome: 'Mercado A', ativo: true },
      { id: 'e2', nome: 'Mercado B', ativo: true },
    ],
  })

  const linhaA = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linhaA).queryByTitle('Desconvidar')).not.toBeInTheDocument()
  expect(within(linhaA).queryByTitle('Convidar')).not.toBeInTheDocument()

  const linhaB = (await screen.findByText('Mercado B')).closest('li')!
  expect(within(linhaB).queryByTitle('Convidar')).not.toBeInTheDocument()
  expect(within(linhaB).getByRole('button', { name: 'Convidar' })).toBeInTheDocument()
})

test('participante RESPONDIDO não expõe o círculo como clicável (não é possível desconvidar)', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'RESPONDIDO')])

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).queryByTitle('Desconvidar')).not.toBeInTheDocument()
  expect(within(linha).queryByTitle('Convidar')).not.toBeInTheDocument()
})

test('erro da API ao desconvidar mantém a linha exibindo o participante', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')], { desconvidarFalha: true })
  const user = userEvent.setup()
  const errorSpy = vi.spyOn(toast, 'error')

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(within(linha).getByTitle('Desconvidar'))

  const tituloDialogo = await screen.findByText('Desconvidar Mercado A?')
  const dialogo = tituloDialogo.closest<HTMLElement>('[role="dialog"]')!
  await user.click(within(dialogo).getByRole('button', { name: 'Desconvidar' }))

  await waitFor(() =>
    expect(errorSpy).toHaveBeenCalledWith('Não é possível desconvidar um representante que já finalizou a resposta.'),
  )
  expect(within(linha).getByTitle('Desconvidar')).toBeInTheDocument()

  errorSpy.mockRestore()
})
