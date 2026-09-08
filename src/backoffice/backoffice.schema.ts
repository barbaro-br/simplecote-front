import { z } from 'zod'

// Espelha os DTOs da change backoffice-super-admin e backoffice-metricas-de-uso do back.

export const compradorAdminSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  slug: z.string(),
  statusAssinatura: z.string(),
  criadoEm: z.string(),
  ultimoAcessoEm: z.string().nullable(),
  cotacoes: z.number(),
  usuarios: z.number(),
  representantes: z.number(),
  suspenso: z.boolean(),
  // Métricas de uso (change backoffice-metricas-de-uso). `valorTotalComprado`
  // vem na listagem e no detalhe; os demais só no detalhe (nulos na lista).
  valorTotalComprado: z.number(),
  cotacoesPorStatus: z.record(z.string(), z.number()).nullable(),
  primeiraCotacaoEm: z.string().nullable(),
  ultimaAtividadeEm: z.string().nullable(),
})
export const compradorAdminListaSchema = z.array(compradorAdminSchema)
export type CompradorAdmin = z.infer<typeof compradorAdminSchema>

// Resumo de uma cotação da loja (GET /api/admin/compradores/{id}/cotacoes).
export const cotacaoResumoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  status: z.enum(['RASCUNHO', 'ABERTA', 'ENCERRADA', 'PEDIDOS_GERADOS', 'CANCELADA']),
  criadoEm: z.string(),
  encerradoEm: z.string().nullable(),
  qtdItens: z.number(),
  qtdParticipantes: z.number(),
  valorComprado: z.number(),
})
export const cotacaoResumoListaSchema = z.array(cotacaoResumoSchema)
export type CotacaoResumo = z.infer<typeof cotacaoResumoSchema>

// Admin (OWNER/ADMIN) de um Comprador — presente apenas no detalhe.
export const adminCompradorSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  email: z.string(),
  papel: z.enum(['OWNER', 'ADMIN']),
})
export type AdminComprador = z.infer<typeof adminCompradorSchema>

export const compradorAdminDetalheSchema = compradorAdminSchema.extend({
  admins: z.array(adminCompradorSchema),
})
export type CompradorAdminDetalhe = z.infer<typeof compradorAdminDetalheSchema>

// Status de assinatura (string crua do back; hoje só TESTE, os demais entram
// com planos-cobranca-e-nfse).
export const STATUS_ASSINATURA = ['TESTE', 'ATIVA', 'INADIMPLENTE', 'CANCELADA'] as const

export const ROTULO_STATUS_ASSINATURA: Record<string, string> = {
  TESTE: 'Teste',
  ATIVA: 'Ativa',
  INADIMPLENTE: 'Inadimplente',
  CANCELADA: 'Cancelada',
}

export function rotuloStatus(status: string): string {
  return ROTULO_STATUS_ASSINATURA[status] ?? status
}
