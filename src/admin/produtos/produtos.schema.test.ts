import { describe, expect, it } from 'vitest'
import {
  produtoSchema,
  tiposDeEmbalagem,
  rotulosEmbalagem,
  normalizarTipoEmbalagem,
} from './produtos.schema'

describe('produtos.schema', () => {
  it('converte o nome do produto para letras maiúsculas e remove espaços das pontas', () => {
    const parsed = produtoSchema.parse({
      nome: '  arroz branco tipo 1 5kg  ',
      codigoBarras: '7891234567890',
      unidade: 'Fardo',
      quantidadePorEmbalagem: 6,
    })
    expect(parsed.nome).toBe('ARROZ BRANCO TIPO 1 5KG')
  })

  it('possui a lista padronizada de tipos de embalagem com siglas', () => {
    expect(tiposDeEmbalagem).toEqual([
      'Caixa',
      'Fardo',
      'Pacote',
      'Display',
      'Unidade',
      'Dúzia',
      'Cartela',
      'Balde',
      'Lata',
    ])
    expect(rotulosEmbalagem.Caixa).toBe('Caixa (CX)')
    expect(rotulosEmbalagem.Fardo).toBe('Fardo (FD)')
    expect(rotulosEmbalagem.Pacote).toBe('Pacote (PCT)')
    expect(rotulosEmbalagem.Display).toBe('Display (DP)')
    expect(rotulosEmbalagem.Unidade).toBe('Unidade (UN)')
    expect(rotulosEmbalagem.Dúzia).toBe('Dúzia (DZ)')
  })

  it('normalizarTipoEmbalagem converte abreviações e termos populares para o tipo canônico', () => {
    expect(normalizarTipoEmbalagem('cx')).toBe('Caixa')
    expect(normalizarTipoEmbalagem('CAIXA')).toBe('Caixa')
    expect(normalizarTipoEmbalagem('fd')).toBe('Fardo')
    expect(normalizarTipoEmbalagem('pct')).toBe('Pacote')
    expect(normalizarTipoEmbalagem('pcte')).toBe('Pacote')
    expect(normalizarTipoEmbalagem('dp')).toBe('Display')
    expect(normalizarTipoEmbalagem('display')).toBe('Display')
    expect(normalizarTipoEmbalagem('disp')).toBe('Display')
    expect(normalizarTipoEmbalagem('un')).toBe('Unidade')
    expect(normalizarTipoEmbalagem('und')).toBe('Unidade')
    expect(normalizarTipoEmbalagem('dz')).toBe('Dúzia')
    expect(normalizarTipoEmbalagem('crt')).toBe('Cartela')
    expect(normalizarTipoEmbalagem('bd')).toBe('Balde')
    expect(normalizarTipoEmbalagem('lt')).toBe('Lata')
    expect(normalizarTipoEmbalagem('')).toBe('Caixa')
    expect(normalizarTipoEmbalagem(null)).toBe('Caixa')
    expect(normalizarTipoEmbalagem(undefined)).toBe('Caixa')
  })
})
