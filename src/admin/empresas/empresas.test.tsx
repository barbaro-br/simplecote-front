import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { toast } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { EmpresasPage } from './EmpresasPage'

const EMPRESA_ID = '123e4567-e89b-12d3-a456-426614174000'
const REP_ID = '223e4567-e89b-12d3-a456-426614174000'

beforeEach(() => {
  server.use(
    http.get('*/api/empresas', () =>
      HttpResponse.json([{ id: EMPRESA_ID, nome: 'Fornecedor A LTDA', ativo: true }])
    ),
    http.get('*/api/representantes', () =>
      HttpResponse.json([
        { id: REP_ID, empresaId: EMPRESA_ID, nome: 'João', email: 'joao@x.com', whatsapp: null, ativo: true },
      ])
    ),
    http.post('*/api/empresas', async ({ request }) => {
      const data = (await request.json()) as { nome: string }
      return HttpResponse.json({ id: EMPRESA_ID, ...data, ativo: true }, { status: 201 })
    }),
    http.post('*/api/representantes', async ({ request }) => {
      const data = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ id: REP_ID, ...data }, { status: 201 })
    }),
    http.put('*/api/empresas/:id', async ({ request }) => {
      const data = (await request.json()) as { nome: string }
      return HttpResponse.json({ id: EMPRESA_ID, ...data, ativo: true }, { status: 200 })
    }),
    http.put('*/api/representantes/:id', async ({ request }) => {
      const data = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ id: REP_ID, empresaId: EMPRESA_ID, ...data, ativo: true }, { status: 200 })
    }),
    http.post('*/api/empresas/:id/inativar', () => new HttpResponse(null, { status: 204 })),
  )
})

function renderComQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

test('lista as empresas com o representante', async () => {
  renderComQuery(<EmpresasPage />)
  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  expect(await screen.findByText('João')).toBeInTheDocument()
})

test('abre formulário, preenche empresa e representante, e salva', async () => {
  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Nova Empresa/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome da empresa'), 'Novo Fornecedor')
  await user.type(dialog.getByLabelText('Nome do representante'), 'Maria')
  await user.type(dialog.getByLabelText('E-mail'), 'maria@email.com')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('empresa inativa aparece apagada com "Ativar"; clicar reativa e a linha acende', async () => {
  const lista = [
    { id: '1', nome: 'Fornecedor A LTDA', ativo: true },
    { id: '2', nome: 'Fornecedor Velho', ativo: false },
  ]
  server.use(
    http.get('*/api/empresas', () => HttpResponse.json(lista)),
    http.post('*/api/empresas/:id/ativar', ({ params }) => {
      const e = lista.find((x) => x.id === params.id)
      if (e) e.ativo = true
      return new HttpResponse(null, { status: 204 })
    }),
  )

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText(/Fornecedor Velho/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Ativar' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Ativar' }))

  await waitFor(() => {
    expect(screen.queryByRole('button', { name: 'Ativar' })).not.toBeInTheDocument()
  })
  expect(screen.getAllByRole('button', { name: 'Inativar' })).toHaveLength(2)
})

test('edita o nome e o representante de uma empresa existente', async () => {
  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  expect(await screen.findByText('João')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Editar/i }))

  const dialog = within(screen.getByRole('dialog'))

  // Representante já vem preenchido
  expect(dialog.getByLabelText('Nome do representante')).toHaveValue('João')

  const nomeInput = dialog.getByLabelText('Nome da empresa')
  await user.clear(nomeInput)
  await user.type(nomeInput, 'Fornecedor A Editado')

  const emailInput = dialog.getByLabelText('E-mail')
  await user.clear(emailInput)
  await user.type(emailInput, 'joao.novo@x.com')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('editar empresa sem representante cria o representante ao salvar', async () => {
  server.use(http.get('*/api/representantes', () => HttpResponse.json([])))

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Editar/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome do representante'), 'Carlos')
  await user.type(dialog.getByLabelText('E-mail'), 'carlos@x.com')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

test('aplica máscara no WhatsApp em tempo real e envia só os dígitos', async () => {
  let whatsappEnviado: unknown
  server.use(
    http.post('*/api/representantes', async ({ request }) => {
      const data = (await request.json()) as Record<string, unknown>
      whatsappEnviado = data.whatsapp
      return HttpResponse.json({ id: REP_ID, ...data }, { status: 201 })
    }),
  )

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Nova Empresa/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome da empresa'), 'Novo Fornecedor')
  await user.type(dialog.getByLabelText('Nome do representante'), 'Maria')
  await user.type(dialog.getByLabelText('E-mail'), 'maria@email.com')
  await user.type(dialog.getByLabelText(/WhatsApp/), '11987654321')

  expect(dialog.getByLabelText(/WhatsApp/)).toHaveValue('(11) 98765-4321')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(whatsappEnviado).toBe('11987654321')
  })
})

