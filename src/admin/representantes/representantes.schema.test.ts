import { describe, expect, it } from 'vitest'
import {
  representanteSchema,
  representanteListaSchema,
  representanteFormSchema,
} from './representantes.schema'

const UUID = '123e4567-e89b-12d3-a456-426614174000'

describe('representanteSchema', () => {
  it('aceita a resposta do backend com whatsapp null e ativo:false', () => {
    const data = {
      id: UUID,
      empresaId: UUID,
      nome: 'João Silva',
      email: 'joao@empresa.com',
      whatsapp: null,
      ativo: false,
    }
    expect(() => representanteSchema.parse(data)).not.toThrow()
  })

  it('aceita whatsapp string e ativo:true', () => {
    const data = {
      id: UUID,
      empresaId: UUID,
      nome: 'Maria',
      email: 'maria@empresa.com',
      whatsapp: '(11) 99999-9999',
      ativo: true,
    }
    expect(() => representanteSchema.parse(data)).not.toThrow()
  })

  it('rejeita shape sem empresaId', () => {
    const data = {
      id: UUID,
      nome: 'João',
      email: 'joao@empresa.com',
      whatsapp: null,
      ativo: true,
    }
    expect(() => representanteSchema.parse(data)).toThrow()
  })

  it('representanteListaSchema valida um array e rejeita não-array', () => {
    expect(() => representanteListaSchema.parse([])).not.toThrow()
    expect(() => representanteListaSchema.parse({})).toThrow()
  })
})

describe('representanteFormSchema', () => {
  it('exige nome e email', () => {
    const r = representanteFormSchema.safeParse({ empresaId: '', nome: '', email: '' })
    expect(r.success).toBe(false)
    if (!r.success) {
      const campos = r.error.issues.map((i) => i.path[0])
      expect(campos).toContain('nome')
      expect(campos).toContain('email')
    }
  })

  it('rejeita email em formato inválido', () => {
    const r = representanteFormSchema.safeParse({
      empresaId: UUID,
      nome: 'João',
      email: 'nao-e-email',
    })
    expect(r.success).toBe(false)
  })

  it('aceita um form válido (whatsapp opcional)', () => {
    const r = representanteFormSchema.safeParse({
      empresaId: UUID,
      nome: 'João',
      email: 'joao@empresa.com',
    })
    expect(r.success).toBe(true)
  })
})
