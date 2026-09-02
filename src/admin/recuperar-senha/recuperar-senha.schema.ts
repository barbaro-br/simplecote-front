import { z } from 'zod'

export const esqueciSenhaSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
})

export type EsqueciSenhaFormValues = z.infer<typeof esqueciSenhaSchema>
