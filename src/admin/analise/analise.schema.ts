import { z } from 'zod'

export const dashboardSchema = z.object({
  porStatus: z.record(z.string(), z.number()),
  contadores: z.object({
    encerradasSemApurar: z.number(),
    apuradasSemPedido: z.number(),
  }),
  proximosPrazos: z.array(
    z.object({
      id: z.string().uuid(),
      titulo: z.string(),
      fechaEm: z.string(),
    })
  ),
  gastos: z.object({
    mesAtual: z.string(),
    mesAnterior: z.string(),
    variacaoPct: z.string().nullable(),
    economia90d: z.string(),
  }),
  topProdutos: z.array(
    z.object({
      nome: z.string(),
      valor: z.string(),
    })
  ).max(5),
  topEmpresas: z.array(
    z.object({
      nome: z.string(),
      valor: z.string(),
    })
  ).max(5),
})

export const insightProdutoSchema = z.object({
  ultimaCompra: z.object({
    cotacaoId: z.string().uuid().nullable(),
    empresa: z.string(),
    representante: z.string(),
    precoUnitario: z.string(),
    data: z.string(),
    quantidade: z.number(),
  }).nullable(),
  variacaoPct: z.string().nullable(),
  menorPreco: z.string().nullable(),
  media90d: z.string().nullable(),
  numeroCompras: z.number().nullable(),
  numeroFornecedores: z.number().nullable(),
  serie: z.array(z.number()).max(6),
})

export const insightProdutosMapSchema = z.record(
  z.string().uuid(),
  insightProdutoSchema
)

export const insightEmpresaSchema = z.object({
  taxaResposta: z.object({
    respondeu: z.number(),
    convidada: z.number(),
  }).nullable(),
  itensVencidos: z.number().nullable(),
  valorComprado: z.object({
    total: z.string(),
    ultimos90d: z.string(),
  }).nullable(),
  ultimaCompra: z.object({
    data: z.string(),
    valor: z.string(),
  }).nullable(),
  maisBarata: z.number().nullable(),
  segundoLugar: z.number().nullable(),
  produtosFornecidos: z.number().nullable(),
  tempoMedioRespostaSegundos: z.number().nullable(),
})

export type Dashboard = z.infer<typeof dashboardSchema>
export type InsightProduto = z.infer<typeof insightProdutoSchema>
export type InsightEmpresa = z.infer<typeof insightEmpresaSchema>
