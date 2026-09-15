import { describe, expect, it } from 'vitest'
import { empresaSchema } from './empresas.schema'

describe('empresaSchema', () => {
  it('converte o nome da empresa e do representante para letras maiúsculas com trim', () => {
    const parsed = empresaSchema.parse({
      nome: '  distribuidora brasil ltda  ',
      nomeRepresentante: '  joão batista da silva  ',
      emailRepresentante: 'joao@brasil.com',
      whatsappRepresentante: '11999999999',
      pedidoMinimo: 500,
    })

    expect(parsed.nome).toBe('DISTRIBUIDORA BRASIL LTDA')
    expect(parsed.nomeRepresentante).toBe('JOÃO BATISTA DA SILVA')
  })

  it('exige nome, nomeRepresentante e email válido', () => {
    expect(() =>
      empresaSchema.parse({
        nome: '',
        nomeRepresentante: 'Carlos',
        emailRepresentante: 'carlos@empresa.com',
      }),
    ).toThrow('Nome é obrigatório')

    expect(() =>
      empresaSchema.parse({
        nome: 'Empresa',
        nomeRepresentante: '',
        emailRepresentante: 'carlos@empresa.com',
      }),
    ).toThrow('Nome do representante é obrigatório')

    expect(() =>
      empresaSchema.parse({
        nome: 'Empresa',
        nomeRepresentante: 'Carlos',
        emailRepresentante: 'email-invalido',
      }),
    ).toThrow('E-mail inválido')
  })
})
