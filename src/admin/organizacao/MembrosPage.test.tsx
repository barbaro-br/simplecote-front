import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { MembrosPage } from './MembrosPage'

const DONO = '11111111-1111-4111-8111-111111111111'
const ANA = '22222222-2222-4222-8222-222222222222'
const BETO = '33333333-3333-4333-8333-333333333333'
const CONVITE = '44444444-4444-4444-8444-444444444444'

const membros = [
  { id: DONO, nome: 'Dona Loja', email: 'dona@x.com', papel: 'OWNER', status: 'ATIVO' },
  { id: ANA, nome: 'Ana', email: 'ana@x.com', papel: 'ADMIN', status: 'ATIVO' },
  { id: BETO, nome: 'Beto', email: 'beto@x.com', papel: 'OPERADOR', status: 'INATIVO' },
  { id: CONVITE, nome: null, email: 'carla@x.com', papel: 'OPERADOR', status: 'CONVITE_PENDENTE' },
]

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MembrosPage />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  server.use(http.get('*/api/organizacao/membros', () => HttpResponse.json(membros)))
})

test('lista membros com nome, e-mail, papel e status', async () => {
  renderPage()

  expect(await screen.findByText('Dona Loja')).toBeInTheDocument()
  expect(screen.getByText('Ana')).toBeInTheDocument()
  expect(screen.getByText('Beto')).toBeInTheDocument()
  expect(screen.getByText('carla@x.com')).toBeInTheDocument()

  expect(screen.getByText('Dono')).toBeInTheDocument()
  expect(screen.getByText('Administrador')).toBeInTheDocument()
  expect(screen.getByText('Convite pendente')).toBeInTheDocument()
  expect(screen.getByText('Inativo')).toBeInTheDocument()
})

test('convidar chama POST /api/organizacao/convites com e-mail e papel', async () => {
  let corpo: unknown
  server.use(
    http.post('*/api/organizacao/convites', async ({ request }) => {
      corpo = await request.json()
      return HttpResponse.json({ id: CONVITE }, { status: 201 })
    })
  )
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('Ana')

  await user.click(screen.getByRole('button', { name: /Convidar membro/i }))
  const dialog = within(await screen.findByRole('dialog'))
  await user.type(dialog.getByLabelText('E-mail'), 'nova@x.com')
  await user.selectOptions(dialog.getByLabelText('Papel'), 'ADMIN')
  await user.click(dialog.getByRole('button', { name: 'Convidar' }))

  expect(corpo).toEqual({ email: 'nova@x.com', papel: 'ADMIN' })
})

test('reenviar convite chama a API', async () => {
  let chamou = false
  server.use(
    http.post('*/api/organizacao/convites/:id/reenviar', ({ params }) => {
      chamou = true
      expect(params.id).toBe(CONVITE)
      return new HttpResponse(null, { status: 204 })
    })
  )
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('carla@x.com')

  await user.click(screen.getByRole('button', { name: 'Reenviar' }))

  expect(chamou).toBe(true)
})

test('revogar convite passa por confirmação e chama DELETE', async () => {
  let chamou = false
  server.use(
    http.delete('*/api/organizacao/convites/:id', ({ params }) => {
      chamou = true
      expect(params.id).toBe(CONVITE)
      return new HttpResponse(null, { status: 204 })
    })
  )
  const user = userEvent.setup()
  renderPage()
  await screen.findByText('carla@x.com')

  await user.click(screen.getByRole('button', { name: 'Revogar' }))
  const confirm = within(await screen.findByRole('dialog'))
  await user.click(confirm.getByRole('button', { name: 'Revogar' }))

  expect(chamou).toBe(true)
})

test('OWNER não tem ações destrutivas', async () => {
  renderPage()
  await screen.findByText('Dona Loja')

  const linhaOwner = screen.getByText('Dona Loja').closest('tr') as HTMLElement
  expect(within(linhaOwner).queryByRole('button')).toBeNull()

  // Ana (ADMIN ativo) é a única com "Inativar".
  expect(screen.getAllByRole('button', { name: 'Inativar' })).toHaveLength(1)
})
