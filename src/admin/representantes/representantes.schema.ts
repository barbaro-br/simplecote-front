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

// Retorno de `DELETE /api/representantes/{id}` (ExclusaoRepresentanteResponse do back):
// REMOVIDO = sem histórico, linha apagada; ANONIMIZADO = PII anonimizada, histórico preservado.
export type ResultadoExclusaoRepresentante = 'REMOVIDO' | 'ANONIMIZADO'
