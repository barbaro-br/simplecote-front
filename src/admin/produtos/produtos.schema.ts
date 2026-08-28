import { z } from 'zod'

// Espelha CriarProdutoRequest do backend (spec.md §16)
export const tiposDeEmbalagem = ['Fardo', 'Caixa', 'Cartela', 'Unidade'] as const
export type TipoDeEmbalagem = (typeof tiposDeEmbalagem)[number]

export const produtoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do produto'),
  codigoBarras: z.string().optional(),
  unidade: z.enum(tiposDeEmbalagem, { message: 'Informe o tipo de embalagem' }),
  quantidadePorEmbalagem: z
    .number()
    .int()
    .min(1, 'A quantidade por embalagem deve ser no mínimo 1'),
})

export type ProdutoFormValues = z.infer<typeof produtoSchema>

export type Produto = {
  id: string
  nome: string
  codigoBarras: string | null
  unidade: TipoDeEmbalagem
  quantidadePorEmbalagem: number
  ativo: boolean
}
