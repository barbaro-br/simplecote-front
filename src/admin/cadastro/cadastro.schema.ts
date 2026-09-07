import { z } from 'zod'
import { SLUG_FORMATO_REGEX, SLUG_MAX, SLUG_MIN } from '@/shared/domain/slug'

// Espelha a Bean Validation do `PublicCadastroDTO` do back (mensagens pt-BR
// iguais às do ProblemDetail). O formato do slug segue `SlugComprador` (3–40,
// `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`). A reserva de slug é checada à parte
// (lista compartilhada + `validar-slug`), não pelo schema.
export const cadastroSchema = z.object({
  nomeSupermercado: z.string().min(1, 'Informe o nome do supermercado'),
  slug: z
    .string()
    .min(1, 'Informe o slug')
    .min(SLUG_MIN, 'Slug inválido.')
    .max(SLUG_MAX, 'Slug inválido.')
    .regex(SLUG_FORMATO_REGEX, 'Slug inválido.'),
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha').min(8, 'A senha deve ter ao menos 8 caracteres'),
})

export type CadastroFormValues = z.infer<typeof cadastroSchema>

export const SENHA_MIN_CADASTRO = 8
