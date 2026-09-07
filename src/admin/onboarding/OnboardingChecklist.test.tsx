import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { OnboardingChecklist } from './OnboardingChecklist'
import type { OnboardingEstado } from './onboarding.api'

function estadoBase(parcial: Partial<OnboardingEstado> = {}): OnboardingEstado {
  return {
    temProduto: false,
    temRepresentante: false,
    temCotacao: false,
    dispensado: false,
    modoTeste: true,
    ...parcial,
  }
}

function renderChecklist(estado: OnboardingEstado) {
  server.use(http.get('*/api/onboarding', () => HttpResponse.json(estado)))
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OnboardingChecklist />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

test('mostra os três passos pendentes com Comprador vazio', async () => {
  renderChecklist(estadoBase())

  expect(await screen.findByText('Cadastrar produtos')).toBeInTheDocument()
  expect(screen.getByText('Cadastrar um representante')).toBeInTheDocument()
  expect(screen.getByText('Abrir uma cotação de teste')).toBeInTheDocument()
})

test('passo cumprido aparece marcado e demais pendentes', async () => {
  renderChecklist(estadoBase({ temProduto: true }))

  await screen.findByText('Cadastrar produtos')
  expect(screen.getByText('Cadastrar produtos')).toHaveClass('line-through')
  expect(screen.getByText('Cadastrar um representante')).not.toHaveClass('line-through')
  expect(screen.getByText('Abrir uma cotação de teste')).not.toHaveClass('line-through')
})

test('dispensar chama PUT /api/onboarding/dispensar com true', async () => {
  let corpo: unknown
  server.use(
    http.get('*/api/onboarding', () => HttpResponse.json(estadoBase())),
    http.put('*/api/onboarding/dispensar', async ({ request }) => {
      corpo = await request.json()
      return new HttpResponse(null, { status: 204 })
    })
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OnboardingChecklist />
      </MemoryRouter>
    </QueryClientProvider>
  )

  await screen.findByText('Cadastrar produtos')
  await userEvent.setup().click(screen.getByRole('button', { name: 'Dispensar primeiros passos' }))

  expect(corpo).toEqual({ dispensado: true })
})

test('dados de exemplo não aparecem fora do modo de teste', async () => {
  renderChecklist(estadoBase({ modoTeste: false }))

  await screen.findByText('Cadastrar produtos')
  expect(screen.queryByRole('button', { name: /Preencher com dados de exemplo/i })).toBeNull()
  expect(screen.queryByRole('button', { name: /Limpar dados de exemplo/i })).toBeNull()
})

test('preencher e limpar dados de exemplo chamam POST e DELETE', async () => {
  let postChamado = false
  let deleteChamado = false
  server.use(
    http.get('*/api/onboarding', () => HttpResponse.json(estadoBase())),
    http.post('*/api/onboarding/dados-exemplo', () => {
      postChamado = true
      return new HttpResponse(null, { status: 204 })
    }),
    http.delete('*/api/onboarding/dados-exemplo', () => {
      deleteChamado = true
      return new HttpResponse(null, { status: 204 })
    })
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OnboardingChecklist />
      </MemoryRouter>
    </QueryClientProvider>
  )
  const user = userEvent.setup()

  await screen.findByText('Cadastrar produtos')
  await user.click(screen.getByRole('button', { name: /Preencher com dados de exemplo/i }))
  expect(postChamado).toBe(true)

  await user.click(screen.getByRole('button', { name: /Limpar dados de exemplo/i }))
  expect(deleteChamado).toBe(true)
})
