import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { Toaster, toast } from 'sonner'
import { ItemLanceCard } from './ItemLanceCard'
import type { ItemLance } from './cotacao-token.schema'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const APOS_DEBOUNCE = 950

afterEach(() => toast.dismiss())

const baseItem: ItemLance = {
  itemCotacaoId: 'i-1',
  nome: 'Arroz',
  codigoBarras: null,
  unidade: 'Pct',
  quantidadeSolicitada: 10,
  quantidadePorEmbalagemSnapshot: 1,
  preco: null,
  precoUnitario: null,
  statusLance: 'PENDENTE',
}

function renderCard(over: Partial<React.ComponentProps<typeof ItemLanceCard>> = {}) {
  const aoAssentar = vi.fn()
  const onPrecoChange = vi.fn()
  const utils = render(
    <ItemLanceCard
      item={baseItem}
      podeEditar
      status={undefined}
      erro={undefined}
      aoAssentar={aoAssentar}
      onPrecoChange={onPrecoChange}
      {...over}
    />,
  )
  return { aoAssentar, onPrecoChange, ...utils }
}

const campo = () => screen.getByLabelText(/preço da embalagem/i)

describe('ItemLanceCard', () => {
  it('não tem mais o toggle "vou cotar / não cotado"', () => {
    renderCard()
    expect(screen.queryByRole('button', { name: /não cotado/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /vou cotar/i })).not.toBeInTheDocument()
  })

  it('indicador de status segue o preço: X sem valor, visto com valor', async () => {
    const user = userEvent.setup()
    renderCard()
    expect(screen.getByText('sem preço')).toBeInTheDocument()

    await user.type(campo(), '9')
    expect(screen.getByText('com preço')).toBeInTheDocument()
  })

  it('digitar preço → aoAssentar({ preco })', async () => {
    const user = userEvent.setup()
    const { aoAssentar } = renderCard()

    await user.type(campo(), '12.5')
    await sleep(APOS_DEBOUNCE)

    await waitFor(() => expect(aoAssentar).toHaveBeenCalledWith({ preco: 12.5 }))
  })

  it('apagar um preço que já foi enviado → aoAssentar({ naoCotado: true })', async () => {
    const user = userEvent.setup()
    const { aoAssentar } = renderCard({ item: { ...baseItem, preco: 10 } })

    await user.clear(campo())
    await sleep(APOS_DEBOUNCE)

    await waitFor(() => expect(aoAssentar).toHaveBeenCalledWith({ naoCotado: true }))
  })

  it('abrir sem preço e não digitar nada → não dispara aoAssentar', async () => {
    const { aoAssentar } = renderCard()
    await sleep(APOS_DEBOUNCE)
    expect(aoAssentar).not.toHaveBeenCalled()
  })

  it('onPrecoChange avisa a página quando o campo ganha/perde valor', async () => {
    const user = userEvent.setup()
    const { onPrecoChange } = renderCard()

    await user.type(campo(), '1')
    expect(onPrecoChange).toHaveBeenLastCalledWith('i-1', true)

    await user.clear(campo())
    expect(onPrecoChange).toHaveBeenLastCalledWith('i-1', false)
  })

  it('flash de borda verde ao preencher um preço', async () => {
    const user = userEvent.setup()
    const { container } = renderCard()
    await user.type(campo(), '5')
    await waitFor(() => expect(container.querySelector('.bg-card')).toHaveClass('flash-green'))
  })

  it('deslizar o card para a esquerda além do limiar limpa o preço (= não cotado)', async () => {
    const user = userEvent.setup()
    const { aoAssentar } = renderCard({ item: { ...baseItem, preco: 10 } })
    expect((campo() as HTMLInputElement).value).toBe('10')

    fireEvent.touchStart(campo(), { touches: [{ clientX: 200 }] })
    fireEvent.touchMove(campo(), { touches: [{ clientX: 90 }] })
    fireEvent.touchEnd(campo())

    expect((campo() as HTMLInputElement).value).toBe('')
    await sleep(APOS_DEBOUNCE)
    await waitFor(() => expect(aoAssentar).toHaveBeenCalledWith({ naoCotado: true }))
    void user
  })

  it('deslizar de leve não limpa o preço', () => {
    renderCard({ item: { ...baseItem, preco: 10 } })

    fireEvent.touchStart(campo(), { touches: [{ clientX: 200 }] })
    fireEvent.touchMove(campo(), { touches: [{ clientX: 170 }] })
    fireEvent.touchEnd(campo())

    expect((campo() as HTMLInputElement).value).toBe('10')
  })

  it('sem gesto de deslizar quando podeEditar é falso', () => {
    renderCard({ item: { ...baseItem, preco: 10 }, podeEditar: false })

    fireEvent.touchStart(campo(), { touches: [{ clientX: 200 }] })
    fireEvent.touchMove(campo(), { touches: [{ clientX: 90 }] })
    fireEvent.touchEnd(campo())

    expect((campo() as HTMLInputElement).value).toBe('10')
  })

  it('mostra o preço unitário quando o item já tem precoUnitario', () => {
    renderCard({ item: { ...baseItem, precoUnitario: 0.5 } })
    expect(screen.getByText(/unit\. R\$\s0,50/)).toBeInTheDocument()
  })

  it('mostra "calculando…" durante o envio quando ainda não há unitário', async () => {
    const user = userEvent.setup()
    renderCard({ status: 'enviando' })

    await user.type(campo(), '9')

    expect(screen.getByText('calculando…')).toBeInTheDocument()
  })

  it('renderiza o badge "Novo" quando novo é true', () => {
    renderCard({ novo: true })
    expect(screen.getByText('Novo')).toBeInTheDocument()
  })

  it('não renderiza o badge "Novo" quando novo é false', () => {
    renderCard({ novo: false })
    expect(screen.queryByText('Novo')).not.toBeInTheDocument()
  })

  it('não renderiza o badge "Novo" por padrão (sem a prop)', () => {
    renderCard()
    expect(screen.queryByText('Novo')).not.toBeInTheDocument()
  })

  it('limpar um preço já digitado dispara o toast "Preço removido" com "Desfazer"', async () => {
    const user = userEvent.setup()
    const aoAssentar = vi.fn()
    render(
      <>
        <Toaster />
        <ItemLanceCard
          item={{ ...baseItem, preco: 10 }}
          podeEditar
          status={undefined}
          erro={undefined}
          aoAssentar={aoAssentar}
        />
      </>,
    )

    await user.clear(campo())
    await sleep(APOS_DEBOUNCE)

    expect(await screen.findByText('Preço removido')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /desfazer/i })).toBeInTheDocument()
    await waitFor(() => expect(aoAssentar).toHaveBeenCalledWith({ naoCotado: true }))
  })

  it('acionar "Desfazer" restaura o valor anterior no campo', async () => {
    const user = userEvent.setup()
    const aoAssentar = vi.fn()
    render(
      <>
        <Toaster />
        <ItemLanceCard
          item={{ ...baseItem, preco: 10 }}
          podeEditar
          status={undefined}
          erro={undefined}
          aoAssentar={aoAssentar}
        />
      </>,
    )

    await user.clear(campo())
    await sleep(APOS_DEBOUNCE)

    await screen.findByText('Preço removido')
    fireEvent.click(screen.getByRole('button', { name: /desfazer/i }))

    await waitFor(() => expect((campo() as HTMLInputElement).value).toBe('10'))
    await sleep(APOS_DEBOUNCE)
    await waitFor(() => expect(aoAssentar).toHaveBeenCalledWith({ preco: 10 }))
  })

  it('esvaziar um campo que já estava vazio NÃO dispara o toast', async () => {
    render(
      <>
        <Toaster />
        <ItemLanceCard
          item={baseItem}
          podeEditar
          status={undefined}
          erro={undefined}
          aoAssentar={vi.fn()}
        />
      </>,
    )

    await sleep(APOS_DEBOUNCE)

    expect(screen.queryByText('Preço removido')).not.toBeInTheDocument()
  })
})
