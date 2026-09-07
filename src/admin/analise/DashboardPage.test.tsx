import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider, useSearchParams } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { DashboardPage } from './DashboardPage'
import type { OnboardingEstado } from '@/admin/onboarding/onboarding.api'

function ListaMarker() {
  const [searchParams] = useSearchParams()
  return <div>lista filtrada {searchParams.get('status')}</div>
}

const ANALISE = {
  porStatus: { rascunho: 1, aberta: 2, encerrada: 1, apurada: 0, cancelada: 0 },
  encerradasSemApurar: 3,
  apuradasSemPedidoEnviado: 0,
  proximosPrazos: [],
  gastoMes: 1000,
  gastoMesAnterior: 500,
  economiaEstimada90d: 200,
  topProdutos: [],
  topEmpresas: [],
}

const CONFIG = {
  nome: 'Supermercado Sarah',
  corPrimaria: '#0f766e',
  telefone: '(11) 4002-8922',
  layoutEmail: 'Olá...',
  estiloNavegacao: 'LATERAL',
  tema: 'CLARO',
  linkColaboradorToken: 'token-dashboard',
}

function onboarding(parcial: Partial<OnboardingEstado> = {}): OnboardingEstado {
  return {
    temProduto: false,
    temRepresentante: false,
    temCotacao: false,
    dispensado: false,
    modoTeste: true,
    ...parcial,
  }
}

function renderPage(estado: OnboardingEstado) {
  server.use(
    http.get('*/api/analises/dashboard', () => HttpResponse.json(ANALISE)),
    http.get('*/api/configuracoes', () => HttpResponse.json(CONFIG)),
    http.get('*/api/onboarding', () => HttpResponse.json(estado))
  )
  const router = createMemoryRouter(
    [
      { path: '/admin', element: <DashboardPage /> },
      { path: '/admin/cotacoes', element: <ListaMarker /> },
    ],
    { initialEntries: ['/admin'] }
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

test('renderiza o monitor e o atalho navega para a lista filtrada', async () => {
  renderPage(onboarding({ temProduto: true, temRepresentante: true, temCotacao: true }))

  expect(await screen.findByText('Economia estimada (90 dias)')).toBeInTheDocument()

  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: /encerradas sem apurar/i }))

  expect(await screen.findByText('lista filtrada ENCERRADA')).toBeInTheDocument()
})

test('checklist aparece com Comprador vazio', async () => {
  renderPage(onboarding())

  expect(await screen.findByText('Primeiros passos')).toBeInTheDocument()
  expect(screen.getByText('Cadastrar produtos')).toBeInTheDocument()
})

test('checklist some quando os três passos estão cumpridos', async () => {
  renderPage(onboarding({ temProduto: true, temRepresentante: true, temCotacao: true }))

  await screen.findByText('Economia estimada (90 dias)')
  expect(screen.queryByText('Primeiros passos')).not.toBeInTheDocument()
})

test('dispensado mostra ação de reexibir os primeiros passos', async () => {
  renderPage(onboarding({ dispensado: true }))

  expect(await screen.findByText('Economia estimada (90 dias)')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Mostrar primeiros passos' })).toBeInTheDocument()
  expect(screen.queryByText('Primeiros passos')).not.toBeInTheDocument()
})
