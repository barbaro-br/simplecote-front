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
  it('renderiza os cartões com dados', async () => {
    server.use(
      http.get('*/api/analises/dashboard', () => {
        return HttpResponse.json({
          porStatus: { RASCUNHO: 10, ABERTA: 5 },
          contadores: { encerradasSemApurar: 3, apuradasSemPedido: 2 },
          proximosPrazos: [
            { id: '123e4567-e89b-12d3-a456-426614174000', titulo: 'Material Expediente', fechaEm: new Date().toISOString() },
          ],
          gastos: {
            mesAtual: '15000.00',
            mesAnterior: '10000.00',
            variacaoPct: '50.0',
            economia90d: '3000.00',
          },
          topProdutos: [{ nome: 'Papel A4', valor: '500.00' }],
          topEmpresas: [{ nome: 'Kalunga', valor: '1000.00' }],
        })
      })
    )

    const handleStatusClick = vi.fn()
    renderComQuery(<PainelDashboard onStatusClick={handleStatusClick} />)

    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument()
    })

    expect(screen.getByText('RASCUNHO:')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()

    expect(screen.getByText('Encerradas sem apurar')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    
    expect(screen.getByText('Material Expediente')).toBeInTheDocument()
    expect(screen.getByText('vence hoje')).toBeInTheDocument()

    // 15000 comes formatted as R$ 15.000,00
    expect(screen.getByText('R$ 15.000,00')).toBeInTheDocument()
    expect(screen.getByText('(+50.0%)')).toBeInTheDocument()

    expect(screen.getByText('Papel A4')).toBeInTheDocument()
    expect(screen.getByText('Kalunga')).toBeInTheDocument()
    
    // click status
    await userEvent.click(screen.getByText('Encerradas sem apurar'))
    expect(handleStatusClick).toHaveBeenCalledWith('ENCERRADA')
  })

  it('estado vazio (payload zerado)', async () => {
    server.use(
      http.get('*/api/analises/dashboard', () => {
        return HttpResponse.json({
          porStatus: {},
          contadores: { encerradasSemApurar: 0, apuradasSemPedido: 0 },
          proximosPrazos: [],
          gastos: { mesAtual: '0', mesAnterior: '0', variacaoPct: null, economia90d: '0' },
          topProdutos: [],
          topEmpresas: [],
        })
      })
    )

    renderComQuery(<PainelDashboard onStatusClick={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument()
    })
    
    // "Sem cotações ativas" in visao geral
    expect(screen.getByText('Sem cotações ativas')).toBeInTheDocument()
    
    // "Nada por aqui" x3 (prazos, topProdutos, topEmpresas)
    expect(screen.getAllByText('Nada por aqui')).toHaveLength(3)
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
