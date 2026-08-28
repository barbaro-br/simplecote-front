import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { api, ApiError, SessaoExpiradaError, configurarSessaoExpirada } from './api-client'

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

describe('api-client — 401 / sessão expirada', () => {
  const handler = vi.fn()

  beforeEach(() => {
    sessionStorage.setItem('simplecote_token', 'tok-123')
    handler.mockClear()
    configurarSessaoExpirada(handler)
  })

  afterEach(() => {
    configurarSessaoExpirada(() => {})
    sessionStorage.clear()
  })

  it('401 numa chamada autenticada → limpa sessão, chama o handler 1x e rejeita com SessaoExpiradaError', async () => {
    server.use(http.get('*/api/produtos', () => new HttpResponse(null, { status: 401 })))

    await expect(api.get('/api/produtos')).rejects.toBeInstanceOf(SessaoExpiradaError)
    expect(sessionStorage.getItem('simplecote_token')).toBeNull()
    expect(handler).toHaveBeenCalledTimes(1)
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
