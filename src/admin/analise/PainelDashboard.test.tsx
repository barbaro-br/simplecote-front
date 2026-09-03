import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PainelDashboard } from './PainelDashboard'

function renderComQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  )
}

describe('PainelDashboard', () => {
  it('renderiza o monitor com dados do contrato real', async () => {
    server.use(
      http.get('*/api/analises/dashboard', () => {
        return HttpResponse.json({
          porStatus: { rascunho: 10, aberta: 5, encerrada: 1, apurada: 2, cancelada: 0 },
          encerradasSemApurar: 3,
          apuradasSemPedidoEnviado: 2,
          proximosPrazos: [
            { cotacaoId: '123e4567-e89b-12d3-a456-426614174000', titulo: 'Material Expediente', fechaEm: new Date().toISOString() },
          ],
          gastoMes: 15000,
          gastoMesAnterior: 10000,
          economiaEstimada90d: 3000,
          topProdutos: [{ nome: 'Papel A4', valor: 500 }],
          topEmpresas: [{ nome: 'Kalunga', valor: 1000 }],
        })
      })
    )

    const handleStatusClick = vi.fn()
    renderComQuery(<PainelDashboard onStatusClick={handleStatusClick} />)

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument()
    })

    // Hero de economia
    expect(screen.getByText('R$ 3.000,00')).toBeInTheDocument()

    // Gastos
    expect(screen.getByText('R$ 15.000,00')).toBeInTheDocument()

    // Pipeline de status (rótulos pt-BR)
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
    expect(screen.getByText('Aberta')).toBeInTheDocument()
    expect(screen.getByText('Pedidos gerados')).toBeInTheDocument()
    expect(screen.queryByText('Apurada')).not.toBeInTheDocument()

    // Próximo prazo
    expect(screen.getByText('Material Expediente')).toBeInTheDocument()
    expect(screen.getByText('vence hoje')).toBeInTheDocument()

    // Top 5
    expect(screen.getByText('Papel A4')).toBeInTheDocument()
    expect(screen.getByText('Kalunga')).toBeInTheDocument()

    // "Precisa de ação" filtra a lista
    await userEvent.click(screen.getByRole('button', { name: /encerradas sem apurar/i }))
    expect(handleStatusClick).toHaveBeenCalledWith('ENCERRADA')
  })

  it('estado vazio orienta a criar a primeira cotação', async () => {
    server.use(
      http.get('*/api/analises/dashboard', () => {
        return HttpResponse.json({
          porStatus: { rascunho: 0, aberta: 0, encerrada: 0, apurada: 0, cancelada: 0 },
          encerradasSemApurar: 0,
          apuradasSemPedidoEnviado: 0,
          proximosPrazos: [],
          gastoMes: 0,
          gastoMesAnterior: 0,
          economiaEstimada90d: 0,
          topProdutos: [],
          topEmpresas: [],
        })
      })
    )

    renderComQuery(<PainelDashboard onStatusClick={vi.fn()} />)

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Comece criando sua primeira cotação')).toBeInTheDocument()
  })

  it('erro 500 não renderiza nada', async () => {
    server.use(
      http.get('*/api/analises/dashboard', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const { container } = renderComQuery(<PainelDashboard onStatusClick={vi.fn()} />)

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument()
    }, { timeout: 3000 })

    expect(container).toBeEmptyDOMElement()
  })
})
