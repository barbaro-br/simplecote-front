import { describe, it, expect } from 'vitest'
import { prazoExpirando, contarComPreco } from './cotacao-token.derivados'
import type { ItemLance } from './cotacao-token.schema'

describe('cotacao-token.derivados', () => {
  describe('prazoExpirando', () => {
    it('retorna falso se não tem prazo', () => {
      expect(prazoExpirando(null)).toBe(false)
    })

    it('retorna falso se já expirou (diff <= 0)', () => {
      const agora = new Date('2026-08-30T12:00:00Z')
      expect(prazoExpirando('2026-08-30T10:00:00Z', agora)).toBe(false)
      expect(prazoExpirando('2026-08-30T12:00:00Z', agora)).toBe(false)
    })

    it('retorna verdadeiro se faltam menos de 2h', () => {
      const agora = new Date('2026-08-30T10:00:00Z')
      // 1h59m no futuro
      expect(prazoExpirando('2026-08-30T11:59:00Z', agora)).toBe(true)
    })

    it('retorna falso se faltam 2h ou mais', () => {
      const agora = new Date('2026-08-30T10:00:00Z')
      // Exatamente 2h
      expect(prazoExpirando('2026-08-30T12:00:00Z', agora)).toBe(false)
      // 2h01m
      expect(prazoExpirando('2026-08-30T12:01:00Z', agora)).toBe(false)
    })
  })

  describe('contarComPreco', () => {
    it('conta só itens com preço informado (NAO_COTADO não entra)', () => {
      const itens = [
        { preco: null, statusLance: 'PENDENTE' },
        { preco: 10, statusLance: 'COTADO' },
        { preco: null, statusLance: 'NAO_COTADO' },
        { preco: 0, statusLance: 'COTADO' },
      ] as ItemLance[]

      expect(contarComPreco(itens)).toBe(2)
      expect(contarComPreco([])).toBe(0)
    })
  })
})
