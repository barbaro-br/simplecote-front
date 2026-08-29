import {
  gravarEntrada,
  lerFila,
  limparFila,
  registrarFalha,
  removerEntrada,
} from './fila-sincronizacao'

const TOKEN = 'tok-abc'

const mockStore: Record<string, string> = {}
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => mockStore[k] || null,
    setItem: (k: string, v: string) => { mockStore[k] = String(v) },
    removeItem: (k: string) => delete mockStore[k],
    clear: () => { for (const k in mockStore) delete mockStore[k] }
  }
})

beforeEach(() => globalThis.localStorage.clear())

test('gravar / ler / remover / limpar', () => {
  expect(lerFila(TOKEN)).toEqual({})

  gravarEntrada(TOKEN, 'i-1', { preco: 12.5 })
  gravarEntrada(TOKEN, 'i-2', { naoCotado: true })

  const fila = lerFila(TOKEN)
  expect(Object.keys(fila)).toEqual(['i-1', 'i-2'])
  expect(fila['i-1']).toMatchObject({ preco: 12.5, tentativas: 0 })
  expect(fila['i-2']).toMatchObject({ naoCotado: true, tentativas: 0 })
  expect(fila['i-2'].preco).toBeUndefined()

  removerEntrada(TOKEN, 'i-1')
  expect(Object.keys(lerFila(TOKEN))).toEqual(['i-2'])

  limparFila(TOKEN)
  expect(lerFila(TOKEN)).toEqual({})
  expect(localStorage.getItem(`simplecote:fila:${TOKEN}`)).toBeNull()
})

test('registrarFalha incrementa tentativas e mantém a entrada', () => {
  gravarEntrada(TOKEN, 'i-1', { preco: 9 })
  registrarFalha(TOKEN, 'i-1')
  registrarFalha(TOKEN, 'i-1')
  expect(lerFila(TOKEN)['i-1'].tentativas).toBe(2)
})

test('nova edição do mesmo item sobrescreve a entrada e zera tentativas', () => {
  gravarEntrada(TOKEN, 'i-1', { preco: 9 })
  registrarFalha(TOKEN, 'i-1')
  gravarEntrada(TOKEN, 'i-1', { preco: 15 })
  expect(lerFila(TOKEN)['i-1']).toMatchObject({ preco: 15, tentativas: 0 })
})

test('fila vazia remove a chave do localStorage', () => {
  gravarEntrada(TOKEN, 'i-1', { preco: 1 })
  removerEntrada(TOKEN, 'i-1')
  expect(localStorage.getItem(`simplecote:fila:${TOKEN}`)).toBeNull()
})

test('localStorage quebrado não propaga exceção', () => {
  const orig = Object.getOwnPropertyDescriptor(window, 'localStorage')!
  const quebrado = {
    getItem: () => {
      throw new Error('SecurityError')
    },
    setItem: () => {
      throw new Error('QuotaExceeded')
    },
    removeItem: () => {
      throw new Error('SecurityError')
    },
    clear: () => {},
  }
  Object.defineProperty(window, 'localStorage', { value: quebrado, configurable: true })
  try {
    expect(() => gravarEntrada(TOKEN, 'i-1', { preco: 1 })).not.toThrow()
    expect(lerFila(TOKEN)).toEqual({})
    expect(() => removerEntrada(TOKEN, 'i-1')).not.toThrow()
    expect(() => limparFila(TOKEN)).not.toThrow()
  } finally {
    Object.defineProperty(window, 'localStorage', orig)
  }
})
