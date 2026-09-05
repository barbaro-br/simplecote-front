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

test('VISUALIZOU mostra "Fechar cotação" (não Reabrir) e RESPONDIDO mostra Reabrir (não "Fechar cotação")', async () => {
  setup('ABERTA', [
    participante('e1', 'Mercado A', 'VISUALIZOU'),
    participante('e2', 'Mercado B', 'RESPONDIDO'),
  ])

  const linhaA = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linhaA).getByRole('button', { name: 'Fechar cotação' })).toBeInTheDocument()
  expect(within(linhaA).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()

  const linhaB = (await screen.findByText('Mercado B')).closest('li')!
  expect(within(linhaB).getByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
  expect(within(linhaB).queryByRole('button', { name: 'Fechar cotação' })).not.toBeInTheDocument()
})

test('VISUALIZOU exibe badge "Enviado" e RESPONDIDO exibe badge "Finalizado"', async () => {
  setup('ABERTA', [
    participante('e1', 'Mercado A', 'VISUALIZOU'),
    participante('e2', 'Mercado B', 'RESPONDIDO'),
  ])

  expect(await screen.findByText('Enviado')).toBeInTheDocument()
  expect(screen.getByText('Finalizado')).toBeInTheDocument()
  expect(screen.queryByText('Visualizou')).not.toBeInTheDocument()
  expect(screen.queryByText('Respondido')).not.toBeInTheDocument()
})

test('"Fechar cotação" chama a mutation e a linha passa a refletir Finalizado', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'VISUALIZOU')])
  const user = userEvent.setup()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(within(linha).getByRole('button', { name: 'Fechar cotação' }))

  expect(await screen.findByText('Finalizado')).toBeInTheDocument()
  expect(within(linha).getByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Fechar cotação' })).not.toBeInTheDocument()
})

test('CONVIDADO com convite enviado mostra "Fechar cotação" e, ao acionar, a linha passa a Finalizado', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')])
  const user = userEvent.setup()

  await screen.findByText('Enviado')
  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).getByRole('button', { name: 'Fechar cotação' })).toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()

  await user.click(within(linha).getByRole('button', { name: 'Fechar cotação' }))
  expect(await screen.findByText('Finalizado')).toBeInTheDocument()

  expect(within(linha).getByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Fechar cotação' })).not.toBeInTheDocument()
})

test('CONVIDADO com convite ainda não enviado exibe badge "Pendente" (neutro, sem falha)', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO', null)])

  const badge = await screen.findByText('Pendente')
  expect(badge).not.toHaveAttribute('title', 'Falha no envio')
  expect(screen.queryByText('Enviado')).not.toBeInTheDocument()
  expect(screen.queryByText('Finalizado')).not.toBeInTheDocument()
})

test('convite com status FALHOU exibe "Pendente" com indicação de falha no envio, distinto do pendente neutro', async () => {
  setup('ABERTA', [
    participante('e1', 'Mercado A', 'CONVIDADO', 'FALHOU'),
    participante('e2', 'Mercado B', 'CONVIDADO', null),
  ])

  expect(await screen.findByTitle('Falha no envio')).toBeInTheDocument()
  expect(screen.getAllByText('Pendente')).toHaveLength(2)
  expect(screen.queryByText('Enviado')).not.toBeInTheDocument()
  expect(screen.queryByText('Finalizado')).not.toBeInTheDocument()
})

test('em PEDIDOS_GERADOS, participante RESPONDIDO não mostra os botões "Reabrir"/"Fechar cotação"', async () => {
  setup('PEDIDOS_GERADOS', [participante('e1', 'Mercado A', 'RESPONDIDO')])

  expect(await screen.findByText('Finalizado')).toBeInTheDocument()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Fechar cotação' })).not.toBeInTheDocument()
})

test('em CANCELADA, participante VISUALIZOU não mostra o botão "Fechar cotação"', async () => {
  setup('CANCELADA', [participante('e1', 'Mercado A', 'VISUALIZOU')])

  expect(await screen.findByText('Enviado')).toBeInTheDocument()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linha).queryByRole('button', { name: 'Fechar cotação' })).not.toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()
})

test('em ENCERRADA, os botões Finalizar/Reabrir continuam sendo exibidos (sem regressão)', async () => {
  setup('ENCERRADA', [
    participante('e1', 'Mercado A', 'VISUALIZOU'),
    participante('e2', 'Mercado B', 'RESPONDIDO'),
  ])

  const linhaA = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linhaA).getByRole('button', { name: 'Fechar cotação' })).toBeInTheDocument()
  expect(within(linhaA).queryByRole('button', { name: 'Reabrir' })).not.toBeInTheDocument()

  const linhaB = (await screen.findByText('Mercado B')).closest('li')!
  expect(within(linhaB).getByRole('button', { name: 'Reabrir' })).toBeInTheDocument()
  expect(within(linhaB).queryByRole('button', { name: 'Fechar cotação' })).not.toBeInTheDocument()
})

test('participante aberto exibe ações na ordem E-mail, WhatsApp e Copiar link (sem WhatsApp quando não há telefone)', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'VISUALIZOU')])

  const linha = (await screen.findByText('Mercado A')).closest('li')!

  expect(within(linha).queryByRole('button', { name: 'Enviar por WhatsApp' })).not.toBeInTheDocument()
  const emailBtn = within(linha).getByRole('button', { name: 'Reenviar convite' })
  const copiarBtn = within(linha).getByRole('button', { name: 'Copiar link' })
  expect(emailBtn.compareDocumentPosition(copiarBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(within(linha).getByRole('button', { name: 'Fechar cotação' })).toBeInTheDocument()
  expect(within(linha).queryByTitle('Mais opções')).not.toBeInTheDocument()
})

