import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import {
  api,
  ApiError,
  SessaoExpiradaError,
  configurarSessaoExpirada,
  definirToken,
} from './api-client'

describe('api-client', () => {
  it('traduz falhas 400 ProblemDetail para ApiError', async () => {
    server.use(
      http.post('*/api/produtos', () => {
        return HttpResponse.json(
          {
            type: 'https://simplecote.com/errors/invalid',
            title: 'Parâmetros inválidos',
            status: 400,
            detail: 'O nome do produto é obrigatório.',
          },
          { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
        )
      })
    )

    await expect(api.post('/api/produtos', { nome: '' })).rejects.toThrow(ApiError)

    try {
      await api.post('/api/produtos', { nome: '' })
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      const apiError = e as ApiError
      expect(apiError.message).toBe('O nome do produto é obrigatório.')
      expect(apiError.problem.status).toBe(400)
    }
  })
})

describe('api-client — 401 / sessão expirada com refresh', () => {
  const handler = vi.fn()

  beforeEach(() => {
    handler.mockClear()
    configurarSessaoExpirada(handler)
    definirToken(null)
  })

  afterEach(() => {
    configurarSessaoExpirada(() => {})
    definirToken(null)
  })

  it('401 numa chamada autenticada → refresh ok → repete a requisição original e resolve', async () => {
    definirToken('tok-expirado')
    let chamadas = 0
    server.use(
      http.get('*/api/produtos', ({ request }) => {
        chamadas += 1
        return request.headers.get('authorization') === 'Bearer tok-novo'
          ? HttpResponse.json([{ nome: 'Arroz' }])
          : new HttpResponse(null, { status: 401 })
      }),
      http.post('*/api/auth/refresh', () => HttpResponse.json({ token: 'tok-novo' }))
    )

    const resultado = await api.get('/api/produtos')

    expect(resultado).toEqual([{ nome: 'Arroz' }])
    expect(chamadas).toBe(2)
    expect(handler).not.toHaveBeenCalled()
  })

  it('401 → refresh falha → SessaoExpiradaError e handler acionado 1x', async () => {
    definirToken('tok-expirado')
    server.use(
      http.get('*/api/produtos', () => new HttpResponse(null, { status: 401 })),
      http.post('*/api/auth/refresh', () => new HttpResponse(null, { status: 401 }))
    )

    await expect(api.get('/api/produtos')).rejects.toBeInstanceOf(SessaoExpiradaError)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('dois 401 concorrentes → um único hit em /api/auth/refresh e ambas resolvem', async () => {
    definirToken('tok-expirado')
    let hitsRefresh = 0
    server.use(
      http.get('*/api/a', ({ request }) =>
        request.headers.get('authorization') === 'Bearer tok-novo'
          ? HttpResponse.json({ a: 1 })
          : new HttpResponse(null, { status: 401 })
      ),
      http.get('*/api/b', ({ request }) =>
        request.headers.get('authorization') === 'Bearer tok-novo'
          ? HttpResponse.json({ b: 2 })
          : new HttpResponse(null, { status: 401 })
      ),
      http.post('*/api/auth/refresh', async () => {
        hitsRefresh += 1
        await new Promise((resolve) => setTimeout(resolve, 20))
        return HttpResponse.json({ token: 'tok-novo' })
      })
    )

    const [a, b] = await Promise.all([api.get('/api/a'), api.get('/api/b')])

    expect(a).toEqual({ a: 1 })
    expect(b).toEqual({ b: 2 })
    expect(hitsRefresh).toBe(1)
    expect(handler).not.toHaveBeenCalled()
  })

  it('401 numa chamada SEM token enviado → ApiError normal, não chama o handler', async () => {
    // Página pública (colaborador/representante) sem sessão de admin encosta num
    // endpoint /api/** (ex: /api/configuracoes do provider global): 401 aqui é
    // "precisa logar pra este recurso", não "sessão expirada" — não pode jogar o
    // visitante pro /login.
    server.use(http.get('*/api/configuracoes', () => new HttpResponse(null, { status: 401 })))

    await expect(api.get('/api/configuracoes')).rejects.toBeInstanceOf(ApiError)
    expect(handler).not.toHaveBeenCalled()
  })

  it('401 de POST /api/auth/login continua virando ApiError e não chama o handler', async () => {
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Não autorizado', status: 401, detail: 'Credenciais inválidas.' },
          { status: 401, headers: { 'Content-Type': 'application/problem+json' } }
        )
      )
    )

    await expect(api.post('/api/auth/login', { email: 'a@b.c', senha: 'x' })).rejects.toBeInstanceOf(ApiError)
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('api-client — 404 restrito a lookup', () => {
  it('api.get(endpoint, { lookup: true }) em 404 sem problem+json → null', async () => {
    server.use(http.get('*/api/x', () => new HttpResponse(null, { status: 404 })))

    await expect(api.get('/api/x', { lookup: true })).resolves.toBeNull()
  })

  it('api.get(endpoint) sem lookup em 404 → ApiError', async () => {
    server.use(http.get('*/api/x', () => new HttpResponse(null, { status: 404 })))

    await expect(api.get('/api/x')).rejects.toBeInstanceOf(ApiError)
  })
})
