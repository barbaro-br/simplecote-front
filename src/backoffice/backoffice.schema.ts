import { z } from 'zod'

// Espelha os DTOs da change backoffice-super-admin do back.

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
})
export const compradorAdminListaSchema = z.array(compradorAdminSchema)
export type CompradorAdmin = z.infer<typeof compradorAdminSchema>

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
