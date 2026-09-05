import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/setupTests'
import { ApiError } from '@/shared/api/api-client'
import {
  buscarDashboard,
  buscarInsightProdutos,
  buscarInsightEmpresa,
} from './analise.api'

describe('analise.api', () => {
  it('buscarDashboard: mapeia a resposta OK', async () => {
    server.use(
      http.get('*/api/analises/dashboard', () => {
        return HttpResponse.json({
          porStatus: { rascunho: 0, aberta: 1, encerrada: 0, apurada: 0, cancelada: 0 },
          encerradasSemApurar: 0,
          apuradasSemPedidoEnviado: 1,
          proximosPrazos: [],
          gastoMes: 100,
          gastoMesAnterior: 50,
          economiaEstimada90d: 10,
          topProdutos: [],
          topEmpresas: [],
        })
      })
    )

    const res = await buscarDashboard()
    expect(res.porStatus.aberta).toBe(1)
  })

  it('buscarDashboard: rejeita com ApiError se o schema for inválido', async () => {
    server.use(
      http.get('*/api/analises/dashboard', () => {
        return HttpResponse.json({ formatoErrado: true })
      })
    )

    await expect(buscarDashboard()).rejects.toThrow(ApiError)
  })

  it('buscarInsightProdutos: mapeia a resposta OK', async () => {
    server.use(
      http.get('*/api/analises/produtos/insight', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('ids')).toBe('123e4567-e89b-12d3-a456-426614174000,123e4567-e89b-12d3-a456-426614174001')
        return HttpResponse.json({
          '123e4567-e89b-12d3-a456-426614174000': {
            ultimaCompra: null,
            variacaoPct: null,
            menorPrecoUnitario: null,
            precoMedioUnitario90d: null,
            compras: 0,
            fornecedoresDistintos: 0,
            serie: [],
          },
        })
      })
    )

    const res = await buscarInsightProdutos(['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'])
    expect(res['123e4567-e89b-12d3-a456-426614174000']).toBeDefined()
  })

  it('buscarInsightProdutos: 400 vira ApiError', async () => {
    server.use(
      http.get('*/api/analises/produtos/insight', () => {
        return HttpResponse.json(
          { title: 'Bad Request', status: 400 },
          { status: 400 }
        )
      })
    )

    await expect(buscarInsightProdutos(['123'])).rejects.toThrow(ApiError)
  })

  it('buscarInsightProdutos: não dispara request se ids for vazio', async () => {
    let callCount = 0
    server.use(
      http.get('*/api/analises/produtos/insight', () => {
        callCount++
        return HttpResponse.json({})
      })
    )

    const res = await buscarInsightProdutos([])
    expect(res).toEqual({})
    expect(callCount).toBe(0)
  })

  it('buscarInsightEmpresa: mapeia a resposta OK', async () => {
    server.use(
      http.get('*/api/analises/empresas/:id/insight', ({ params }) => {
        expect(params.id).toBe('789')
        return HttpResponse.json({
          taxaResposta: { respondeu: 1, convidada: 1 },
          itensVencidos: 0,
          valorComprado: { total: '100', ultimos90d: '100' },
          ultimaCompra: { data: '2023-11-01', valor: '100' },
          maisBarata: 1,
          segundoLugar: 0,
          produtosFornecidos: 1,
          tempoMedioRespostaSegundos: 3600,
        })
      })
    )

    const res = await buscarInsightEmpresa('789')
    expect(res.itensVencidos).toBe(0)
  })

  it('buscarInsightEmpresa: 422 vira ApiError', async () => {
    server.use(
      http.get('*/api/analises/empresas/:id/insight', () => {
        return HttpResponse.json(
          { title: 'Unprocessable Entity', status: 422 },
          { status: 422 }
        )
      })
    )

    await expect(buscarInsightEmpresa('789')).rejects.toThrow(ApiError)
  })
})
