/**
 * Sanitiza o que a pessoa digita num campo de valor monetário/percentual:
 * mantém só dígitos e um separador decimal (`.` ou `,`), no máximo 2 casas
 * depois dele, e nunca sinal negativo nem letras. Não formata — devolve o
 * texto "cru" pronto pra ficar no `value` do input.
 *
 * Retorna `null` quando a edição deve ser **rejeitada** (ex.: 3ª casa decimal,
 * segundo separador) — nesse caso o chamador mantém o valor anterior.
 */
export function sanitizarEntradaValor(bruto: string): string | null {
  const limpo = bruto.replace(/[^0-9.,]/g, '')
  const partes = limpo.replace(',', '.').split('.')
  if (partes.length > 2) return null
  if (partes[1] !== undefined && partes[1].length > 2) return null
  return limpo
}

/**
 * Converte o texto sanitizado para número (`,` → `.`). `NaN` se vazio/incompleto.
 */
export function valorParaNumero(texto: string): number {
  const t = texto.trim()
  if (t === '' || t === '.' || t === ',') return Number.NaN
  return Number(t.replace(',', '.'))
}
