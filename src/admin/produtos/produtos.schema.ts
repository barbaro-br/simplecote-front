import { z } from 'zod'

export const tiposDeEmbalagem = [
  'Caixa',
  'Fardo',
  'Pacote',
  'Display',
  'Unidade',
  'Dúzia',
  'Cartela',
  'Balde',
  'Lata',
] as const
export type TipoDeEmbalagem = (typeof tiposDeEmbalagem)[number]

export const rotulosEmbalagem: Record<string, string> = {
  Caixa: 'Caixa (CX)',
  Fardo: 'Fardo (FD)',
  Pacote: 'Pacote (PCT)',
  Display: 'Display (DP)',
  Unidade: 'Unidade (UN)',
  Dúzia: 'Dúzia (DZ)',
  Cartela: 'Cartela (CRT)',
  Balde: 'Balde (BD)',
  Lata: 'Lata (LT)',
}

export function normalizarTipoEmbalagem(unidade?: string | null): TipoDeEmbalagem {
  if (!unidade) return 'Caixa'
  const u = unidade.trim().toLowerCase()
  if (u === 'cx' || u === 'caixa' || u.includes('caixa')) return 'Caixa'
  if (u === 'fd' || u === 'fardo' || u.includes('fardo')) return 'Fardo'
  if (u === 'pct' || u === 'pcte' || u === 'pacote' || u.includes('pacote')) return 'Pacote'
  if (u === 'dp' || u === 'disp' || u === 'display' || u.includes('display')) return 'Display'
  if (u === 'un' || u === 'und' || u === 'unidade' || u.includes('unidade')) return 'Unidade'
  if (u === 'dz' || u === 'duzia' || u === 'dúzia' || u.includes('duzia') || u.includes('dúzia')) return 'Dúzia'
  if (u === 'crt' || u === 'cartela' || u.includes('cartela')) return 'Cartela'
  if (u === 'bd' || u === 'balde' || u.includes('balde')) return 'Balde'
  if (u === 'lt' || u === 'lata' || u.includes('lata')) return 'Lata'
  const achado = tiposDeEmbalagem.find((t) => t.toLowerCase() === u)
  return achado ?? 'Caixa'
}

export const produtoSchema = z.object({
  nome: z
    .string()
    .min(1, 'Informe o nome do produto')
    .transform((v) => v.trim().toUpperCase()),
  codigoBarras: z.string().optional(),
  unidade: z.string().min(1, 'Informe o tipo de embalagem'),
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
