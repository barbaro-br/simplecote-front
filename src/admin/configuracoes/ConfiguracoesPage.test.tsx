import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, test, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { ConfiguracoesPage } from './ConfiguracoesPage'
import { Toaster } from 'sonner'
import type { Configuracao } from './configuracoes.schema'

let mockConfig: Configuracao

beforeEach(() => {
  mockConfig = {
    nome: 'Supermercado Sarah',
    corPrimaria: '#0f766e',
    telefone: '(11) 4002-8922',
    layoutEmail: 'Olá...',
    estiloNavegacao: 'LATERAL',
    tema: 'CLARO',
    linkColaboradorToken: 'token-real',
  }

  server.use(
    http.get('*/api/configuracoes', () => HttpResponse.json(mockConfig)),
    http.put('*/api/configuracoes', async ({ request }) => {
      const body = (await request.json()) as Partial<Configuracao>
      mockConfig = { ...mockConfig, ...body }
      return HttpResponse.json(mockConfig)
    })
  )
})

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <ConfiguracoesPage />
    </QueryClientProvider>,
  )
}

test('carrega e exibe os valores atuais da configuração', async () => {
  renderPage()

  expect(await screen.findByLabelText('Nome da loja')).toHaveValue('Supermercado Sarah')
  expect(screen.getByLabelText('Telefone da loja')).toHaveValue('(11) 4002-8922')
})

test('salvar alteração persiste e reflete o novo valor', async () => {
  const user = userEvent.setup()
  const { unmount } = renderPage()

  const nomeInput = await screen.findByLabelText('Nome da loja')
  await user.clear(nomeInput)
  await user.type(nomeInput, 'Sara Supermercado Novo')
  await user.click(screen.getByRole('button', { name: 'Salvar configurações' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Salvar configurações' })).toBeEnabled()
  })

  unmount()

  renderPage()
  expect(await screen.findByLabelText('Nome da loja')).toHaveValue('Sara Supermercado Novo')
})

test('falha ao salvar exibe a mensagem via toast e mantém os valores anteriores', async () => {
  server.use(
    http.put('*/api/configuracoes', () => {
      return HttpResponse.json({ title: 'Telefone inválido', status: 400 }, { status: 400 })
    })
  )
  const user = userEvent.setup()
  renderPage()

  const nomeInput = await screen.findByLabelText('Nome da loja')
  await user.clear(nomeInput)
  await user.type(nomeInput, 'Outro Nome')
  await user.click(screen.getByRole('button', { name: 'Salvar configurações' }))

  expect(await screen.findByText('Telefone inválido')).toBeInTheDocument()
  expect(screen.getByLabelText('Nome da loja')).toHaveValue('Outro Nome')
})

test('estilo de navegação selecionado persiste ao salvar', async () => {
  const user = userEvent.setup()
  const { unmount } = renderPage()

  await user.click(await screen.findByRole('tab', { name: /Aparência/i }))

  expect(await screen.findByRole('radio', { name: 'Lateral' })).toBeChecked()
  await user.click(screen.getByRole('radio', { name: 'Inferior' }))
  await user.click(screen.getByRole('button', { name: 'Salvar configurações' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Salvar configurações' })).toBeEnabled()
  })

  unmount()

  renderPage()
  await user.click(await screen.findByRole('tab', { name: /Aparência/i }))
  expect(await screen.findByRole('radio', { name: 'Inferior' })).toBeChecked()
})

test('exibe o link do colaborador e o botão de copiar escreve na área de transferência', async () => {
  const user = userEvent.setup()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
  renderPage()

  const input = await screen.findByLabelText('Link do colaborador')
  const linkEsperado = `${window.location.origin}/colaborador/token-real`
  expect(input).toHaveValue(linkEsperado)

  await user.click(screen.getByRole('button', { name: 'Copiar' }))
  expect(writeText).toHaveBeenCalledWith(linkEsperado)
})

test('tema renderiza os dois radios, reflete o valor atual e persiste ao salvar', async () => {
  const user = userEvent.setup()
  const { unmount } = renderPage()

  await user.click(await screen.findByRole('tab', { name: /Aparência/i }))

  expect(await screen.findByRole('radio', { name: 'Claro' })).toBeChecked()
  expect(screen.getByRole('radio', { name: 'Escuro' })).not.toBeChecked()

  await user.click(screen.getByRole('radio', { name: 'Escuro' }))
  await user.click(screen.getByRole('button', { name: 'Salvar configurações' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Salvar configurações' })).toBeEnabled()
  })

  unmount()

  renderPage()
  await user.click(await screen.findByRole('tab', { name: /Aparência/i }))
  expect(await screen.findByRole('radio', { name: 'Escuro' })).toBeChecked()
})
