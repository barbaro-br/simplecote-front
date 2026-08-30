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

// Um schema pro form (criar e editar). `empresaId` só é exigido no modo criar —
// a checagem fica no componente (o `<select>` nem aparece no editar), no mesmo
// padrão do `EmpresaForm`. `nome`/`email` valem sempre.
export const representanteFormSchema = z.object({
  empresaId: z.string(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  whatsapp: z.string().optional(),
})
export type RepresentanteFormValues = z.infer<typeof representanteFormSchema>
