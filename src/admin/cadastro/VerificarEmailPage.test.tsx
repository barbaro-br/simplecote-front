import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { VerificarEmailPage } from './VerificarEmailPage'

function renderPage(initialEntry: string) {
  const router = createMemoryRouter(
    [{ path: '/verificar-email', element: <VerificarEmailPage /> }],
    { initialEntries: [initialEntry] }
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

test('token válido → mostra link para <slug>.simplecote.app/login', async () => {
  server.use(
    http.post('*/public/cadastro/verificar', () => HttpResponse.json({ slug: 'mercado-central' }))
  )

  renderPage('/verificar-email?token=abc-123')

  expect(await screen.findByText('Conta ativada!')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ir para o login da minha loja' })).toHaveAttribute(
    'href',
    'https://mercado-central.simplecote.app/login'
  )
})

test('token inválido → mensagem clara e caminho para o login', async () => {
  server.use(
    http.post('*/public/cadastro/verificar', () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Não processável', status: 422, detail: 'Token inválido ou expirado.' },
        { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
      )
    )
  )

  renderPage('/verificar-email?token=token-expirado')

  expect(await screen.findByText('Este link é inválido ou expirou')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ir para o login' })).toHaveAttribute('href', '/login')
})
