import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { useCriarProduto } from '@/admin/produtos/produtos.api'
import { useCriarEmpresa } from '@/admin/empresas/empresas.api'
import { useAbrir } from '@/admin/cotacoes/cotacoes.api'
import { useAtualizarConfiguracao } from '@/admin/configuracoes/configuracoes.api'
import { useCriarUsuario } from '@/admin/usuarios/usuarios.api'
import {
  useCriarRepresentante,
  useAtualizarRepresentante,
} from '@/admin/representantes/representantes.api'
import { useAdicionarItemColaborador } from '@/colaborador/colaborador.api'
import { useFinalizar } from '@/representante/cotacao/cotacao-token.api'
import { useConfirmarPedido } from '@/representante/pedido/pedido-token.api'
import { definirToken } from '@/shared/api/api-client'

/**
 * Teste-guarda de contrato do isolamento multitenant (change
 * `reforcar-isolamento-multitenant`): o front nunca transporta a identidade
 * do inquilino. Intercepta a requisição REAL serializada pelas mutations do
 * admin via MSW — não é grep estático, é a prova do contrato na rede.
 */

const PADROES_IDENTIFICADOR_INQUILINO = [/comprador/i, /tenant/i]

type Captura = {
  metodo: string
  url: string
  authorization: string | null
  corpo: unknown
}

let capturas: Captura[] = []

function capturar(pattern: string) {
  server.use(
    http.all(pattern, async ({ request }) => {
      const texto = await request.text()
      let corpo: unknown = null
      try {
        corpo = texto ? JSON.parse(texto) : null
      } catch {
        corpo = texto
      }
      const url = new URL(request.url)
      capturas.push({
        metodo: request.method,
        url: `${url.pathname}${url.search}`,
        authorization: request.headers.get('authorization'),
        corpo,
      })
      return HttpResponse.json({ id: 'resposta-guarda' })
    }),
  )
}

function chavesDoCorpo(corpo: unknown): string[] {
  if (corpo === null || corpo === undefined) return []
  if (Array.isArray(corpo)) return corpo.flatMap((item) => chavesDoCorpo(item))
  if (typeof corpo === 'object') {
    return Object.entries(corpo as Record<string, unknown>).flatMap(([chave, valor]) => [
      chave,
      ...chavesDoCorpo(valor),
    ])
  }
  return []
}

function assertSemIdentificadorDeInquilino(captura: Captura) {
  for (const chave of chavesDoCorpo(captura.corpo)) {
    if (PADROES_IDENTIFICADOR_INQUILINO.some((padrao) => padrao.test(chave))) {
      throw new Error(`payload transporta identificador de inquilino: "${chave}"`)
    }
  }
  if (PADROES_IDENTIFICADOR_INQUILINO.some((padrao) => padrao.test(captura.url))) {
    throw new Error(`URL transporta identificador de inquilino: ${captura.url}`)
  }
}

function wrapperFactory() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return Wrapper
}

beforeEach(() => {
  capturas = []
  sessionStorage.clear()
  definirToken(null)
})

afterEach(() => {
  sessionStorage.clear()
  definirToken(null)
})

test('criar produto não transporta identificador de inquilino', async () => {
  capturar('*/api/produtos')
  const { result } = renderHook(() => useCriarProduto(), { wrapper: wrapperFactory() })

  await result.current.mutateAsync({
    nome: 'Arroz Tipo 1 5kg',
    codigoBarras: '7891000100103',
    unidade: 'Fardo',
    quantidadePorEmbalagem: 12,
  })

  expect(capturas).toHaveLength(1)
  expect(capturas[0].metodo).toBe('POST')
  assertSemIdentificadorDeInquilino(capturas[0])
  expect(JSON.stringify(capturas[0].corpo)).toContain('Arroz Tipo 1 5kg')
})

test('criar empresa não transporta identificador de inquilino', async () => {
  capturar('*/api/empresas')
  const { result } = renderHook(() => useCriarEmpresa(), { wrapper: wrapperFactory() })

  await result.current.mutateAsync({ nome: 'Atacadão Central' })

  expect(capturas).toHaveLength(1)
  expect(capturas[0].metodo).toBe('POST')
  assertSemIdentificadorDeInquilino(capturas[0])
  expect(JSON.stringify(capturas[0].corpo)).toContain('Atacadão Central')
})

