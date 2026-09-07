import { z } from 'zod'

export const esqueciSenhaSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
})

export type EsqueciSenhaFormValues = z.infer<typeof esqueciSenhaSchema>

export const codigoSchema = z.string().regex(/^\d{6}$/, 'O código tem 6 dígitos')
