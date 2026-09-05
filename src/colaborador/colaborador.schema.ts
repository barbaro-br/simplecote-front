import type { Produto } from '@/admin/produtos/produtos.schema'

// Espelha EstadoColaboradorResponse do backend (GET /public/colaborador/{token}).
export type EstadoColaborador = {
  nomeLoja: string
  cotacoesAbertas: { id: string; titulo: string }[]
}

export type ProdutoExternoLookup = {
  gtin: string
  nome: string
  marca?: string
}

export type CadastrarItemBipadoValores = {
  cotacaoId: string
  gtin: string
  nome: string
  unidade: string
  quantidadePorEmbalagem: number
  quantidade: number
}

// A lista de produtos reusa o tipo `Produto` do catálogo (mesmo shape de
// GET /api/produtos — spec comprador/colaborador "Buscar produtos pelo link").
export type { Produto }
