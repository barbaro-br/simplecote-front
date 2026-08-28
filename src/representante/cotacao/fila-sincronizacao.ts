// Fila de sincronização do representante (spec.md §10.2) — módulo puro sobre
// localStorage. Nunca propaga exceção: aba anônima, quota cheia ou storage
// desabilitado degradam para "fila só em memória do componente".

export type EntradaFila = {
  preco?: number
  naoCotado?: boolean
  tentativas: number
  ultimaTentativaEm: number
}

export type Fila = Record<string, EntradaFila>

const chave = (token: string) => `simplecote:fila:${token}`

export function lerFila(token: string): Fila {
  try {
    const bruto = localStorage.getItem(chave(token))
    if (!bruto) return {}
    const parsed = JSON.parse(bruto) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Fila) : {}
  } catch {
    return {}
  }
}

function escrever(token: string, fila: Fila): void {
  try {
    if (Object.keys(fila).length === 0) {
      localStorage.removeItem(chave(token))
    } else {
      localStorage.setItem(chave(token), JSON.stringify(fila))
    }
  } catch {
    // storage indisponível — o chamador segue com a fila em memória
  }
}

/**
 * Grava/atualiza a entrada de um item. `patch` é o valor mais recente
 * (`preco` OU `naoCotado`); zera `tentativas` numa edição nova e carimba
 * `ultimaTentativaEm`. Devolve a fila resultante.
 */
export function gravarEntrada(
  token: string,
  itemCotacaoId: string,
  patch: { preco?: number; naoCotado?: boolean },
): Fila {
  const fila = lerFila(token)
  fila[itemCotacaoId] = {
    preco: patch.naoCotado ? undefined : patch.preco,
    naoCotado: patch.naoCotado ? true : undefined,
    tentativas: 0,
    ultimaTentativaEm: Date.now(),
  }
  escrever(token, fila)
  return fila
}

/** Marca uma nova tentativa falha (mantém a entrada, incrementa `tentativas`). */
export function registrarFalha(token: string, itemCotacaoId: string): Fila {
  const fila = lerFila(token)
  const atual = fila[itemCotacaoId]
  if (atual) {
    fila[itemCotacaoId] = {
      ...atual,
      tentativas: atual.tentativas + 1,
      ultimaTentativaEm: Date.now(),
    }
    escrever(token, fila)
  }
  return fila
}

export function removerEntrada(token: string, itemCotacaoId: string): Fila {
  const fila = lerFila(token)
  delete fila[itemCotacaoId]
  escrever(token, fila)
  return fila
}

export function limparFila(token: string): void {
  try {
    localStorage.removeItem(chave(token))
  } catch {
    // ignora
  }
}
