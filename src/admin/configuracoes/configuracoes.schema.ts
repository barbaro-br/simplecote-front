import { z } from 'zod'

export const configuracaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  corPrimaria: z.string().min(1, 'Cor é obrigatória'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  layoutEmail: z.string().min(1, 'Layout de e-mail é obrigatório'),
})

export type ConfiguracaoFormValues = z.infer<typeof configuracaoSchema>

export type Configuracao = {
  nome: string
  corPrimaria: string
  telefone: string
  layoutEmail: string
}
