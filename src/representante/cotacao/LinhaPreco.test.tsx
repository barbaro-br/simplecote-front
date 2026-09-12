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
  const utils = render(<LinhaPreco item={item()} podeEditar aoAssentar={aoAssentar} {...props} />)
  return { aoAssentar, ...utils }
}

const campo = () => screen.getByLabelText(/preço da embalagem/i)
// O estado (vazio/pulado/salvando/salvo/offline/erro) não tem mais um ícone
// fixo pra mirar — vive só na cor da borda do campo, via `data-estado`.
const campoChip = () => campo().closest('[data-estado]') as HTMLElement

test('mostra nome, embalagem e código de barras', () => {
  renderLinha()
  expect(screen.getByText('arroz tipo 1 5kg')).toBeInTheDocument()
  expect(screen.getByText('fd c/ 6 · comprar 10')).toBeInTheDocument()
  expect(screen.getByText('7896006711234')).toBeInTheDocument()
})

// Regressão: achado real — o representante não sabia se era preço da unidade
// ou da embalagem inteira (a instrução completa existia, mas só pra leitor de
// tela, `sr-only`). Agora é visível em cima do campo.
test('instrução visível do que digitar: embalagem com mais de 1 unidade', () => {
  renderLinha({ item: item({ unidade: 'Caixa', quantidadePorEmbalagemSnapshot: 12 }) })
  expect(screen.getByText('Preço da caixa com 12')).toBeInTheDocument()
})

test('instrução visível do que digitar: unidade única', () => {
  renderLinha({ item: item({ unidade: 'Unidade', quantidadePorEmbalagemSnapshot: 1 }) })
  expect(screen.getByText('Preço de 1 unidade')).toBeInTheDocument()
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

test('selo "Novo" e status de sincronização (cor da borda, não ícone fixo)', () => {
  renderLinha({ novo: true, status: 'sincronizado' })
  expect(screen.getByText('Novo')).toBeInTheDocument()
  expect(campoChip()).toHaveAttribute('data-estado', 'salvo')
})

test('status "enviando" mostra spinner; "falhou" mostra ícone de sem conexão', () => {
  const { unmount } = renderLinha({ item: item({ preco: 40 }), status: 'enviando' })
  expect(screen.getByLabelText('salvando')).toBeInTheDocument()
  expect(campoChip()).toHaveAttribute('data-estado', 'salvando')
  unmount()
  renderLinha({ item: item({ preco: 40 }), status: 'falhou' })
  expect(screen.getByLabelText(/sem conexão/i)).toBeInTheDocument()
  expect(campoChip()).toHaveAttribute('data-estado', 'offline')
})

test('sem preço fica no estado "vazio" — nada no slot, sem botão de limpar', () => {
  renderLinha()
  expect(campoChip()).toHaveAttribute('data-estado', 'vazio')
  expect(screen.queryByRole('button', { name: /limpar/i })).not.toBeInTheDocument()
})

test('"pulado": sem preço mas outro item depois dele já foi respondido', () => {
  renderLinha({ pulado: true })
  expect(campoChip()).toHaveAttribute('data-estado', 'pulado')
})

test('"pulado" não se aplica a item que já tem preço', () => {
  renderLinha({ pulado: true, item: item({ preco: 12 }) })
  expect(campoChip()).toHaveAttribute('data-estado', 'salvo')
})

test('preço unitário aparece como dica quando a embalagem tem >1 unidade', () => {
  renderLinha({ item: item({ preco: 174, quantidadePorEmbalagemSnapshot: 6, precoUnitario: 29 }) })
  expect(screen.getByText(/≈\s*R\$\s29,00\/un/)).toBeInTheDocument()
})

test('embalagem de 1 unidade não mostra dica de unitário (seria o mesmo número)', () => {
  renderLinha({ item: item({ preco: 29, quantidadePorEmbalagemSnapshot: 1, precoUnitario: 29 }) })
  expect(screen.queryByText(/\/un/)).not.toBeInTheDocument()
})
