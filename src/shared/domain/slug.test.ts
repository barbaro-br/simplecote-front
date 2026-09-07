import { describe, it, expect } from 'vitest'
import {
  dominioDaLoja,
  nomeParaSlug,
  slugFormatoValido,
  slugReservado,
  urlLoginDaLoja,
} from './slug'

describe('nomeParaSlug', () => {
  it('minúsculas, sem acento e espaços → hífen', () => {
    expect(nomeParaSlug('Supermercado do Zé')).toBe('supermercado-do-ze')
  })

  it('símbolos viram hífen e hífens colapsam', () => {
    expect(nomeParaSlug('  A & B  ')).toBe('a-b')
  })

  it('trunca em 40 sem hífen final', () => {
    expect(nomeParaSlug('a'.repeat(50))).toBe('a'.repeat(40))
    expect(nomeParaSlug('a'.repeat(41) + '-')).toBe('a'.repeat(40))
  })
})

describe('slugFormatoValido', () => {
  it('aceita 3–40 alfanuméricos com hífen interno', () => {
    expect(slugFormatoValido('abc')).toBe(true)
    expect(slugFormatoValido('supermercado-do-ze')).toBe(true)
  })

  it('rejeita curto, hífen nas pontas e símbolos', () => {
    expect(slugFormatoValido('ab')).toBe(false)
    expect(slugFormatoValido('-abc')).toBe(false)
    expect(slugFormatoValido('abc-')).toBe(false)
    expect(slugFormatoValido('a b')).toBe(false)
  })
})

describe('slugReservado', () => {
  it('reserva hosts da plataforma', () => {
    expect(slugReservado('admin')).toBe(true)
    expect(slugReservado('www')).toBe(true)
    expect(slugReservado('api')).toBe(true)
    expect(slugReservado('login')).toBe(true)
  })

  it('não reserva nomes comuns', () => {
    expect(slugReservado('supermercado-do-ze')).toBe(false)
  })
})

describe('domínio da loja', () => {
  it('compõe o domínio e a URL de login', () => {
    expect(dominioDaLoja('mercado')).toBe('mercado.simplecote.app')
    expect(urlLoginDaLoja('mercado')).toBe('https://mercado.simplecote.app/login')
  })
})
