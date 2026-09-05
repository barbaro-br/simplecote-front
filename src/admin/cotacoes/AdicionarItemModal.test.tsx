import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, vi } from 'vitest'
import { server } from '@/setupTests'
import { AdicionarItemModal } from './AdicionarItemModal'

function renderModal(
  over: Partial<React.ComponentProps<typeof AdicionarItemModal>> = {},
  produtos: Array<Record<string, unknown>> = [
    { id: 'p-1', nome: 'Arroz Tipo 1 5kg', codigoBarras: null, unidade: 'Fardo', quantidadePorEmbalagem: 1, ativo: true },
  ],
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

describe('AdicionarItemModal — editar produto inline', () => {
  it('clicar no ícone de editar chama aoEditarProduto sem fechar o modal ou marcar o produto', async () => {
    const { aoEditarProduto } = renderModal()
    const user = userEvent.setup()

    const row = (await screen.findByText('Arroz Tipo 1 5kg')).closest('li')
    expect(row).not.toBeNull()
    const checkbox = within(row as HTMLElement).getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Editar Arroz Tipo 1 5kg' }))

    expect(aoEditarProduto).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p-1', nome: 'Arroz Tipo 1 5kg' }),
    )
    expect(checkbox).not.toBeChecked()
  })

  it('marcar 2 checkboxes em modal sem itens atualiza o subtítulo imediatamente', async () => {
    const user = userEvent.setup()
    renderModal(
      {},
      [
        { id: 'p-1', nome: 'Arroz Tipo 1 5kg', codigoBarras: null, unidade: 'Fardo', quantidadePorEmbalagem: 1, ativo: true },
        { id: 'p-2', nome: 'Feijão Carioca 1kg', codigoBarras: null, unidade: 'Pacote', quantidadePorEmbalagem: 1, ativo: true },
      ],
    )

    expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
    expect(screen.getByText('Nenhum produto adicionado')).toBeInTheDocument()

    const linhaArroz = screen.getByText('Arroz Tipo 1 5kg').closest('li') as HTMLElement
    const linhaFeijao = screen.getByText('Feijão Carioca 1kg').closest('li') as HTMLElement

    await user.click(within(linhaArroz).getByRole('checkbox'))
    await user.click(within(linhaFeijao).getByRole('checkbox'))

    expect(screen.getByText('2 produtos na cotação')).toBeInTheDocument()
  })

  it('desmarcar um item que já estava na cotação decrementa o subtítulo imediatamente', async () => {
    const user = userEvent.setup()
    renderModal({
      itens: [
        {
          id: 'item-1',
          produtoId: 'p-1',
          nomeSnapshot: 'Arroz Tipo 1 5kg',
          codigoBarrasSnapshot: null,
          unidadeSnapshot: 'Fardo',
          quantidadeSolicitada: 5,
          quantidadePorEmbalagemSnapshot: 1,
        },
      ],
    })

    expect(await screen.findByText('Arroz Tipo 1 5kg')).toBeInTheDocument()
    expect(screen.getByText('1 produto na cotação')).toBeInTheDocument()

    const linhaArroz = screen.getByText('Arroz Tipo 1 5kg').closest('li') as HTMLElement
    await user.click(within(linhaArroz).getByRole('checkbox'))

    expect(screen.getByText('Nenhum produto adicionado')).toBeInTheDocument()
  })
})
