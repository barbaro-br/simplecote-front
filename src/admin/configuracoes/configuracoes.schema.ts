import { z } from 'zod'

export type EstiloNavegacao = 'LATERAL' | 'INFERIOR'

export type Tema = 'CLARO' | 'ESCURO'

export const configuracaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  corPrimaria: z.string().min(1, 'Cor é obrigatória'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  layoutEmail: z.string().min(1, 'Layout de e-mail é obrigatório'),
  estiloNavegacao: z.enum(['LATERAL', 'INFERIOR']),
  tema: z.enum(['CLARO', 'ESCURO']),
  destacarMenorPrecoNaGrade: z.boolean(),
})

export type ConfiguracaoFormValues = z.infer<typeof configuracaoSchema>

export type Configuracao = {
  nome: string
  corPrimaria: string
  telefone: string
  layoutEmail: string
  estiloNavegacao: EstiloNavegacao
  tema: Tema
  destacarMenorPrecoNaGrade: boolean
  // Somente leitura: token permanente do link público do colaborador
  // (`/colaborador/{linkColaboradorToken}`). Não faz parte do schema de submit.
  linkColaboradorToken: string
}
