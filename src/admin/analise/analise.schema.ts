import { z } from 'zod'

export const dashboardSchema = z.object({
  porStatus: z.object({
    rascunho: z.number(),
    aberta: z.number(),
    encerrada: z.number(),
    apurada: z.number(),
    cancelada: z.number(),
  }),
  encerradasSemApurar: z.number(),
  apuradasSemPedidoEnviado: z.number(),
  proximosPrazos: z.array(
    z.object({
      cotacaoId: z.string().uuid(),
      titulo: z.string(),
      fechaEm: z.string(),
    })
  ),
  gastoMes: z.number(),
  gastoMesAnterior: z.number(),
  economiaEstimada90d: z.number(),
  topProdutos: z.array(
    z.object({
      nome: z.string(),
      valor: z.number(),
    })
  ),
  topEmpresas: z.array(
    z.object({
      nome: z.string(),
      valor: z.number(),
    })
  ),
})

export const analiseComprasSchema = z.object({
  periodo: z.object({
    de: z.string(),
    ate: z.string(),
  }),
  totais: z.array(
    z.object({
      empresa: z.string(),
      total: z.number(),
    })
  ),
  itemMaisComprado: z
    .object({
      nome: z.string(),
      quantidade: z.number(),
    })
    .nullable(),
  itemMenosComprado: z
    .object({
      nome: z.string(),
      quantidade: z.number(),
    })
    .nullable(),
  ultimosPrecos: z.array(
    z.object({
      produto: z.string(),
      precoUnitario: z.number(),
      empresa: z.string(),
      data: z.string(),
    })
  ),
})

export const insightProdutoSchema = z.object({
  ultimaCompra: z.object({
    cotacaoId: z.string().uuid().nullable(),
    empresa: z.string(),
    representante: z.string(),
    precoUnitario: z.number(),
    data: z.string(),
    quantidade: z.number(),
  }).nullable(),
  variacaoPct: z.number().nullable(),
  menorPrecoUnitario: z.number().nullable(),
  precoMedioUnitario90d: z.number().nullable(),
  compras: z.number(),
  fornecedoresDistintos: z.number(),
  serie: z.array(z.object({ data: z.string(), precoUnitario: z.number() })),
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
export type AnaliseCompras = z.infer<typeof analiseComprasSchema>
export type InsightProduto = z.infer<typeof insightProdutoSchema>
export type InsightEmpresa = z.infer<typeof insightEmpresaSchema>
