import { z } from 'zod'

// Avisos da plataforma (change backoffice-avisos-no-painel). Espelha
// `AvisoResponse` / `AvisoAdminResponse` do back.

export const NIVEIS_AVISO = ['INFO', 'ATENCAO', 'CRITICO'] as const
export type NivelAviso = (typeof NIVEIS_AVISO)[number]

export const avisoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  corpo: z.string(),
  nivel: z.enum(NIVEIS_AVISO),
  publicadoEm: z.string(),
  expiraEm: z.string().nullable(),
})
export const avisoListaSchema = z.array(avisoSchema)
export type Aviso = z.infer<typeof avisoSchema>

// Visão do backoffice (GET /api/admin/avisos): os campos extras de gestão.
export const avisoAdminSchema = avisoSchema.extend({
  ativo: z.boolean(),
  criadoPor: z.string().uuid().nullable(),
})
export const avisoAdminListaSchema = z.array(avisoAdminSchema)
export type AvisoAdmin = z.infer<typeof avisoAdminSchema>
