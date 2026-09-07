import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, test, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { Toaster } from 'sonner'
import { LinkColaboradorCard } from './LinkColaboradorCard'
import type { Configuracao } from './configuracoes.schema'

let mockConfig: Configuracao
let corpoEnviado: { email: string } | null
let enviarFalha: boolean

beforeEach(() => {
  mockConfig = {
    nome: 'Supermercado Sarah',
    corPrimaria: '#0f766e',
    telefone: '(11) 4002-8922',
    layoutEmail: 'Olá...',
    estiloNavegacao: 'LATERAL',
    tema: 'CLARO',
    linkColaboradorToken: 'token-card',
  }
  corpoEnviado = null
  enviarFalha = false

  server.use(
    http.get('*/api/configuracoes', () => HttpResponse.json(mockConfig)),
    http.post('*/api/configuracoes/colaborador/enviar-link', async ({ request }) => {
      const body = (await request.json()) as { email: string }
      corpoEnviado = body
      if (enviarFalha) {
        return HttpResponse.json({ title: 'E-mail inválido', status: 400 }, { status: 400 })
      }
      return new HttpResponse(null, { status: 204 })
    })
  )
})

function renderCard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <LinkColaboradorCard />
    </QueryClientProvider>,
  )
}

test('exibe o link absoluto e copiar escreve na área de transferência com toast', async () => {
  const user = userEvent.setup()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })

  renderCard()

  const input = await screen.findByLabelText('Link do colaborador')
  const linkEsperado = `${window.location.origin}/colaborador/token-card`
  expect(input).toHaveValue(linkEsperado)

  await user.click(screen.getByRole('button', { name: 'Copiar' }))

  expect(writeText).toHaveBeenCalledWith(linkEsperado)
  expect(await screen.findByText('Link copiado')).toBeInTheDocument()
})

test('enviar com e-mail válido chama o endpoint com { email }', async () => {
  const user = userEvent.setup()
  renderCard()

  await screen.findByLabelText('Link do colaborador')
  const emailInput = screen.getByLabelText('E-mail para enviar o link')
  const botao = screen.getByRole('button', { name: 'Enviar por e-mail' })

  expect(botao).toBeDisabled()

  await user.type(emailInput, 'comprador@loja.com')
  expect(botao).toBeEnabled()

  await user.click(botao)

  await waitFor(() => expect(corpoEnviado).toEqual({ email: 'comprador@loja.com' }))
  expect(await screen.findByText('Link enviado para comprador@loja.com')).toBeInTheDocument()
})

test('e-mail inválido não envia e mantém o botão desabilitado', async () => {
  const user = userEvent.setup()
  renderCard()

  await screen.findByLabelText('Link do colaborador')
  const emailInput = screen.getByLabelText('E-mail para enviar o link')
  const botao = screen.getByRole('button', { name: 'Enviar por e-mail' })

  await user.type(emailInput, 'email-invalido')

  expect(botao).toBeDisabled()
  expect(corpoEnviado).toBeNull()
})

test('erro da API exibe ApiError.message', async () => {
  enviarFalha = true
  const user = userEvent.setup()
  renderCard()

  await screen.findByLabelText('Link do colaborador')
  await user.type(screen.getByLabelText('E-mail para enviar o link'), 'comprador@loja.com')
  await user.click(screen.getByRole('button', { name: 'Enviar por e-mail' }))

  expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
})
