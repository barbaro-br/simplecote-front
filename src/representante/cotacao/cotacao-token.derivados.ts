import type { ItemLance } from './cotacao-token.schema'

export function prazoExpirando(prazo: string | null, agora: Date = new Date()): boolean {
  if (!prazo) return false
  const p = new Date(prazo).getTime()
  const a = agora.getTime()
  const diff = p - a
  if (diff <= 0) return false // Já expirou
  const DUAS_HORAS_EM_MS = 2 * 60 * 60 * 1000
  return diff < DUAS_HORAS_EM_MS
}

export function contarRespondidos(itens: ItemLance[]): number {
  return itens.filter((i) => i.preco != null || i.statusLance === 'NAO_COTADO').length
}
