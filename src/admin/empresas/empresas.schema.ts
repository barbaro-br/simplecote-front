import { z } from 'zod'

export const empresaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  nomeRepresentante: z.string().optional(),
  emailRepresentante: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  whatsappRepresentante: z.string().optional(),
})

export type EmpresaFormValues = z.infer<typeof empresaSchema>

export type Empresa = {
  id: string
  nome: string
  ativo: boolean
}
