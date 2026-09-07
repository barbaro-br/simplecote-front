import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { server } from '@/setupTests'
import { EsqueciSenhaPage } from './EsqueciSenhaPage'

let solicitacoes: number

// O back responde sempre 200 genérico no esqueci-senha (anti-enumeration). No
// redefinir-senha, 200 só com o código certo; senão 422 ProblemDetail.
beforeEach(() => {
  solicitacoes = 0
  server.use(
    http.post('*/api/auth/esqueci-senha', () => {
      solicitacoes += 1
      return HttpResponse.json({ mensagem: 'Se o e-mail informado estiver cadastrado, enviaremos as instruções de recuperação.' })
    }),
    http.post('*/api/auth/redefinir-senha', async ({ request }) => {
      const body = (await request.json()) as { email: string; codigo: string; novaSenha: string }
      if (body.codigo === '123456') {
        return HttpResponse.json({ mensagem: 'Senha redefinida com sucesso.' })
      }
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Erro de negócio',
          status: 422,
          detail: 'Código inválido ou expirado.',
        },
        { status: 422, headers: { 'content-type': 'application/problem+json' } },
      )
    }),
  )
})

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/esqueci-senha', element: <EsqueciSenhaPage /> },
      { path: '/login', element: <div>login view</div> },
    ],
    { initialEntries: ['/esqueci-senha'] },
  )
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

async function avancarParaCodigo(user: ReturnType<typeof userEvent.setup>, email = 'admin@dev.local') {
  await user.type(screen.getByLabelText('E-mail'), email)
  await user.click(screen.getByRole('button', { name: 'Enviar código' }))
  await screen.findByLabelText('Código de 6 dígitos')
}

test('etapa 1 → 2 avança mesmo com e-mail não cadastrado', async () => {
  const user = userEvent.setup()
  renderPage()

  await avancarParaCodigo(user, 'nao-existe@dev.local')

  expect(screen.getByLabelText('Código de 6 dígitos')).toBeInTheDocument()
})

test('validação: submeter e-mail vazio mostra erro inline e não avança', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: 'Enviar código' }))

  expect(await screen.findByText('E-mail obrigatório')).toBeInTheDocument()
  expect(screen.queryByLabelText('Código de 6 dígitos')).not.toBeInTheDocument()
})

test('campo de código só aceita dígitos; "Continuar" desabilitado com < 6 e habilita com 6', async () => {
  const user = userEvent.setup()
  renderPage()
  await avancarParaCodigo(user)

  const campo = screen.getByLabelText('Código de 6 dígitos')
  const continuar = screen.getByRole('button', { name: 'Continuar' })
  expect(continuar).toBeDisabled()

  // letras são ignoradas
  await user.type(campo, '12ab')
  expect(campo).toHaveValue('12')
  expect(continuar).toBeDisabled()

  await user.type(campo, '3456')
  expect(campo).toHaveValue('123456')
  expect(continuar).toBeEnabled()
})

test('"Reenviar código" re-chama esqueci-senha e o cooldown desabilita o botão', async () => {
  const user = userEvent.setup()
  renderPage()
  await avancarParaCodigo(user)
  expect(solicitacoes).toBe(1)

  await user.click(screen.getByRole('button', { name: 'Reenviar código' }))

  await waitFor(() => expect(solicitacoes).toBe(2))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /Reenviar código/ })).toBeDisabled(),
  )
})

test('etapa 3 sucesso → tela de sucesso com contador e link para o login', async () => {
  const user = userEvent.setup()
  renderPage()
  await avancarParaCodigo(user)

  await user.type(screen.getByLabelText('Código de 6 dígitos'), '123456')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  await user.type(await screen.findByLabelText('Nova senha'), 'senha12345')
  await user.type(screen.getByLabelText('Confirmar senha'), 'senha12345')
  await user.click(screen.getByRole('button', { name: 'Redefinir senha' }))

  expect(await screen.findByText(/Sua senha foi alterada com sucesso/)).toBeInTheDocument()
  expect(screen.getByText(/Redirecionando em 3/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ir para o login' })).toHaveAttribute('href', '/login')
})

test('código errado → 422 → volta para a etapa do código com erro visível e campo limpo', async () => {
  const user = userEvent.setup()
  renderPage()
  await avancarParaCodigo(user)

  await user.type(screen.getByLabelText('Código de 6 dígitos'), '999999')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  await user.type(await screen.findByLabelText('Nova senha'), 'senha12345')
  await user.type(screen.getByLabelText('Confirmar senha'), 'senha12345')
  await user.click(screen.getByRole('button', { name: 'Redefinir senha' }))

  const campo = await screen.findByLabelText('Código de 6 dígitos')
  expect(campo).toHaveValue('')
  expect(screen.getByText('Código inválido ou expirado.')).toBeInTheDocument()
})

test('confirmação de senha divergente aponta o erro e não envia', async () => {
  const user = userEvent.setup()
  renderPage()
  await avancarParaCodigo(user)

  await user.type(screen.getByLabelText('Código de 6 dígitos'), '123456')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  await user.type(await screen.findByLabelText('Nova senha'), 'senha12345')
  await user.type(screen.getByLabelText('Confirmar senha'), 'senha-diferente')
  await user.click(screen.getByRole('button', { name: 'Redefinir senha' }))

  expect(await screen.findByText('As senhas não conferem')).toBeInTheDocument()
})

test('"Trocar e-mail" volta para a etapa de e-mail preservando o valor', async () => {
  const user = userEvent.setup()
  renderPage()
  await avancarParaCodigo(user)

  await user.click(screen.getByRole('button', { name: 'Trocar e-mail' }))

  const campoEmail = await screen.findByLabelText('E-mail')
  expect(campoEmail).toHaveValue('admin@dev.local')
})

test('e-mail gmail.com mostra "Abrir Gmail" na etapa do código', async () => {
  const user = userEvent.setup()
  renderPage()
  await avancarParaCodigo(user, 'usuario@gmail.com')

  const link = await screen.findByRole('link', { name: 'Abrir Gmail' })
  expect(link).toHaveAttribute('href', 'https://mail.google.com/mail/u/0/#search/in%3Ainbox')
  expect(link).toHaveAttribute('target', '_blank')
})

test('não referencia dado de loja nem chama /api/configuracoes', async () => {
  let chamadasConfiguracoes = 0
  server.use(
    http.get('*/api/configuracoes', () => {
      chamadasConfiguracoes += 1
      return HttpResponse.json({ nome: 'Loja X' })
    })
  )

  renderPage()

  expect(await screen.findByRole('heading', { name: 'Recuperar senha' })).toBeInTheDocument()
  expect(screen.queryByText('Loja X')).not.toBeInTheDocument()

  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(chamadasConfiguracoes).toBe(0)
})
