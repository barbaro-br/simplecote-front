import { z } from 'zod'
import type { StatusCotacao, PedidoStatus } from '@/shared/domain/tipos-base'

// Tipos espelhando o contrato real do backend (GET /v3/api-docs).

export type CotacaoResumo = {
  id: string
  titulo: string
  status: StatusCotacao
  prazo: string | null
  criadaEm: string
  encerradaEm: string | null
}

export type ItemCotacao = {
  id: string
  produtoId: string
  nomeSnapshot: string
  codigoBarrasSnapshot: string | null
  unidadeSnapshot: string
  quantidadeSolicitada: number
  quantidadePorEmbalagemSnapshot: number
}

export type CotacaoDetalhe = {
  id: string
  titulo: string
  status: StatusCotacao
  prazo: string | null
  criadaEm: string
  encerradaEm: string | null
  itens: ItemCotacao[]
}

export type ItemOmitido = {
  produtoId: string
  nome: string
  motivo: string
}

export type CotacaoDuplicada = {
  cotacao: CotacaoDetalhe
  omitidos: ItemOmitido[]
}

export type ItemPedido = {
  id: string
  itemCotacaoId: string
  lanceId: string | null
  nomeSnapshot: string
  unidadeSnapshot: string
  quantidadePorEmbalagemSnapshot: number
  quantidade: number
  precoEmbalagem: number
  precoUnitario: number
  subtotal: number
}

export type Pedido = {
  id: string
  cotacaoId: string
  participanteId: string
  empresaNome: string
  status: PedidoStatus
  observacao: string | null
  geradoEm: string
  enviadoEm: string | null
  confirmadoEm: string | null
  itens: ItemPedido[]
  total: number
}

export type Resultado = {
  pedidos: Pedido[]
  itensSemVencedor: ItemCotacao[]
}

// Schemas de formulário (zod espelhando as constraints do backend).

export const criarCotacaoSchema = z.object({
  titulo: z.string().min(1, 'Informe o título da cotação'),
})
export type CriarCotacaoValues = z.infer<typeof criarCotacaoSchema>

export const abrirCotacaoSchema = z.object({
  prazo: z.string().min(1, 'Informe o prazo'),
})
export type AbrirCotacaoValues = z.infer<typeof abrirCotacaoSchema>

export const adicionarItemSchema = z.object({
  produtoId: z.string().min(1, 'Escolha um produto'),
  quantidade: z.number().int().min(1, 'A quantidade deve ser no mínimo 1'),
})
export type AdicionarItemValues = z.infer<typeof adicionarItemSchema>
