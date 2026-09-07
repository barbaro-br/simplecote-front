import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, expect, test, beforeAll } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AuthProvider } from '@/shared/auth/AuthContext'
import { toast } from 'sonner'
import { ExportarDadosCard } from './ExportarDadosCard'
import { EncerrarContaCard } from './EncerrarContaCard'

vi.mock('sonner', () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}))

function jwt(claims: Record<string, unknown>): string {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.sig`
}

function tokenDe(papel: string): string {
  return jwt({ papel, compradorId: 'c1', slug: 'loja-1' })
}

function criarObjectURL(): string {
  return 'blob:mock'
}

function renderExportar(papel: string) {
  server.use(http.post('*/api/auth/refresh', () => HttpResponse.json({ token: tokenDe(papel) })))
  return render(
    <AuthProvider>
      <ExportarDadosCard />
    </AuthProvider>
  )
}

beforeAll(() => {
  ;(URL as unknown as { createObjectURL: unknown }).createObjectURL = criarObjectURL
  ;(URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn()
})

describe('ExportarDadosCard', () => {
  test('oculto para OPERADOR', async () => {
    renderExportar('OPERADOR')
    await waitFor(() =>
      expect(screen.queryByText('Exportar dados da organização')).not.toBeInTheDocument()
    )
  })

  test('200 dispara o download (baixarArquivo)', async () => {
    server.use(
      http.get('*/api/organizacao/exportacao', () =>
        new HttpResponse(new Blob(['xlsx']), { headers: { 'Content-Type': 'application/octet-stream' } })
      )
    )
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const user = userEvent.setup()
    renderExportar('ADMIN')

    await screen.findByText('Exportar dados da organização')
    await user.click(screen.getByRole('button', { name: 'Exportar dados' }))

    await waitFor(() => expect(clickSpy).toHaveBeenCalled())
    clickSpy.mockRestore()
  })

  test('202 avisa que será enviado por e-mail', async () => {
    server.use(http.get('*/api/organizacao/exportacao', () => new HttpResponse(null, { status: 202 })))
    const user = userEvent.setup()
    renderExportar('OWNER')

    await screen.findByText('Exportar dados da organização')
    await user.click(screen.getByRole('button', { name: 'Exportar dados' }))

    await waitFor(() => expect(toast.info).toHaveBeenCalled())
  })

  test('erro do backend aparece na tela', async () => {
    server.use(
      http.get('*/api/organizacao/exportacao', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Erro', status: 500, detail: 'Falha ao gerar o arquivo.' },
          { status: 500, headers: { 'Content-Type': 'application/problem+json' } }
        )
      )
    )
    const user = userEvent.setup()
    renderExportar('ADMIN')

    await screen.findByText('Exportar dados da organização')
    await user.click(screen.getByRole('button', { name: 'Exportar dados' }))

    expect(await screen.findByText('Falha ao gerar o arquivo.')).toBeInTheDocument()
  })
})

describe('EncerrarContaCard', () => {
  function renderEncerrar(papel: string) {
    server.use(
      http.post('*/api/auth/refresh', () => HttpResponse.json({ token: tokenDe(papel) })),
      http.get('*/api/configuracoes', () => HttpResponse.json({ nome: 'Mercado do Zé' }))
    )
    const router = createMemoryRouter(
      [
        { path: '/', element: <EncerrarContaCard /> },
        { path: '/conta-encerrada', element: <div>conta encerrada view</div> },
      ],
      { initialEntries: ['/'] }
    )
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  test('oculto para ADMIN (não OWNER)', async () => {
    renderEncerrar('ADMIN')
    await waitFor(() =>
      expect(screen.queryByText('Encerrar a organização')).not.toBeInTheDocument()
    )
  })

  test('confirmar exige digitar o nome da loja', async () => {
    const user = userEvent.setup()
    renderEncerrar('OWNER')

    await screen.findByText('Encerrar a organização')
    await user.click(screen.getByRole('button', { name: 'Encerrar organização' }))

    const dialog = within(await screen.findByRole('dialog'))
    const confirmar = dialog.getByRole('button', { name: 'Encerrar definitivamente' })
    expect(confirmar).toBeDisabled()

    await user.type(dialog.getByLabelText(/Digite/i), 'nome errado')
    expect(confirmar).toBeDisabled()

    await user.clear(dialog.getByLabelText(/Digite/i))
    await user.type(dialog.getByLabelText(/Digite/i), 'Mercado do Zé')
    expect(confirmar).not.toBeDisabled()
  })

  test('encerrar chama DELETE, encerra a sessão e leva à tela de conta encerrada', async () => {
    let chamou = false
    server.use(
      http.delete('*/api/organizacao', () => {
        chamou = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    const user = userEvent.setup()
    renderEncerrar('OWNER')

    await screen.findByText('Encerrar a organização')
    await user.click(screen.getByRole('button', { name: 'Encerrar organização' }))

    const dialog = within(await screen.findByRole('dialog'))
    await user.type(dialog.getByLabelText(/Digite/i), 'Mercado do Zé')
    await user.click(dialog.getByRole('button', { name: 'Encerrar definitivamente' }))

    expect(chamou).toBe(true)
    expect(await screen.findByText('conta encerrada view')).toBeInTheDocument()
  })
})
