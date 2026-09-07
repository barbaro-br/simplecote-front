import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { OnboardingWizard } from './OnboardingWizard'

function renderWizard() {
  server.use(
    http.post('*/api/produtos', () =>
      HttpResponse.json(
        { id: 'p1', nome: 'Arroz', codigoBarras: '789', unidade: 'Unidade', quantidadePorEmbalagem: 1, ativo: true },
        { status: 201 }
      )
    ),
    http.post('*/api/empresas', () =>
      HttpResponse.json({ id: 'empresa-1', nome: 'Fornecedor X', ativo: true, podeExcluir: true }, { status: 201 })
    ),
    http.post('*/api/representantes', () =>
      HttpResponse.json(
        { id: '11111111-1111-4111-8111-111111111111', empresaId: 'empresa-1', nome: 'João', email: 'joao@x.com', whatsapp: null, ativo: true },
        { status: 201 }
      )
    )
  )
  const router = createMemoryRouter(
    [
      { path: '/', element: <OnboardingWizard open onClose={() => {}} /> },
      { path: '/admin/cotacoes/nova', element: <div>nova cotação view</div> },
    ],
    { initialEntries: ['/'] }
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

test('encadeia produtos → representante → cotação reusando as telas existentes', async () => {
  const user = userEvent.setup()
  renderWizard()

  // Passo 1: ProdutoForm
  expect(await screen.findByText('Novo Produto')).toBeInTheDocument()
  await user.type(screen.getByLabelText(/Código de barras/i), '7891234567890')
  await user.type(screen.getByLabelText('Nome do produto'), 'Arroz Branco 5kg')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  // Passo 2: EmpresaForm (empresa + representante)
  expect(await screen.findByText('Novo Fornecedor')).toBeInTheDocument()
  await user.type(screen.getByLabelText('Nome da empresa'), 'Atacadão Central')
  await user.type(screen.getByLabelText('Nome do representante'), 'João')
  await user.type(screen.getByLabelText('E-mail'), 'joao@x.com')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  // Passo 3: cotação
  expect(await screen.findByText('Último passo: crie uma cotação de teste e abra para os representantes darem preço.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Abrir nova cotação' }))

  expect(await screen.findByText('nova cotação view')).toBeInTheDocument()
})
