import { sanitizarEntradaValor, valorParaNumero } from './preco'

describe('sanitizarEntradaValor', () => {
  it('remove letras e símbolos, mantém dígitos e o separador', () => {
    expect(sanitizarEntradaValor('R$ 12,5abc')).toBe('12,5')
    expect(sanitizarEntradaValor('1a2b3')).toBe('123')
  })

  it('nunca deixa passar sinal negativo', () => {
    expect(sanitizarEntradaValor('-5')).toBe('5')
    expect(sanitizarEntradaValor('12-')).toBe('12')
  })

  it('rejeita 3ª casa decimal (mantém o valor anterior)', () => {
    expect(sanitizarEntradaValor('12,345')).toBeNull()
    expect(sanitizarEntradaValor('9.999')).toBeNull()
  })

  it('aceita até 2 casas decimais', () => {
    expect(sanitizarEntradaValor('12,34')).toBe('12,34')
    expect(sanitizarEntradaValor('0.05')).toBe('0.05')
  })

  it('rejeita um segundo separador', () => {
    expect(sanitizarEntradaValor('1.2.3')).toBeNull()
    expect(sanitizarEntradaValor('1,2,3')).toBeNull()
  })

  it('permite string vazia (limpar o campo)', () => {
    expect(sanitizarEntradaValor('')).toBe('')
  })
})

describe('valorParaNumero', () => {
  it('converte vírgula e ponto', () => {
    expect(valorParaNumero('12,5')).toBe(12.5)
    expect(valorParaNumero('12.5')).toBe(12.5)
  })

  it('vazio ou só separador vira NaN', () => {
    expect(valorParaNumero('')).toBeNaN()
    expect(valorParaNumero(',')).toBeNaN()
    expect(valorParaNumero('.')).toBeNaN()
  })
})
