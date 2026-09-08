import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AvisosBanner } from './AvisosBanner'

const AVISO = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  titulo: 'Manutenção programada',
  corpo: 'O painel ficará fora do ar das 02h às 04h.',
  nivel: 'ATENCAO',
  publicadoEm: '2026-09-08T10:00:00Z',
  expiraEm: null,
}

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderBanner() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AvisosBanner />
    </QueryClientProvider>
  )
}

describe('AvisosBanner', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('mostra o banner de um aviso vigente', async () => {
    server.use(http.get('*/api/avisos', () => HttpResponse.json([AVISO])))
    renderBanner()

    expect(await screen.findByText('Manutenção programada')).toBeInTheDocument()
    expect(screen.getByText('O painel ficará fora do ar das 02h às 04h.')).toBeInTheDocument()
  })

  test('dispensar esconde o banner e persiste no localStorage', async () => {
    server.use(http.get('*/api/avisos', () => HttpResponse.json([AVISO])))
    const user = userEvent.setup()
    renderBanner()

    await screen.findByText('Manutenção programada')
    await user.click(screen.getByRole('button', { name: 'Dispensar aviso' }))

    expect(screen.queryByText('Manutenção programada')).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('avisos-dispensados') ?? '[]')).toEqual([AVISO.id])
  })

  test('um aviso já dispensado não reaparece ao remontar', async () => {
    localStorage.setItem('avisos-dispensados', JSON.stringify([AVISO.id]))
    let chamou = false
    server.use(
      http.get('*/api/avisos', () => {
        chamou = true
        return HttpResponse.json([AVISO])
      })
    )
    renderBanner()

    await waitFor(() => expect(chamou).toBe(true))
    expect(screen.queryByText('Manutenção programada')).not.toBeInTheDocument()
  })
})
