import { z } from 'zod'

// Espelha RepresentanteResponse do backend (GET /v3/api-docs).
export const representanteSchema = z.object({
  id: z.string().uuid(),
  empresaId: z.string().uuid(),
  nome: z.string(),
  email: z.string(),
  whatsapp: z.string().nullable(),
  ativo: z.boolean(),
})

export const representanteListaSchema = z.array(representanteSchema)

export type Representante = z.infer<typeof representanteSchema>
