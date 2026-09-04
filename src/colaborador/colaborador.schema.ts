import type { Produto } from '@/admin/produtos/produtos.schema'

// Espelha EstadoColaboradorResponse do backend (GET /public/colaborador/{token}).
// `cotacaoId`/`cotacaoTitulo` nulos indicam explicitamente "sem cotação em
// rascunho no momento" (não é erro) — o backend devolve o record flat
// `{ nomeLoja, cotacaoId, cotacaoTitulo }`.
export type EstadoColaborador = {
  nomeLoja: string
  cotacaoId: string | null
  cotacaoTitulo: string | null
}

// A lista de produtos reusa o tipo `Produto` do catálogo (mesmo shape de
// GET /api/produtos — spec comprador/colaborador "Buscar produtos pelo link").
export type { Produto }
