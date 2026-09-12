import { z } from 'zod'
import type { StatusPedidoAvulso } from '@/shared/domain/tipos-base'

export type ItemPedidoAvulso = {
  id: string
  produtoId: string
  nomeSnapshot: string
  unidadeSnapshot: string
  quantidadePorEmbalagemSnapshot: number
  precoEmbalagem: number
  precoUnitario: number
  quantidade: number
  subtotal: number
}

export type PedidoAvulso = {
  id: string
  status: StatusPedidoAvulso
  itens: ItemPedidoAvulso[]
  quantidadeItens: number
  total: number
  geradoEm: string
}

// Espelha CriarPedidoAvulsoRequest/AdicionarItemPedidoAvulsoRequest do backend
// (mesmo shape pros dois: produtoId, precoEmbalagem, quantidade).
export const itemPedidoAvulsoSchema = z.object({
  produtoId: z.string().min(1, 'Selecione um produto'),
  precoEmbalagem: z.any()
    .transform(Number)
    .refine((n) => !Number.isNaN(n) && n > 0, 'Informe o preço da embalagem'),
  quantidade: z.any()
    .transform(Number)
    .refine((n) => !Number.isNaN(n) && n !== 0, 'Informe a quantidade')
    .refine((n) => Number.isInteger(n), 'A quantidade deve ser um número inteiro')
    .refine((n) => n >= 1, 'A quantidade deve ser no mínimo 1'),
})

export type ItemPedidoAvulsoFormValues = z.infer<typeof itemPedidoAvulsoSchema>
