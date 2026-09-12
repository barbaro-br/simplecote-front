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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const APOS_DEBOUNCE = 400

function renderModal(
  over: Partial<React.ComponentProps<typeof AdicionarItemModal>> = {},
  produtos: Array<Record<string, unknown>> = [ARROZ],
) {
  server.use(
    http.get('*/api/produtos', () => HttpResponse.json(produtos)),
    http.get('*/api/produtos/sugestoes', () => HttpResponse.json({ doProprioCatalogo: [], doCatalogoGlobal: [] })),
  )
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

  it('busca casa por código de barras, inclusive pelos últimos dígitos', async () => {
    renderModal({}, [
      ARROZ,
      { id: 'p-2', nome: 'Feijão Carioca 1kg', codigoBarras: '7891234563412', unidade: 'Pacote', quantidadePorEmbalagem: 1, ativo: true },
    ])
    const user = userEvent.setup()
    await screen.findByText('Arroz Tipo 1 5kg')

    await user.type(screen.getByPlaceholderText(/Buscar por nome ou código/i), '3412')

    expect(screen.getByText('Feijão Carioca 1kg')).toBeInTheDocument()
    expect(screen.queryByText('Arroz Tipo 1 5kg')).not.toBeInTheDocument()
  })

  it('sem match no próprio catálogo, sugere do catálogo global; clicar abre o cadastro pré-preenchido', async () => {
    const { aoCadastrarProduto } = renderModal()
    const user = userEvent.setup()
    await screen.findByText('Arroz Tipo 1 5kg')

    // Depois de renderModal (que já registra um default vazio pra essa rota) —
    // server.use mais recente vence, então essa sobreposição precisa vir por
    // último pra valer.
    server.use(
      http.get('*/api/produtos/sugestoes', ({ request }) => {
        const q = new URL(request.url).searchParams.get('q')
        if (q === 'coco') {
          return HttpResponse.json({
            doProprioCatalogo: [],
            doCatalogoGlobal: [{ codigoBarras: '7891234567890', nome: 'Coco Ralado 100g', marca: null }],
          })
        }
        return HttpResponse.json({ doProprioCatalogo: [], doCatalogoGlobal: [] })
      }),
    )

    await user.type(screen.getByPlaceholderText(/Buscar por nome ou código/i), 'coco')
    await sleep(APOS_DEBOUNCE)

    const sugestao = await screen.findByText('Coco Ralado 100g')
    await user.click(sugestao)

    expect(aoCadastrarProduto).toHaveBeenCalledWith({ nome: 'Coco Ralado 100g', codigoBarras: '7891234567890' })
  })

  it('sugestão do catálogo global usa o mesmo layout de linha do próprio catálogo (ícone + nome + botão Adicionar)', async () => {
    renderModal()
    const user = userEvent.setup()
    await screen.findByText('Arroz Tipo 1 5kg')

    server.use(
      http.get('*/api/produtos/sugestoes', () =>
        HttpResponse.json({
          doProprioCatalogo: [],
          doCatalogoGlobal: [{ codigoBarras: '7891234567890', nome: 'Coco Ralado 100g', marca: 'Marca X' }],
        }),
      ),
    )

    await user.type(screen.getByPlaceholderText(/Buscar por nome ou código/i), 'coco')
    await sleep(APOS_DEBOUNCE)

    const linha = (await screen.findByText('Coco Ralado 100g')).closest('li') as HTMLElement
    expect(within(linha).getByText(/7891234567890/)).toBeInTheDocument()
    expect(within(linha).getByRole('button', { name: 'Cadastrar e adicionar Coco Ralado 100g' })).toBeInTheDocument()
  })

  it('seta pra baixo + Enter seleciona o item ativo na lista do próprio catálogo', async () => {
    let body: { produtoId: string; quantidade: number } | null = null
    server.use(
      http.post('*/api/cotacoes/c-1/itens', async ({ request }) => {
        body = (await request.json()) as typeof body
        return HttpResponse.json({})
      }),
    )
    renderModal({}, [
      ARROZ,
      { id: 'p-2', nome: 'Feijão Carioca 1kg', codigoBarras: null, unidade: 'Pacote', quantidadePorEmbalagem: 1, ativo: true },
    ])
    const user = userEvent.setup()
    await screen.findByText('Feijão Carioca 1kg')

    const campo = screen.getByPlaceholderText(/Buscar por nome ou código/i)
    await user.click(campo)
    await user.keyboard('{ArrowDown}{Enter}')

    await waitFor(() => expect(body).toEqual({ produtoId: 'p-2', quantidade: 1 }))
  })

  it('Enter na base compartilhada (sem digitar seta) cadastra a primeira sugestão', async () => {
    const { aoCadastrarProduto } = renderModal()
    const user = userEvent.setup()
    await screen.findByText('Arroz Tipo 1 5kg')

    server.use(
      http.get('*/api/produtos/sugestoes', () =>
        HttpResponse.json({
          doProprioCatalogo: [],
          doCatalogoGlobal: [{ codigoBarras: '7891234567890', nome: 'Coco Ralado 100g', marca: null }],
        }),
      ),
    )

    const campo = screen.getByPlaceholderText(/Buscar por nome ou código/i)
    await user.type(campo, 'coco')
    await sleep(APOS_DEBOUNCE)
    await screen.findByText('Coco Ralado 100g')

    await user.keyboard('{Enter}')

    expect(aoCadastrarProduto).toHaveBeenCalledWith({ nome: 'Coco Ralado 100g', codigoBarras: '7891234567890' })
  })

  it('achar no próprio catálogo não busca sugestão do catálogo global', async () => {
    let chamouSugestoes = false
    server.use(
      http.get('*/api/produtos/sugestoes', () => {
        chamouSugestoes = true
        return HttpResponse.json({ doProprioCatalogo: [], doCatalogoGlobal: [] })
      }),
    )
    renderModal()
    const user = userEvent.setup()
    await screen.findByText('Arroz Tipo 1 5kg')

    await user.type(screen.getByPlaceholderText(/Buscar por nome ou código/i), 'Arroz')
    await sleep(APOS_DEBOUNCE)

    expect(chamouSugestoes).toBe(false)
  })
})