test('falha ao cadastrar representante não duplica empresa; reenviar chama só criarRepresentante', async () => {
  let empresasCriadas = 0
  let representantesCriados = 0
  let empresaIdEnviado: unknown

  server.use(
    http.post('*/api/empresas', async ({ request }) => {
      empresasCriadas += 1
      const data = (await request.json()) as { nome: string }
      return HttpResponse.json({ id: EMPRESA_ID, ...data, ativo: true }, { status: 201 })
    }),
    http.post('*/api/representantes', async ({ request }) => {
      representantesCriados += 1
      const data = (await request.json()) as Record<string, unknown>
      empresaIdEnviado = data.empresaId
      if (representantesCriados === 1) {
        return HttpResponse.json(
          { title: 'Bad Request', status: 400, detail: 'E-mail inválido' },
          { status: 400 },
        )
      }
      return HttpResponse.json({ id: REP_ID, ...data }, { status: 201 })
    }),
  )

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Nova Empresa/i }))

  const dialog = within(screen.getByRole('dialog'))
  await user.type(dialog.getByLabelText('Nome da empresa'), 'Novo Fornecedor')
  await user.type(dialog.getByLabelText('Nome do representante'), 'Maria')
  await user.type(dialog.getByLabelText('E-mail'), 'maria@email.com')

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  expect(await screen.findByText(/Empresa criada, mas houve falha ao cadastrar o representante/)).toBeInTheDocument()
  expect(empresasCriadas).toBe(1)
  expect(representantesCriados).toBe(1)

  await user.click(dialog.getByRole('button', { name: /Salvar/i }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  expect(empresasCriadas).toBe(1)
  expect(representantesCriados).toBe(2)
  expect(empresaIdEnviado).toBe(EMPRESA_ID)
})

test('excluir empresa sem histórico remove a linha após confirmação', async () => {
  const successSpy = vi.spyOn(toast, 'success')
  const lista = [
    { id: '1', nome: 'Fornecedor A LTDA', ativo: true, podeExcluir: true },
  ]
  server.use(
    http.get('*/api/empresas', () => HttpResponse.json(lista)),
    http.delete('*/api/empresas/:id', ({ params }) => {
      const i = lista.findIndex((x) => x.id === params.id)
      if (i >= 0) lista.splice(i, 1)
      return new HttpResponse(null, { status: 204 })
    }),
  )

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Excluir' }))
  const dialog = within(screen.getByRole('dialog'))
  expect(dialog.getByText(/Excluir definitivamente/)).toBeInTheDocument()
  await user.click(dialog.getByRole('button', { name: 'Excluir' }))

  await waitFor(() => {
    expect(screen.queryByText('Fornecedor A LTDA')).not.toBeInTheDocument()
  })
  expect(successSpy).toHaveBeenCalledWith('Empresa excluída.')
  successSpy.mockRestore()
})

test('erro 409 ao excluir mantém a empresa e exibe a mensagem da API', async () => {
  const errorSpy = vi.spyOn(toast, 'error')
  server.use(
    http.get('*/api/empresas', () =>
      HttpResponse.json([{ id: '1', nome: 'Fornecedor A LTDA', ativo: true, podeExcluir: true }])
    ),
    http.delete('*/api/empresas/:id', () =>
      HttpResponse.json(
        { title: 'Conflito', status: 409, detail: 'Não é possível excluir: a empresa já participou de uma cotação.' },
        { status: 409 },
      )
    ),
  )

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Excluir' }))
  const dialog = within(screen.getByRole('dialog'))
  await user.click(dialog.getByRole('button', { name: 'Excluir' }))

  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalledWith('Não é possível excluir: a empresa já participou de uma cotação.')
  })
  expect(screen.getByText('Fornecedor A LTDA')).toBeInTheDocument()
  errorSpy.mockRestore()
})

test('empresa com histórico tem Excluir desabilitado com dica; sem histórico abre o diálogo', async () => {
  server.use(
    http.get('*/api/empresas', () =>
      HttpResponse.json([
        { id: '1', nome: 'Com Histórico', ativo: true, podeExcluir: false },
        { id: '2', nome: 'Sem Histórico', ativo: true, podeExcluir: true },
      ])
    ),
  )

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Com Histórico')).toBeInTheDocument()

  const excluir = screen.getAllByRole('button', { name: 'Excluir' })
  expect(excluir).toHaveLength(2)
  expect(excluir[0]).toBeDisabled()
  expect(excluir[1]).toBeEnabled()

  fireEvent.mouseEnter(excluir[0])
  const tooltip = await screen.findByRole('tooltip')
  expect(tooltip).toHaveTextContent(/já participou de uma cotação/)

  await user.click(excluir[1])
  expect(await screen.findByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText(/Excluir definitivamente/)).toBeInTheDocument()
})

test('cancelar a confirmação não dispara o DELETE; confirmar dispara uma única vez', async () => {
  let deletou = 0
  server.use(
    http.get('*/api/empresas', () =>
      HttpResponse.json([{ id: '1', nome: 'Fornecedor A LTDA', ativo: true, podeExcluir: true }])
    ),
    http.delete('*/api/empresas/:id', () => {
      deletou += 1
      return new HttpResponse(null, { status: 204 })
    }),
  )

  renderComQuery(<EmpresasPage />)
  const user = userEvent.setup()

  expect(await screen.findByText('Fornecedor A LTDA')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Excluir' }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Voltar' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(deletou).toBe(0)

  await user.click(screen.getByRole('button', { name: 'Excluir' }))
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }))
  await waitFor(() => {
    expect(deletou).toBe(1)
  })
})
