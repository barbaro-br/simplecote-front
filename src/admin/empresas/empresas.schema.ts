import { z } from 'zod'

export const empresaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  nomeRepresentante: z.string().min(1, 'Nome do representante é obrigatório'),
  emailRepresentante: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  whatsappRepresentante: z.string().optional(),
})

export type EmpresaFormValues = z.infer<typeof empresaSchema>

export type Empresa = {
  id: string
  nome: string
  ativo: boolean
  /** `false` quando a empresa já participou de alguma cotação — só então a exclusão é bloqueada. */
  podeExcluir: boolean
}