test('abrir cotação não transporta identificador de inquilino', async () => {
  capturar('*/api/cotacoes/*/abrir')
  const { result } = renderHook(() => useAbrir('cotacao-1'), { wrapper: wrapperFactory() })

  await result.current.mutateAsync({ prazo: '2026-09-10T12:00:00Z' })

  expect(capturas).toHaveLength(1)
  expect(capturas[0].metodo).toBe('POST')
  expect(capturas[0].url).toContain('/api/cotacoes/cotacao-1/abrir')
  assertSemIdentificadorDeInquilino(capturas[0])
  expect(JSON.stringify(capturas[0].corpo)).toContain('prazo')
})

test('salvar configurações não transporta identificador de inquilino', async () => {
  capturar('*/api/configuracoes')
  const { result } = renderHook(() => useAtualizarConfiguracao(), {
    wrapper: wrapperFactory(),
  })

  await result.current.mutateAsync({
    nome: 'Supermercado Boa Compra',
    corPrimaria: '#0f766e',
    telefone: '(11) 99999-0000',
    layoutEmail: 'PADRAO',
    estiloNavegacao: 'LATERAL',
    tema: 'CLARO',
  })

  expect(capturas).toHaveLength(1)
  expect(capturas[0].metodo).toBe('PUT')
  assertSemIdentificadorDeInquilino(capturas[0])
  expect(JSON.stringify(capturas[0].corpo)).toContain('Supermercado Boa Compra')
})

test('criar usuário não transporta identificador de inquilino', async () => {
  capturar('*/api/usuarios')
  const { result } = renderHook(() => useCriarUsuario(), { wrapper: wrapperFactory() })

  await result.current.mutateAsync({
    nome: 'Maria Silva',
    email: 'maria@loja.com',
    papel: 'ADMIN',
    senha: 'senha12345',
  })

  expect(capturas).toHaveLength(1)
  expect(capturas[0].metodo).toBe('POST')
  assertSemIdentificadorDeInquilino(capturas[0])
  expect(JSON.stringify(capturas[0].corpo)).toContain('maria@loja.com')
})

test('criar e editar representante não transportam identificador de inquilino', async () => {
  capturar('*/api/representantes')
  capturar('*/api/representantes/*')
  const criar = renderHook(() => useCriarRepresentante(), { wrapper: wrapperFactory() })
  const editar = renderHook(() => useAtualizarRepresentante(), { wrapper: wrapperFactory() })

  await criar.result.current.mutateAsync({
    empresaId: 'empresa-1',
    nome: 'João Souza',
    email: 'joao@fornecedor.com',
    whatsapp: '(11) 98888-7777',
  })
  await editar.result.current.mutateAsync({
    id: 'representante-1',
    body: { nome: 'João Souza Jr', email: 'joao.jr@fornecedor.com', whatsapp: '(11) 98888-7777' },
  })

  expect(capturas).toHaveLength(2)
  for (const captura of capturas) {
    assertSemIdentificadorDeInquilino(captura)
  }
  expect(JSON.stringify(capturas[0].corpo)).toContain('joao@fornecedor.com')
  expect(JSON.stringify(capturas[1].corpo)).toContain('joao.jr@fornecedor.com')
})

test('chamadas /public/** saem sem Authorization mesmo com sessão de admin na origem', async () => {
  // Simula o cenário da spec: mesma aplicação onde há uma sessão de admin em memória.
  definirToken('jwt-de-admin-herdado')

  capturar('*/public/colaborador/token-colab/itens')
  capturar('*/public/cotacoes/token-cot/finalizar')
  capturar('*/public/pedidos/token-pedido/confirmar')

  const colaborador = renderHook(() => useAdicionarItemColaborador('token-colab'), {
    wrapper: wrapperFactory(),
  })
  const cotacao = renderHook(() => useFinalizar('token-cot'), { wrapper: wrapperFactory() })
  const pedido = renderHook(() => useConfirmarPedido('token-pedido'), {
    wrapper: wrapperFactory(),
  })

  await colaborador.result.current.mutateAsync({
    cotacaoId: 'cotacao-1',
    produtoId: 'produto-1',
    quantidade: 2,
  })
  await cotacao.result.current.mutateAsync()
  await pedido.result.current.mutateAsync('Sem observações.')

  expect(capturas).toHaveLength(3)
  for (const captura of capturas) {
    expect(captura.authorization).toBeNull()
    assertSemIdentificadorDeInquilino(captura)
  }
  expect(JSON.stringify(capturas[0].corpo)).toContain('cotacao-1')
  expect(JSON.stringify(capturas[2].corpo)).toContain('Sem observações.')
})
