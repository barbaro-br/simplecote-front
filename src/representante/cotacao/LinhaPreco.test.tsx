import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { LinhaPreco } from './LinhaPreco'
import type { ItemLance } from './cotacao-token.schema'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const APOS_DEBOUNCE = 950

function item(over: Partial<ItemLance> = {}): ItemLance {
  return {
    itemCotacaoId: 'i-1',
    nome: 'arroz tipo 1 5kg',
    codigoBarras: '7896006711234',
    unidade: 'Fardo',
    quantidadeSolicitada: 10,
    quantidadePorEmbalagemSnapshot: 6,
    preco: null,
    precoUnitario: null,
    statusLance: 'PENDENTE',
    ...over,
  }
}

function renderLinha(props: Partial<React.ComponentProps<typeof LinhaPreco>> = {}) {
  const aoAssentar = vi.fn()
  const utils = render(
    <table>
      <tbody>
        <LinhaPreco item={item()} podeEditar aoAssentar={aoAssentar} {...props} />
      </tbody>
    </table>,
  )
  return { aoAssentar, ...utils }
}

const campo = () => screen.getByLabelText(/preço da embalagem/i)

test('mostra nome, embalagem e código de barras', () => {
  renderLinha()
  expect(screen.getByText('arroz tipo 1 5kg')).toBeInTheDocument()
  expect(screen.getByText('fd c/ 6 · comprar 10')).toBeInTheDocument()
  expect(screen.getByText('7896006711234')).toBeInTheDocument()
})

test('digitar preço (com vírgula) assenta depois do debounce', async () => {
  const { aoAssentar } = renderLinha()
  const user = userEvent.setup()
  await user.type(campo(), '12,5')
  await sleep(APOS_DEBOUNCE)
  await waitFor(() => expect(aoAssentar).toHaveBeenCalledWith({ preco: 12.5 }))
})

test('valor não-numérico mostra erro e não assenta', async () => {
  const { aoAssentar } = renderLinha()
  const user = userEvent.setup()
  await user.type(campo(), ',') // vira "." → NaN
  await sleep(APOS_DEBOUNCE)
  expect(await screen.findByRole('alert')).toHaveTextContent(/preço válido/i)
  expect(aoAssentar).not.toHaveBeenCalled()
})

test('limpar um preço já enviado assenta naoCotado', async () => {
  const { aoAssentar } = renderLinha({ item: item({ preco: 40 }) })
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /limpar preço/i }))
  await sleep(APOS_DEBOUNCE)
  await waitFor(() => expect(aoAssentar).toHaveBeenCalledWith({ naoCotado: true }))
})

test('somente leitura: input desabilitado, sem botão limpar', () => {
  renderLinha({ podeEditar: false, item: item({ preco: 40 }) })
  expect(campo()).toBeDisabled()
  expect(screen.queryByRole('button', { name: /limpar preço/i })).not.toBeInTheDocument()
})

test('selo "Novo" e status de sincronização (ícone, não texto)', () => {
  renderLinha({ novo: true, status: 'sincronizado' })
  expect(screen.getByText('Novo')).toBeInTheDocument()
  expect(screen.getByLabelText('salvo')).toBeInTheDocument()
})

test('status "enviando" mostra spinner; "falhou" mostra ícone de sem conexão', () => {
  const { unmount } = renderLinha({ item: item({ preco: 40 }), status: 'enviando' })
  expect(screen.getByLabelText('salvando')).toBeInTheDocument()
  unmount()
  renderLinha({ item: item({ preco: 40 }), status: 'falhou' })
  expect(screen.getByLabelText(/sem conexão/i)).toBeInTheDocument()
})

test('sem preço mostra o indicador "sem preço" (X apagado)', () => {
  renderLinha()
  expect(screen.getByLabelText('sem preço')).toBeInTheDocument()
})

test('preço unitário aparece como dica quando a embalagem tem >1 unidade', () => {
  renderLinha({ item: item({ preco: 174, quantidadePorEmbalagemSnapshot: 6, precoUnitario: 29 }) })
  expect(screen.getByText(/≈\s*R\$\s29,00\/un/)).toBeInTheDocument()
})

test('embalagem de 1 unidade não mostra dica de unitário (seria o mesmo número)', () => {
  renderLinha({ item: item({ preco: 29, quantidadePorEmbalagemSnapshot: 1, precoUnitario: 29 }) })
  expect(screen.queryByText(/\/un/)).not.toBeInTheDocument()
})
