import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, vi } from 'vitest'
import { server } from '@/setupTests'
import { AdicionarItemModal } from './AdicionarItemModal'

const ARROZ = {
  id: 'p-1',
  nome: 'Arroz Tipo 1 5kg',
  codigoBarras: null,
  unidade: 'Fardo',
  quantidadePorEmbalagem: 1,
  ativo: true,
}

function renderModal(
  over: Partial<React.ComponentProps<typeof AdicionarItemModal>> = {},
  produtos: Array<Record<string, unknown>> = [ARROZ],
) {
  server.use(http.get('*/api/produtos', () => HttpResponse.json(produtos)))
  const onClose = vi.fn()
  const aoCadastrarProduto = vi.fn()
  const aoEditarProduto = vi.fn()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <AdicionarItemModal
        cotacaoId="c-1"
        itens={[]}
        open
        onClose={onClose}
        aoCadastrarProduto={aoCadastrarProduto}
        aoEditarProduto={aoEditarProduto}
        {...over}
      />
    </QueryClientProvider>,
  )
  return { onClose, aoCadastrarProduto, aoEditarProduto, ...utils }
}

const itemArroz = {
  id: 'item-1',
  produtoId: 'p-1',
  nomeSnapshot: 'Arroz Tipo 1 5kg',
  codigoBarrasSnapshot: null,
  unidadeSnapshot: 'Fardo',
  quantidadeSolicitada: 5,
  quantidadePorEmbalagemSnapshot: 1,
}

describe('AdicionarItemModal', () => {
  it('clicar em "Adicionar" faz POST do item com quantidade 1', async () => {
    let body: { produtoId: string; quantidade: number } | null = null
    server.use(
      http.post('*/api/cotacoes/c-1/itens', async ({ request }) => {
        body = (await request.json()) as typeof body
        return HttpResponse.json({})
      }),
    )
    renderModal()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Adicionar Arroz Tipo 1 5kg à cotação' }))

    await waitFor(() => expect(body).toEqual({ produtoId: 'p-1', quantidade: 1 }))
  })

  it('produto já na cotação aparece como "Na cotação" e "Remover" faz DELETE', async () => {
    let deletado: string | null = null
    server.use(
      http.delete('*/api/cotacoes/c-1/itens/:itemId', ({ params }) => {
        deletado = params.itemId as string
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderModal({ itens: [itemArroz] })
    const user = userEvent.setup()

    const row = (await screen.findByText('Arroz Tipo 1 5kg')).closest('li') as HTMLElement
    expect(within(row).getByText('Na cotação')).toBeInTheDocument()
    expect(within(row).queryByRole('button', { name: /à cotação$/ })).not.toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: 'Remover Arroz Tipo 1 5kg da cotação' }))

    await waitFor(() => expect(deletado).toBe('item-1'))
  })

  it('clicar no lápis chama aoEditarProduto e não adiciona o produto', async () => {
    let postou = false
    server.use(
      http.post('*/api/cotacoes/c-1/itens', () => {
        postou = true
        return HttpResponse.json({})
      }),
    )
    const { aoEditarProduto } = renderModal()
    const user = userEvent.setup()

    const row = (await screen.findByText('Arroz Tipo 1 5kg')).closest('li') as HTMLElement
    await user.click(within(row).getByRole('button', { name: 'Editar Arroz Tipo 1 5kg' }))

    expect(aoEditarProduto).toHaveBeenCalledWith(expect.objectContaining({ id: 'p-1' }))
    expect(postou).toBe(false)
  })

  it('subtítulo reflete quantos produtos já estão na cotação', async () => {
    renderModal({ itens: [itemArroz] })
    expect(await screen.findByText(/1 produto na cotação/)).toBeInTheDocument()
  })

  it('"Concluído" chama onClose', async () => {
    const { onClose } = renderModal()
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Concluído' }))
    expect(onClose).toHaveBeenCalled()
  })
})
