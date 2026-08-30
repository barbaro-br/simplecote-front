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
        porStatus: { ABERTA: 2, RASCUNHO: 1 },
        contadores: { encerradasSemApurar: 0, apuradasSemPedido: 3 },
        proximosPrazos: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            titulo: 'Cotação XPTO',
            fechaEm: '2023-12-01T10:00:00Z',
          },
        ],
        gastos: {
          mesAtual: '1500.00',
          mesAnterior: '1200.00',
          variacaoPct: '25.0',
          economia90d: '300.00',
        },
        topProdutos: [{ nome: 'Caneta', valor: '100.00' }],
        topEmpresas: [{ nome: 'Kalunga', valor: '500.00' }],
      }
      expect(() => dashboardSchema.parse(data)).not.toThrow()
    })

    it('aceita listas vazias e mapa {}', () => {
      const data = {
        porStatus: {},
        contadores: { encerradasSemApurar: 0, apuradasSemPedido: 0 },
        proximosPrazos: [],
        gastos: {
          mesAtual: '0.00',
          mesAnterior: '0.00',
          variacaoPct: null,
          economia90d: '0.00',
        },
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
          precoUnitario: '15.50',
          data: '2023-10-15T00:00:00Z',
          quantidade: 10,
        },
        variacaoPct: '-5.2',
        menorPreco: '14.00',
        media90d: '15.00',
        numeroCompras: 5,
        numeroFornecedores: 3,
        serie: [15.0, 14.5, 15.5],
      }
      expect(() => insightProdutoSchema.parse(data)).not.toThrow()
    })

    it('aceita payload com nulos e serie vazia', () => {
      const data = {
        ultimaCompra: null,
        variacaoPct: null,
        menorPreco: null,
        media90d: null,
        numeroCompras: null,
        numeroFornecedores: null,
        serie: [],
      }
      expect(() => insightProdutoSchema.parse(data)).not.toThrow()
    })

    it('valida o mapa de produtos', () => {
      const map = {
        '123e4567-e89b-12d3-a456-426614174000': {
          ultimaCompra: null,
          variacaoPct: null,
          menorPreco: null,
          media90d: null,
          numeroCompras: null,
          numeroFornecedores: null,
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
