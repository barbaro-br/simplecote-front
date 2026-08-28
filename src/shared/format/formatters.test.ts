import { describe, it, expect } from 'vitest'
import { moeda, dataHoraBr } from './formatters'

describe('formatters', () => {
  it('formata moeda em reais', () => {
    // Note: Node environment might output "R$ 128,50" or "R$ 128.50" depending on locale data in node,
    // but with pt-BR it should use comma. Let's normalize space to avoid NO-BREAK SPACE issues.
    const result = moeda(128.5).replace(/\u00A0/g, ' ')
    expect(result).toBe('R$ 128,50')
  })

  it('formata data UTC para America/Sao_Paulo em pt-BR', () => {
    // 18:00 UTC = 15:00 BRT
    const result = dataHoraBr('2026-08-28T18:00:00Z')
    expect(result).toBe('28/08/2026, 15:00')
  })
})
