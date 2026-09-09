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
  render(
    <table>
      <tbody>
        <LinhaPreco item={item()} podeEditar aoAssentar={aoAssentar} {...props} />
      </tbody>
    </table>,
  )
  return { aoAssentar }
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

test('selo "Novo" e status de sincronização', () => {
  renderLinha({ novo: true, status: 'sincronizado' })
  expect(screen.getByText('Novo')).toBeInTheDocument()
  expect(screen.getByText('✓ salvo')).toBeInTheDocument()
})

test('preço unitário do servidor é exibido', () => {
  renderLinha({ item: item({ preco: 174, precoUnitario: 29 }) })
  expect(screen.getByText('R$ 29,00')).toBeInTheDocument()
})
