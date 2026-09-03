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

// Bolha de progresso "N de T" da tela de preços: N conta só itens com preço
// informado (campo vazio = não cotado, não entra na contagem).
export function contarComPreco(itens: ItemLance[]): number {
  return itens.filter((i) => i.preco != null).length
}

// Heurística "item novo": o item ainda está PENDENTE enquanto pelo menos um
// outro item da mesma cotação já foi respondido (COTADO/NAO_COTADO) — sinal de
// que ele apareceu depois que o representante começou a responder. Inferido só
// dos status de lance já retornados, sem campo novo do backend.
export function itemEhNovo(item: ItemLance, todosItens: ItemLance[]): boolean {
  if (item.statusLance !== 'PENDENTE') return false
  return todosItens.some(
    (i) => i.itemCotacaoId !== item.itemCotacaoId && i.statusLance !== 'PENDENTE',
  )
}
