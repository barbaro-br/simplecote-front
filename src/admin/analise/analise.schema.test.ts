import { describe, expect, it } from 'vitest'
import {
  dashboardSchema,
  insightProdutoSchema,
  insightProdutosMapSchema,
  insightEmpresaSchema,
} from './analise.schema'

describe('analise.schema', () => {
  describe('dashboardSchema', () => {
    it('aceita payload completo', () => {
      const data = {
        porStatus: { rascunho: 1, aberta: 2, encerrada: 0, apurada: 3, cancelada: 0 },
        encerradasSemApurar: 0,
        apuradasSemPedidoEnviado: 3,
        proximosPrazos: [
          {
            cotacaoId: '123e4567-e89b-12d3-a456-426614174000',
            titulo: 'Cotação XPTO',
            fechaEm: '2023-12-01T10:00:00Z',
          },
        ],
        gastoMes: 1500,
        gastoMesAnterior: 1200,
        economiaEstimada90d: 300,
        topProdutos: [{ nome: 'Caneta', valor: 100 }],
        topEmpresas: [{ nome: 'Kalunga', valor: 500 }],
      }
      expect(() => dashboardSchema.parse(data)).not.toThrow()
    })

    it('aceita listas vazias e contagens zeradas', () => {
      const data = {
        porStatus: { rascunho: 0, aberta: 0, encerrada: 0, apurada: 0, cancelada: 0 },
        encerradasSemApurar: 0,
        apuradasSemPedidoEnviado: 0,
        proximosPrazos: [],
        gastoMes: 0,
        gastoMesAnterior: 0,
        economiaEstimada90d: 0,
        topProdutos: [],
        topEmpresas: [],
      }
      expect(() => dashboardSchema.parse(data)).not.toThrow()
    })

    it('rejeita shape errado', () => {
      expect(() => dashboardSchema.parse({ porStatus: [] })).toThrow()
    })
  })

  describe('insightProdutoSchema e map', () => {
    it('aceita payload completo', () => {
      const data = {
        ultimaCompra: {
          cotacaoId: '123e4567-e89b-12d3-a456-426614174000',
          empresa: 'Papelaria XYZ',
          representante: 'João',
          precoUnitario: 15.50,
          data: '2023-10-15T00:00:00Z',
          quantidade: 10,
        },
        variacaoPct: -5.2,
        menorPrecoUnitario: 14.00,
        precoMedioUnitario90d: 15.00,
        compras: 5,
        fornecedoresDistintos: 3,
        serie: [
          { data: '2023-08-15T00:00:00Z', precoUnitario: 15.0 },
          { data: '2023-09-15T00:00:00Z', precoUnitario: 14.5 },
          { data: '2023-10-15T00:00:00Z', precoUnitario: 15.5 },
        ],
      }
      expect(() => insightProdutoSchema.parse(data)).not.toThrow()
    })

    it('aceita payload com nulos e serie vazia', () => {
      const data = {
        ultimaCompra: null,
        variacaoPct: null,
        menorPrecoUnitario: null,
        precoMedioUnitario90d: null,
        compras: 0,
        fornecedoresDistintos: 0,
        serie: [],
      }
      expect(() => insightProdutoSchema.parse(data)).not.toThrow()
    })

    it('valida o mapa de produtos', () => {
      const map = {
        '123e4567-e89b-12d3-a456-426614174000': {
          ultimaCompra: null,
          variacaoPct: null,
          menorPrecoUnitario: null,
          precoMedioUnitario90d: null,
          compras: 0,
          fornecedoresDistintos: 0,
          serie: [],
        },
      }
      expect(() => insightProdutosMapSchema.parse(map)).not.toThrow()
      expect(() => insightProdutosMapSchema.parse({})).not.toThrow()
    })
  })

  describe('insightEmpresaSchema', () => {
    it('aceita payload completo', () => {
      const data = {
        taxaResposta: { respondeu: 8, convidada: 10 },
        itensVencidos: 2,
        valorComprado: { total: '15000.00', ultimos90d: '5000.00' },
        ultimaCompra: { data: '2023-11-01T00:00:00Z', valor: '1200.00' },
        maisBarata: 5,
        segundoLugar: 3,
        produtosFornecidos: 12,
        tempoMedioRespostaSegundos: 3600,
      }
      expect(() => insightEmpresaSchema.parse(data)).not.toThrow()
    })

    it('aceita payload com nulos', () => {
      const data = {
        taxaResposta: null,
        itensVencidos: null,
        valorComprado: null,
        ultimaCompra: null,
        maisBarata: null,
        segundoLugar: null,
        produtosFornecidos: null,
        tempoMedioRespostaSegundos: null,
      }
      expect(() => insightEmpresaSchema.parse(data)).not.toThrow()
    })
  })
})
