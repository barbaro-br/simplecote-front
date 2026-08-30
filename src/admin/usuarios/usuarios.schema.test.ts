import { describe, expect, it } from 'vitest'
import {
  usuarioSchema,
  usuarioListaSchema,
  usuarioFormSchema,
  redefinirSenhaFormSchema,
} from './usuarios.schema'

const UUID = '123e4567-e89b-12d3-a456-426614174000'

describe('usuarioSchema', () => {
  it('aceita a resposta do backend (papel ADMIN)', () => {
    const data = { id: UUID, nome: 'Ana', email: 'ana@x.com', papel: 'ADMIN', ativo: true }
    expect(() => usuarioSchema.parse(data)).not.toThrow()
  })

  it('aceita papel OPERADOR e ativo:false', () => {
    const data = { id: UUID, nome: 'Bia', email: 'bia@x.com', papel: 'OPERADOR', ativo: false }
    expect(() => usuarioSchema.parse(data)).not.toThrow()
  })

  it('rejeita papel fora do enum', () => {
    const data = { id: UUID, nome: 'Ana', email: 'ana@x.com', papel: 'ROOT', ativo: true }
    expect(() => usuarioSchema.parse(data)).toThrow()
  })

  it('usuarioListaSchema valida array e rejeita não-array', () => {
    expect(() => usuarioListaSchema.parse([])).not.toThrow()
    expect(() => usuarioListaSchema.parse('nope')).toThrow()
  })
})

describe('usuarioFormSchema', () => {
  it('exige nome e email e valida o formato do email', () => {
    const r = usuarioFormSchema.safeParse({ nome: '', email: 'x', papel: 'OPERADOR' })
    expect(r.success).toBe(false)
    if (!r.success) {
      const campos = r.error.issues.map((i) => i.path[0])
      expect(campos).toContain('nome')
      expect(campos).toContain('email')
    }
  })

  it('aceita um form válido (senha é checada no componente no modo criar)', () => {
    const r = usuarioFormSchema.safeParse({
      nome: 'Ana',
      email: 'ana@x.com',
      papel: 'ADMIN',
    })
    expect(r.success).toBe(true)
  })
})

describe('redefinirSenhaFormSchema', () => {
  it('rejeita senha com menos de 8 caracteres', () => {
    const r = redefinirSenhaFormSchema.safeParse({ senha: 'abc', confirmar: 'abc' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues.some((i) => i.path[0] === 'senha')).toBe(true)
  })

  it('rejeita quando senha e confirmar diferem (erro no campo confirmar)', () => {
    const r = redefinirSenhaFormSchema.safeParse({ senha: 'senha1234', confirmar: 'outra1234' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues.some((i) => i.path[0] === 'confirmar')).toBe(true)
  })

  it('aceita senhas iguais com 8+ caracteres', () => {
    const r = redefinirSenhaFormSchema.safeParse({ senha: 'senha1234', confirmar: 'senha1234' })
    expect(r.success).toBe(true)
  })
})
