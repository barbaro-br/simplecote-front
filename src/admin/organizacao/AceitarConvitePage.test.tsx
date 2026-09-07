import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { AceitarConvitePage } from './AceitarConvitePage'

function renderPage(initialEntry: string) {
  const router = createMemoryRouter(
    [{ path: '/convite/:token', element: <AceitarConvitePage /> }],
    { initialEntries: [initialEntry] }
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

test('token válido mostra contexto e, ao aceitar, leva ao login da loja', async () => {
  let corpo: unknown
  server.use(
    http.get('*/public/convites/abc-123', () =>
      HttpResponse.json({ nomeLoja: 'Mercado do Zé', papel: 'OPERADOR' })
    ),
    http.post('*/public/convites/abc-123', async ({ request }) => {
      corpo = await request.json()
      return HttpResponse.json({ slug: 'mercado-do-ze' })
    })
  )
  const user = userEvent.setup()
  renderPage('/convite/abc-123')

  expect(await screen.findByText('Mercado do Zé')).toBeInTheDocument()
  expect(screen.getByText('Operador')).toBeInTheDocument()

  await user.type(screen.getByLabelText('Senha'), 'senha-forte-123')
  await user.click(screen.getByRole('button', { name: 'Aceitar convite' }))

  expect(corpo).toEqual({ senha: 'senha-forte-123' })
  expect(await screen.findByText('Conta criada!')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ir para o login da minha loja' })).toHaveAttribute(
    'href',
    'https://mercado-do-ze.simplecote.app/login'
  )
})

test('token inválido mostra mensagem clara sem formulário', async () => {
  server.use(
    http.get('*/public/convites/token-invalido', () =>
      HttpResponse.json(
        { type: 'about:blank', title: 'Não processável', status: 422, detail: 'Convite inválido ou expirado.' },
        { status: 422, headers: { 'Content-Type': 'application/problem+json' } }
      )
    )
  )

  renderPage('/convite/token-invalido')

  expect(await screen.findByText('Convite inválido')).toBeInTheDocument()
  expect(screen.queryByLabelText('Senha')).toBeNull()
})
