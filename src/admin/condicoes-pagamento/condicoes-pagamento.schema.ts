import { z } from 'zod'

export const condicaoPagamentoSchema = z.object({
  descricao: z.string().min(1, 'Informe a descrição da condição de pagamento'),
})

export type CondicaoPagamentoFormValues = z.infer<typeof condicaoPagamentoSchema>

export type CondicaoPagamento = {
  id: string
  descricao: string
  ativo: boolean
}
