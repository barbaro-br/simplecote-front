import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AnalisesPage } from './AnalisesPage'

function renderComQuery() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AnalisesPage />
    </QueryClientProvider>
  )
}

describe('AnalisesPage', () => {
  it('renderiza total gasto, ranking, itens e últimos preços', async () => {
    server.use(
      http.get('*/api/analises/compras', () =>
        HttpResponse.json({
          periodo: { de: '2026-08-01', ate: '2026-08-31' },
          totais: [
            { empresa: 'Kalunga', total: 1000 },
            { empresa: 'Distribuidora X', total: 500 },
          ],
          itemMaisComprado: { nome: 'Papel A4', quantidade: 320 },
          itemMenosComprado: { nome: 'Clips', quantidade: 10 },
          ultimosPrecos: [
            { produto: 'Café', precoUnitario: 12.4, empresa: 'Kalunga', data: '2026-08-15T12:00:00Z' },
          ],
        })
      )
    )

    renderComQuery()

    expect(await screen.findByText('Gasto por Empresa')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
    expect(screen.getAllByText('Kalunga').length).toBeGreaterThan(0)
    expect(screen.getByText('Papel A4')).toBeInTheDocument()
    expect(screen.getByText('Café')).toBeInTheDocument()
  })

  it('período sem compras mostra estado vazio', async () => {
    server.use(
      http.get('*/api/analises/compras', () =>
        HttpResponse.json({
          periodo: { de: '2026-08-01', ate: '2026-08-31' },
          totais: [],
          itemMaisComprado: null,
          itemMenosComprado: null,
          ultimosPrecos: [],
        })
      )
    )

    renderComQuery()

    expect(await screen.findByText('Nenhuma compra apurada neste período.')).toBeInTheDocument()
  })

  it('erro mostra mensagem discreta', async () => {
    server.use(
      http.get('*/api/analises/compras', () => new HttpResponse(null, { status: 500 }))
    )

    renderComQuery()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