test('participante com WhatsApp cadastrado exibe o ícone de WhatsApp entre E-mail e Copiar link', async () => {
  setup('ABERTA', [
    { ...participante('e1', 'Mercado A', 'CONVIDADO'), whatsappRepresentante: '11987654321' },
  ])

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  const emailBtn = within(linha).getByRole('button', { name: 'Reenviar convite' })
  const whatsBtn = within(linha).getByRole('button', { name: 'Enviar por WhatsApp' })
  const copiarBtn = within(linha).getByRole('button', { name: 'Copiar link' })
  expect(emailBtn.compareDocumentPosition(whatsBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(whatsBtn.compareDocumentPosition(copiarBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

test('em RASCUNHO, o checkbox continua sendo toggle de seleção (sem regressão)', async () => {
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

test('em cotação aberta, checkbox desmarcado convida a empresa ao clicar', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')], {
    empresas: [
      { id: 'e1', nome: 'Mercado A', ativo: true },
      { id: 'e2', nome: 'Mercado B', ativo: true },
    ],
  })
  const user = userEvent.setup()

  const linhaB = (await screen.findByText('Mercado B')).closest('li')!
  await user.click(within(linhaB).getByRole('checkbox', { name: 'Convidar Mercado B' }))

  expect(await within(linhaB).findByRole('checkbox', { name: 'Desconvidar Mercado B' })).toBeInTheDocument()
})

test('checkbox marcado abre confirmação; ao confirmar, desconvida e a linha volta a mostrar checkbox de "Convidar"', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')])
  const user = userEvent.setup()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(within(linha).getByRole('checkbox', { name: 'Desconvidar Mercado A' }))

  const tituloDialogo = await screen.findByText('Desconvidar Mercado A?')
  const dialogo = tituloDialogo.closest<HTMLElement>('[role="dialog"]')!
  await user.click(within(dialogo).getByRole('button', { name: 'Desconvidar' }))

  expect(await within(linha).findByRole('checkbox', { name: 'Convidar Mercado A' })).toBeInTheDocument()
  expect(screen.queryByText('Desconvidar Mercado A?')).not.toBeInTheDocument()
})

test('ao cancelar a confirmação, a API não é chamada e a linha permanece convidada', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')])
  const user = userEvent.setup()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(within(linha).getByRole('checkbox', { name: 'Desconvidar Mercado A' }))
  expect(await screen.findByText('Desconvidar Mercado A?')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Voltar' }))

  expect(screen.queryByText('Desconvidar Mercado A?')).not.toBeInTheDocument()
  expect(within(linha).getByRole('checkbox', { name: 'Desconvidar Mercado A' })).toBeInTheDocument()
})

test('participante RESPONDIDO pode ser desconvidado: checkbox abre confirmação e, ao confirmar, a linha volta a "Convidar"', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'RESPONDIDO')])
  const user = userEvent.setup()

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(within(linha).getByRole('checkbox', { name: 'Desconvidar Mercado A' }))

  const tituloDialogo = await screen.findByText('Desconvidar Mercado A?')
  const dialogo = tituloDialogo.closest<HTMLElement>('[role="dialog"]')!
  expect(dialogo).toHaveTextContent('os preços já informados não terão validade nesta cotação')
  await user.click(within(dialogo).getByRole('button', { name: 'Desconvidar' }))

  expect(await within(linha).findByRole('checkbox', { name: 'Convidar Mercado A' })).toBeInTheDocument()
})

test('fora de ABERTA (ex.: ENCERRADA), o checkbox de convidar/desconvidar não aparece e o botão "Convidar" continua como estava', async () => {
  setup('ENCERRADA', [participante('e1', 'Mercado A', 'RESPONDIDO')], {
    empresas: [
      { id: 'e1', nome: 'Mercado A', ativo: true },
      { id: 'e2', nome: 'Mercado B', ativo: true },
    ],
  })

  const linhaA = (await screen.findByText('Mercado A')).closest('li')!
  expect(within(linhaA).queryByRole('checkbox', { name: 'Desconvidar Mercado A' })).not.toBeInTheDocument()
  expect(within(linhaA).queryByRole('checkbox', { name: 'Convidar Mercado A' })).not.toBeInTheDocument()

  const linhaB = (await screen.findByText('Mercado B')).closest('li')!
  expect(within(linhaB).queryByRole('checkbox')).not.toBeInTheDocument()
  expect(within(linhaB).getByRole('button', { name: 'Convidar' })).toBeInTheDocument()
})

test('erro da API ao desconvidar mantém a linha exibindo o participante', async () => {
  setup('ABERTA', [participante('e1', 'Mercado A', 'CONVIDADO')], { desconvidarFalha: true })
  const user = userEvent.setup()
  const errorSpy = vi.spyOn(toast, 'error')

  const linha = (await screen.findByText('Mercado A')).closest('li')!
  await user.click(within(linha).getByRole('checkbox', { name: 'Desconvidar Mercado A' }))

  const tituloDialogo = await screen.findByText('Desconvidar Mercado A?')
  const dialogo = tituloDialogo.closest<HTMLElement>('[role="dialog"]')!
  await user.click(within(dialogo).getByRole('button', { name: 'Desconvidar' }))

  await waitFor(() =>
    expect(errorSpy).toHaveBeenCalledWith('Não é possível desconvidar um representante que já finalizou a resposta.'),
  )
  expect(within(linha).getByRole('checkbox', { name: 'Desconvidar Mercado A' })).toBeInTheDocument()

  errorSpy.mockRestore()
})
