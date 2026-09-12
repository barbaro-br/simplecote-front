import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { Toaster } from 'sonner'
import { server } from '@/setupTests'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { useAuth } from '@/shared/auth/useAuth'
import { BackofficeGuard } from './BackofficeGuard'
import { CompradoresPage } from './CompradoresPage'
import { CompradorDetalhePage } from './CompradorDetalhePage'
import { ModoSuporteBanner } from './ModoSuporteBanner'
import { ResumoPage } from './ResumoPage'
import { AvisosPage } from './AvisosPage'
import { CatalogoGlobalPage } from './CatalogoGlobalPage'

function jwt(claims: Record<string, unknown>): string {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

const TOKEN_SUPER_ADMIN = jwt({ papel: 'SUPER_ADMIN' })
const TOKEN_ADMIN = jwt({ papel: 'ADMIN', compradorId: 'c1', slug: 'loja' })
const TOKEN_SUPORTE = jwt({ papel: 'ADMIN', compradorId: 'c1', impersonatedBy: 'sa-1' })

const C1 = '11111111-1111-4111-8111-111111111111'
const ADMIN_1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

const DETALHE = {
  id: C1,
  nome: 'Mercado do Zé',
  slug: 'mercado-do-ze',
  statusAssinatura: 'TESTE',
  criadoEm: '2026-09-01T10:00:00Z',
  ultimoAcessoEm: null,
  trialExpiraEm: null,
  cotacoes: 3,
  usuarios: 2,
  representantes: 5,
  suspenso: false,
  valorTotalComprado: 1250.75,
  cotacoesPorStatus: { ABERTA: 1, ENCERRADA: 2 },
  primeiraCotacaoEm: '2026-09-01T10:00:00Z',
  ultimaAtividadeEm: '2026-09-05T10:00:00Z',
  admins: [
    { id: ADMIN_1, nome: 'Dono', email: 'dono@x.com', papel: 'OWNER', emailVerificado: false },
  ],
}

const COTACAO_1 = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001'
const COTACAO_2 = 'aaaaaaaa-aaaa-4aaa-8aaa-000000000002'
const NOTA_1 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const SA_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
const AVISO_1 = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'

const RESUMO = {
  lojas: { total: 12, emTeste: 5, prazoVencido: 2, suspensas: 1 },
  lojasAtivas30d: 8,
  cotacoesNoMes: 34,
  gmvTotal: 150000,
  cadastros30d: [
    { data: '2026-08-01', qtd: 1 },
    { data: '2026-08-02', qtd: 0 },
    { data: '2026-08-03', qtd: 3 },
  ],
  funil: { cadastraram: 20, verificaram: 15, criaramCotacao: 10, apuraram: 6 },
}

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

// jsdom não implementa a API de object URL — stub mínimo para o fluxo de
// download do relatório CSV.
beforeAll(() => {
  ;(URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => 'blob:mock')
  ;(URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn()
})

afterAll(() => {
  delete (URL as unknown as { createObjectURL?: unknown }).createObjectURL
  delete (URL as unknown as { revokeObjectURL?: unknown }).revokeObjectURL
})

function renderGuard(token: string | null) {
  server.use(
    http.post('*/api/auth/refresh', () =>
      token ? HttpResponse.json({ token }) : new HttpResponse(null, { status: 401 })
    )
  )
  const router = createMemoryRouter(
    [
      {
        path: '/backoffice',
        element: <BackofficeGuard />,
        children: [{ index: true, element: <div>lista view</div> }],
      },
    ],
    { initialEntries: ['/backoffice'] }
  )
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('BackofficeGuard', () => {
  test('ADMIN (sem SUPER_ADMIN) vê não encontrado', async () => {
    renderGuard(TOKEN_ADMIN)

    expect(await screen.findByText('Página não encontrada')).toBeInTheDocument()
    expect(screen.queryByText('lista view')).not.toBeInTheDocument()
  })

  test('SUPER_ADMIN acessa o backoffice', async () => {
    renderGuard(TOKEN_SUPER_ADMIN)

    expect(await screen.findByText('lista view')).toBeInTheDocument()
  })
})

describe('CompradoresPage', () => {
  function renderLista() {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: TOKEN_SUPER_ADMIN })))
    const router = createMemoryRouter([{ path: '/backoffice/lojas', element: <CompradoresPage /> }], {
      initialEntries: ['/backoffice/lojas'],
    })
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  test('lista compradores com status e uso', async () => {
    server.use(
      http.get('*/api/admin/compradores', () =>
        HttpResponse.json([
          { ...DETALHE, statusAssinatura: 'INADIMPLENTE', cotacoes: 12, usuarios: 3, representantes: 20 },
        ])
      )
    )
    renderLista()

    expect(await screen.findByText('Mercado do Zé')).toBeInTheDocument()
    expect(screen.getAllByText('Inadimplente').length).toBeGreaterThan(0)
  })

  test('filtro por status e busca chamam a API com os params', async () => {
    let url = ''
    server.use(
      http.get('*/api/admin/compradores', ({ request }) => {
        url = request.url
        return HttpResponse.json([])
      })
    )
    const user = userEvent.setup()
    renderLista()

    await screen.findByText('Nenhum comprador encontrado.')

    await user.selectOptions(screen.getByLabelText('Filtrar por status'), 'INADIMPLENTE')
    await waitFor(() => expect(url).toContain('status=INADIMPLENTE'))

    await user.type(screen.getByLabelText('Buscar por nome ou e-mail'), 'dono@x.com')
    await waitFor(() => expect(url).toContain('busca='))
  })

  test('lista mostra a coluna Comprado com o valor de cada loja', async () => {
    server.use(
      http.get('*/api/admin/compradores', () =>
        HttpResponse.json([
          { ...DETALHE, nome: 'Mercado do Zé', valorTotalComprado: 1250.75 },
          {
            ...DETALHE,
            id: '22222222-2222-4222-8222-222222222222',
            nome: 'Mercado da Maria',
            slug: 'mercado-da-maria',
            valorTotalComprado: 3200,
          },
        ])
      )
    )
    renderLista()

    expect(await screen.findByText('Mercado do Zé')).toBeInTheDocument()
    expect(screen.getByText('Mercado da Maria')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.250,75')).toBeInTheDocument()
    expect(screen.getByText('R$ 3.200,00')).toBeInTheDocument()
  })

  test('lista mostra badge de prazo vencido para loja com trialExpiraEm no passado', async () => {
    server.use(
      http.get('*/api/admin/compradores', () =>
        HttpResponse.json([
          { ...DETALHE, trialExpiraEm: '2020-01-01T00:00:00Z' },
          { ...DETALHE, id: '22222222-2222-4222-8222-222222222222', nome: 'Mercado da Maria', slug: 'mercado-da-maria' },
        ])
      )
    )
    renderLista()

    expect(await screen.findByText(/Expirou há/)).toBeInTheDocument()
    expect(screen.getByText('Sem prazo')).toBeInTheDocument()
  })
})

describe('ResumoPage', () => {
  function renderResumo() {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: TOKEN_SUPER_ADMIN })))
    server.use(http.get('*/api/admin/resumo', () => HttpResponse.json(RESUMO)))
    server.use(
      http.get('*/api/admin/catalogo-global/metricas', () =>
        HttpResponse.json({ totalProdutos: 0, totalReaproveitamentos: 0, compradoresQueReaproveitaram: 0, naoRevisados: 0 }),
      ),
    )
    const router = createMemoryRouter(
      [
        { path: '/backoffice', element: <ResumoPage /> },
        { path: '/backoffice/lojas', element: <div>lista de lojas view</div> },
      ],
      { initialEntries: ['/backoffice'] }
    )
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  test('dashboard mostra os KPIs do resumo e o funil', async () => {
    renderResumo()

    expect(await screen.findByText('R$ 150.000,00')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('Cadastraram')).toBeInTheDocument()
    expect(screen.getByText('Verificaram e-mail')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  test('o link "Ver todas as lojas" leva a /backoffice/lojas', async () => {
    const user = userEvent.setup()
    renderResumo()

    await screen.findByText('R$ 150.000,00')
    await user.click(screen.getByRole('link', { name: /Ver todas as lojas/ }))

    expect(await screen.findByText('lista de lojas view')).toBeInTheDocument()
  })
})

describe('AvisosPage', () => {
  function renderAvisos(avisos: unknown[] = []) {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: TOKEN_SUPER_ADMIN })))
    server.use(http.get('*/api/admin/avisos', () => HttpResponse.json(avisos)))
    const router = createMemoryRouter([{ path: '/backoffice/avisos', element: <AvisosPage /> }], {
      initialEntries: ['/backoffice/avisos'],
    })
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  test('criar aviso chama POST /api/admin/avisos e ele aparece na lista', async () => {
    const avisos: Array<Record<string, unknown>> = []
    let corpo: Record<string, unknown> | null = null
    server.use(
      http.post('*/api/admin/avisos', async ({ request }) => {
        corpo = (await request.json()) as Record<string, unknown>
        avisos.push({
          id: AVISO_1,
          titulo: corpo.titulo,
          corpo: corpo.corpo,
          nivel: corpo.nivel,
          publicadoEm: '2026-09-08T10:00:00Z',
          expiraEm: corpo.expiraEm,
          ativo: true,
          criadoPor: SA_ID,
        })
        return new HttpResponse(null, { status: 201 })
      })
    )
    const user = userEvent.setup()
    renderAvisos(avisos)

    await screen.findByText('Novo aviso')
    await user.type(screen.getByLabelText('Título'), 'Manutenção programada')
    await user.type(screen.getByLabelText('Corpo'), 'Painel fora do ar de madrugada')
    await user.click(screen.getByRole('button', { name: 'Criar aviso' }))

    await waitFor(() => expect(corpo).not.toBeNull())
    expect(corpo!.titulo).toBe('Manutenção programada')
    expect(await screen.findByText('Manutenção programada')).toBeInTheDocument()
  })

  test('toggle ativo chama PATCH /api/admin/avisos/{id}', async () => {
    let corpo: { ativo: boolean } | null = null
    server.use(
      http.patch('*/api/admin/avisos/:id', async ({ request }) => {
        corpo = (await request.json()) as { ativo: boolean }
        return new HttpResponse(null, { status: 204 })
      })
    )
    renderAvisos([
      {
        id: AVISO_1,
        titulo: 'Aviso teste',
        corpo: 'Corpo',
        nivel: 'INFO',
        publicadoEm: '2026-09-08T10:00:00Z',
        expiraEm: null,
        ativo: true,
        criadoPor: SA_ID,
      },
    ])
    const user = userEvent.setup()

    await screen.findByText('Aviso teste')
    await user.click(screen.getByRole('checkbox', { name: 'Ativo' }))

    await waitFor(() => expect(corpo).toEqual({ ativo: false }))
  })

  test('remover chama DELETE /api/admin/avisos/{id} após confirmação', async () => {
    let deletou: string | null = null
    server.use(
      http.delete('*/api/admin/avisos/:id', ({ params }) => {
        deletou = params.id as string
        return new HttpResponse(null, { status: 204 })
      })
    )
    renderAvisos([
      {
        id: AVISO_1,
        titulo: 'Aviso teste',
        corpo: 'Corpo',
        nivel: 'INFO',
        publicadoEm: '2026-09-08T10:00:00Z',
        expiraEm: null,
        ativo: true,
        criadoPor: SA_ID,
      },
    ])
    const user = userEvent.setup()

    await screen.findByText('Aviso teste')
    await user.click(screen.getByRole('button', { name: 'Remover' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção' }))

    await waitFor(() => expect(deletou).toBe(AVISO_1))
  })
})

describe('CatalogoGlobalPage', () => {
  const ITEM_1 = {
    id: 'eeeeeeee-eeee-4eee-8eee-000000000001',
    codigoBarras: '7891000000001',
    nome: 'Arroz 5kg',
    marca: null,
    revisado: false,
    criadoEm: '2026-09-10T10:00:00Z',
  }
  const METRICAS = { totalProdutos: 71582, totalReaproveitamentos: 40, compradoresQueReaproveitaram: 5, naoRevisados: 3 }

  function renderCatalogoGlobal(itens: unknown[] = [ITEM_1]) {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: TOKEN_SUPER_ADMIN })))
    server.use(http.get('*/api/admin/catalogo-global/metricas', () => HttpResponse.json(METRICAS)))
    server.use(
      http.get('*/api/admin/catalogo-global', () =>
        HttpResponse.json({ itens, total: itens.length, pagina: 0, tamanhoPagina: 30 }),
      ),
    )
    const router = createMemoryRouter([{ path: '/backoffice/catalogo-global', element: <CatalogoGlobalPage /> }], {
      initialEntries: ['/backoffice/catalogo-global'],
    })
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>,
    )
  }

  test('mostra as métricas e a lista de itens', async () => {
    renderCatalogoGlobal()

    expect(await screen.findByText('71.582')).toBeInTheDocument()
    expect(screen.getByText('Arroz 5kg')).toBeInTheDocument()
    expect(screen.getByText('7891000000001')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marcar revisado' })).toBeInTheDocument()
  })

  test('editar corrige nome e marca via PUT', async () => {
    let corpo: { nome: string; marca: string | null } | null = null
    server.use(
      http.put('*/api/admin/catalogo-global/:id', async ({ request }) => {
        corpo = (await request.json()) as typeof corpo
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderCatalogoGlobal()
    await screen.findByText('Arroz 5kg')

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const nomeInput = screen.getByDisplayValue('Arroz 5kg')
    await user.clear(nomeInput)
    await user.type(nomeInput, 'Arroz 5kg Corrigido')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(corpo).toEqual({ nome: 'Arroz 5kg Corrigido', marca: null }))
  })

  test('marcar revisado chama POST /revisar', async () => {
    let chamado = false
    server.use(
      http.post('*/api/admin/catalogo-global/:id/revisar', () => {
        chamado = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderCatalogoGlobal()
    await screen.findByText('Arroz 5kg')

    await user.click(screen.getByRole('button', { name: 'Marcar revisado' }))

    await waitFor(() => expect(chamado).toBe(true))
  })

  test('item já revisado mostra o selo em vez do botão', async () => {
    renderCatalogoGlobal([{ ...ITEM_1, revisado: true }])

    expect(await screen.findByText('Revisado')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar revisado' })).not.toBeInTheDocument()
  })

  test('busca envia o termo pra API', async () => {
    const user = userEvent.setup()
    renderCatalogoGlobal()
    await screen.findByText('Arroz 5kg')

    // Depois de renderCatalogoGlobal (que já registra um default) — server.use
    // mais recente vence, então essa sobreposição precisa vir por último.
    let termoRecebido: string | null = null
    server.use(
      http.get('*/api/admin/catalogo-global', ({ request }) => {
        termoRecebido = new URL(request.url).searchParams.get('q')
        return HttpResponse.json({ itens: [], total: 0, pagina: 0, tamanhoPagina: 30 })
      }),
    )

    await user.type(screen.getByPlaceholderText(/Buscar por nome ou código/i), 'coco')

    await waitFor(() => expect(termoRecebido).toBe('coco'))
  })
})

describe('CompradorDetalhePage', () => {
  function renderDetalhe(
    cotacoes: unknown[] = [],
    detalhe: Record<string, unknown> = DETALHE,
    notas: unknown[] = [],
    timeline: unknown[] = [],
  ) {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: TOKEN_SUPER_ADMIN })))
    server.use(http.get('*/api/admin/compradores/:id', () => HttpResponse.json(detalhe)))
    server.use(http.get('*/api/admin/compradores/:id/cotacoes', () => HttpResponse.json(cotacoes)))
    server.use(http.get('*/api/admin/compradores/:id/notas', () => HttpResponse.json(notas)))
    server.use(http.get('*/api/admin/compradores/:id/timeline', () => HttpResponse.json(timeline)))
    const router = createMemoryRouter(
      [
        { path: '/backoffice/lojas', element: <div>backoffice lista view</div> },
        { path: '/backoffice/compradores/:id', element: <CompradorDetalhePage /> },
      ],
      { initialEntries: [`/backoffice/compradores/${C1}`] }
    )
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <Toaster />
      </QueryClientProvider>
    )
  }

  test('suspender chama a API após confirmação', async () => {
    let chamou = false
    server.use(
      http.post('*/api/admin/compradores/:id/suspender', ({ params }) => {
        chamou = true
        expect(params.id).toBe(C1)
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Suspender' }))
    const dialog = within(await screen.findByRole('dialog'))
    await user.click(dialog.getByRole('button', { name: 'Suspender' }))

    expect(chamou).toBe(true)
  })

  test('resetar senha de admin chama a API com o usuarioId e confirma por e-mail', async () => {
    let corpo: unknown
    server.use(
      http.post('*/api/admin/compradores/:id/resetar-senha-admin', async ({ request }) => {
        corpo = await request.json()
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Resetar senha' }))
    await user.click(screen.getByRole('button', { name: 'Enviar recuperação' }))

    expect(corpo).toEqual({ usuarioId: ADMIN_1 })
  })

  test('erro do backend aparece na tela', async () => {
    server.use(
      http.post('*/api/admin/compradores/:id/suspender', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Não processável', status: 422, detail: 'Conta já suspensa.' },
          { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
        )
      )
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Suspender' }))
    const dialog = within(await screen.findByRole('dialog'))
    await user.click(dialog.getByRole('button', { name: 'Suspender' }))

    expect(await screen.findByText('Conta já suspensa.')).toBeInTheDocument()
  })

  test('excluir loja: botão fica desabilitado até digitar o slug exato', async () => {
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Excluir loja permanentemente' }))

    const dialog = within(await screen.findByRole('dialog'))
    const confirmar = dialog.getByRole('button', { name: 'Excluir definitivamente' })
    expect(confirmar).toBeDisabled()

    await user.type(dialog.getByLabelText(/Digite/i), 'slug-errado')
    expect(confirmar).toBeDisabled()

    await user.clear(dialog.getByLabelText(/Digite/i))
    await user.type(dialog.getByLabelText(/Digite/i), 'mercado-do-ze')
    expect(confirmar).not.toBeDisabled()
  })

  test('excluir loja com slug exato chama a API e navega para a lista', async () => {
    let chamou = false
    server.use(
      http.post('*/api/admin/compradores/:id/excluir', ({ params }) => {
        chamou = true
        expect(params.id).toBe(C1)
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Excluir loja permanentemente' }))

    const dialog = within(await screen.findByRole('dialog'))
    await user.type(dialog.getByLabelText(/Digite/i), 'mercado-do-ze')
    await user.click(dialog.getByRole('button', { name: 'Excluir definitivamente' }))

    expect(chamou).toBe(true)
    expect(await screen.findByText('backoffice lista view')).toBeInTheDocument()
  })

  test('erro do backend na exclusão aparece na tela', async () => {
    server.use(
      http.post('*/api/admin/compradores/:id/excluir', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Não processável', status: 422, detail: 'Loja com assinatura ativa não pode ser excluída.' },
          { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
        )
      )
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Excluir loja permanentemente' }))

    const dialog = within(await screen.findByRole('dialog'))
    await user.type(dialog.getByLabelText(/Digite/i), 'mercado-do-ze')
    await user.click(dialog.getByRole('button', { name: 'Excluir definitivamente' }))

    expect(
      await screen.findByText('Loja com assinatura ativa não pode ser excluída.')
    ).toBeInTheDocument()
  })

  test('mostra o valor total comprado e a tabela de cotações da loja', async () => {
    renderDetalhe([
      {
        id: COTACAO_1,
        titulo: 'Café',
        status: 'ENCERRADA',
        criadoEm: '2026-09-02T10:00:00Z',
        encerradoEm: '2026-09-03T10:00:00Z',
        qtdItens: 3,
        qtdParticipantes: 2,
        valorComprado: 500,
      },
      {
        id: COTACAO_2,
        titulo: 'Arroz',
        status: 'ABERTA',
        criadoEm: '2026-09-04T10:00:00Z',
        encerradoEm: null,
        qtdItens: 5,
        qtdParticipantes: 4,
        valorComprado: 750.75,
      },
    ])

    await screen.findByText('Mercado do Zé')
    expect(await screen.findByText('R$ 1.250,75')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cotações' })).toBeInTheDocument()
    expect(screen.getByText('Café')).toBeInTheDocument()
    expect(screen.getByText('Arroz')).toBeInTheDocument()
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 750,75')).toBeInTheDocument()
    expect(screen.getAllByText('Encerrada').length).toBeGreaterThan(0)
    expect(screen.getByText('Aberta')).toBeInTheDocument()
  })

  test('Baixar relatório (CSV) chama a URL de relatório da loja', async () => {
    let urlRelatorio = ''
    server.use(
      http.get('*/api/admin/compradores/:id/relatorio', ({ request }) => {
        urlRelatorio = request.url
        return new HttpResponse(new Blob(['csv']), { headers: { 'Content-Type': 'text/csv' } })
      })
    )
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Baixar relatório (CSV)' }))

    await waitFor(() => expect(urlRelatorio).toContain(`/api/admin/compradores/${C1}/relatorio`))
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  test('+30 dias chama POST prazo com data ~30 dias à frente', async () => {
    let corpo: { expiraEm: string | null } | null = null
    server.use(
      http.post('*/api/admin/compradores/:id/prazo', async ({ request }) => {
        corpo = (await request.json()) as { expiraEm: string | null }
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: '+30 dias' }))

    await waitFor(() => expect(corpo).not.toBeNull())
    const expiraMs = new Date(corpo!.expiraEm as string).getTime()
    const esperadoMs = Date.now() + 30 * 24 * 60 * 60 * 1000
    expect(Math.abs(expiraMs - esperadoMs)).toBeLessThan(60_000)
  })

  test('remover prazo manda expiraEm nulo', async () => {
    let corpo: { expiraEm: string | null } | null = null
    server.use(
      http.post('*/api/admin/compradores/:id/prazo', async ({ request }) => {
        corpo = (await request.json()) as { expiraEm: string | null }
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Remover prazo' }))

    await waitFor(() => expect(corpo).not.toBeNull())
    expect(corpo!.expiraEm).toBeNull()
  })

  test('admin não verificado mostra o botão e reenviar chama a API com toast', async () => {
    let chamou = false
    server.use(
      http.post('*/api/admin/compradores/:id/reenviar-verificacao', () => {
        chamou = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe()

    await screen.findByText('Mercado do Zé')
    expect(screen.getByText('Não verificado')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reenviar verificação' }))

    await waitFor(() => expect(chamou).toBe(true))
    expect(await screen.findByText('E-mail de verificação reenviado')).toBeInTheDocument()
  })

  test('todos os admins verificados não mostram o botão de reenvio', async () => {
    renderDetalhe([], {
      ...DETALHE,
      admins: [{ id: ADMIN_1, nome: 'Dono', email: 'dono@x.com', papel: 'OWNER', emailVerificado: true }],
    })

    await screen.findByText('Mercado do Zé')
    expect(screen.getByText('E-mail verificado')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reenviar verificação' })).not.toBeInTheDocument()
  })

  test('escrever + Adicionar nota chama POST e a nota aparece na lista', async () => {
    const notas: Array<{ id: string; texto: string; autorSuperAdminId: string; criadoEm: string }> = []
    let corpo: { texto: string } | null = null
    server.use(
      http.post('*/api/admin/compradores/:id/notas', async ({ request }) => {
        corpo = (await request.json()) as { texto: string }
        notas.push({ id: NOTA_1, texto: corpo.texto, autorSuperAdminId: SA_ID, criadoEm: '2026-09-08T10:00:00Z' })
        return new HttpResponse(null, { status: 201 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe([], DETALHE, notas)

    await screen.findByText('Mercado do Zé')
    await user.type(screen.getByLabelText('Nova nota'), 'Cliente pediu extensão do prazo')
    await user.click(screen.getByRole('button', { name: 'Adicionar nota' }))

    await waitFor(() => expect(corpo).toEqual({ texto: 'Cliente pediu extensão do prazo' }))
    expect(await screen.findByText('Cliente pediu extensão do prazo')).toBeInTheDocument()
  })

  test('Remover nota chama DELETE após confirmação inline', async () => {
    let deletou: string | null = null
    server.use(
      http.delete('*/api/admin/compradores/:id/notas/:notaId', ({ params }) => {
        deletou = params.notaId as string
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderDetalhe([], DETALHE, [
      { id: NOTA_1, texto: 'Nota existente', autorSuperAdminId: SA_ID, criadoEm: '2026-09-08T10:00:00Z' },
    ])

    await screen.findByText('Nota existente')
    await user.click(screen.getByRole('button', { name: 'Remover' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção' }))

    await waitFor(() => expect(deletou).toBe(NOTA_1))
  })

  test('timeline renderiza tipos diferentes do mais recente ao mais antigo', async () => {
    renderDetalhe([], DETALHE, [], [
      { tipo: 'suspensao', quando: '2026-09-07T10:00:00Z', ator: 'Super admin', descricao: 'Conta suspensa' },
      { tipo: 'nota', quando: '2026-09-05T10:00:00Z', ator: 'Super admin', descricao: 'Ligou pedindo ajuda' },
      { tipo: 'cadastro', quando: '2026-09-01T10:00:00Z', ator: null, descricao: 'Loja cadastrada' },
    ])

    await screen.findByText('Mercado do Zé')
    const items = await screen.findAllByTestId('timeline-item')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Suspensão')
    expect(items[1]).toHaveTextContent('Nota')
    expect(items[2]).toHaveTextContent('Cadastro')
    expect(items[2]).toHaveTextContent('Sistema')
  })
})

describe('impersonação (entrar/sair do modo suporte)', () => {
  function PainelComBanner() {
    const { modoSuporte } = useAuth()
    return (
      <div>
        <div data-testid="modo-suporte">{modoSuporte ? 'sim' : 'nao'}</div>
        <ModoSuporteBanner nomeComprador="Mercado do Zé" />
      </div>
    )
  }

  function renderFluxo() {
    server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: TOKEN_SUPER_ADMIN })))
    server.use(http.get('*/api/admin/compradores/:id', () => HttpResponse.json(DETALHE)))
    server.use(
      http.post('*/api/admin/compradores/:id/suporte', () =>
        HttpResponse.json({ token: TOKEN_SUPORTE, expiraEm: '2026-09-07T20:00:00Z' })
      )
    )
    const router = createMemoryRouter(
      [
        { path: '/backoffice', element: <div>backoffice view</div> },
        { path: '/backoffice/compradores/:id', element: <CompradorDetalhePage /> },
        { path: '/admin', element: <PainelComBanner /> },
      ],
      { initialEntries: [`/backoffice/compradores/${C1}`] }
    )
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  test('entrar como suporte exige motivo, troca a sessão e mostra a tarja', async () => {
    const user = userEvent.setup()
    renderFluxo()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Entrar como suporte' }))

    const dialog = within(await screen.findByRole('dialog'))
    const botaoEntrar = dialog.getByRole('button', { name: 'Entrar' })
    expect(botaoEntrar).toBeDisabled()

    await user.type(dialog.getByLabelText('Motivo'), 'Reproduzir bug de cotação')
    expect(botaoEntrar).not.toBeDisabled()

    await user.click(botaoEntrar)

    expect(await screen.findByTestId('modo-suporte')).toHaveTextContent('sim')
    expect(screen.getByText('Modo suporte — Mercado do Zé')).toBeInTheDocument()
  })

  test('sair do modo suporte restaura a sessão e volta ao backoffice', async () => {
    const user = userEvent.setup()
    renderFluxo()

    await screen.findByText('Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Entrar como suporte' }))
    const dialog = within(await screen.findByRole('dialog'))
    await user.type(dialog.getByLabelText('Motivo'), 'Suporte')
    await user.click(dialog.getByRole('button', { name: 'Entrar' }))

    await screen.findByText('Modo suporte — Mercado do Zé')
    await user.click(screen.getByRole('button', { name: 'Sair do modo suporte' }))

    expect(await screen.findByText('backoffice view')).toBeInTheDocument()
  })
})
