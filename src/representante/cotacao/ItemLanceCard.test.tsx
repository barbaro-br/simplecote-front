import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ItemLanceCard } from './ItemLanceCard'
import type { ItemLance } from './cotacao-token.schema'

const baseItem: ItemLance = {
  itemCotacaoId: 'i-1',
  nome: 'Arroz',
  codigoBarras: null,
  unidade: 'Pct',
  quantidadeSolicitada: 10,
  quantidadePorEmbalagemSnapshot: 1,
  preco: null,
  precoUnitario: null,
  statusLance: 'PENDENTE'
}

describe('ItemLanceCard', () => {
  it('alternar para Não cotado desabilita o input e dispara aoAssentar({ naoCotado: true })', async () => {
    const user = userEvent.setup()
    const aoAssentar = vi.fn()
    
    render(
      <ItemLanceCard 
        item={baseItem} 
        podeEditar={true} 
        status={undefined} 
        erro={undefined} 
        aoAssentar={aoAssentar} 
      />
    )

    const btnNaoCotado = screen.getByRole('button', { name: /não cotado/i })
    const btnVouCotar = screen.getByRole('button', { name: /vou cotar/i })
    const input = screen.getByRole('spinbutton', { name: /preço da embalagem/i })

    expect(input).toBeEnabled()
    
    await user.click(btnNaoCotado)
    
    expect(input).toBeDisabled()
    
    await waitFor(() => {
      expect(aoAssentar).toHaveBeenCalledWith({ naoCotado: true })
    })

    await user.click(btnVouCotar)
    expect(input).toBeEnabled()
  })
})
