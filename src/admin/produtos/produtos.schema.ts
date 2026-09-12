import { z } from 'zod'

// Espelha CriarProdutoRequest do backend (spec.md §16) — lá `unidade` é só
// `@NotBlank String` (sem enum), então esta lista fixa é decisão só do front.
export const tiposDeEmbalagem = ['Fardo', 'Caixa', 'Cartela', 'Dúzia', 'Unidade'] as const
export type TipoDeEmbalagem = (typeof tiposDeEmbalagem)[number]

export const produtoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do produto'),
  codigoBarras: z.string().optional(),
  unidade: z.enum(tiposDeEmbalagem, { message: 'Informe o tipo de embalagem' }),
  quantidadePorEmbalagem: z.any()
    .transform(Number)
    .refine((n) => !Number.isNaN(n) && n !== 0, 'Informe a quantidade por embalagem')
    .refine((n) => Number.isInteger(n), 'A quantidade deve ser um número inteiro')
    .refine((n) => n >= 1, 'A quantidade por embalagem deve ser no mínimo 1'),
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

/** Pré-preenchimento do cadastro (nome + código) a partir de uma sugestão do
 * catálogo global — embalagem/quantidade continuam sempre do admin. */
export type ValoresIniciaisProduto = {
  nome: string
  codigoBarras: string
}
