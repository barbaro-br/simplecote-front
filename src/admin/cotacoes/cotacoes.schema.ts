import { z } from 'zod'
import type { StatusCotacao, PedidoStatus, ParticipanteStatus } from '@/shared/domain/tipos-base'

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

// --- Participantes e grade ao vivo (change admin-cotacoes-participantes-respostas) ---

export type ConviteStatus = 'ENVIADO' | 'FALHOU'

export type ParticipanteDaCotacao = {
  participanteId: string
  empresaId: string
  empresaNome: string
  representanteNome: string
  conviteStatus: ConviteStatus | null
  participanteStatus: ParticipanteStatus
  linkMagico: string
}

export type StatusCelula = 'COTADO' | 'NAO_COTADO' | 'PENDENTE'

export type CelulaGrid = {
  participanteId: string
  empresaId: string
  empresa: string
  preco: number | null
  precoUnitario: number | null
  status: StatusCelula
}

export type ItemGrid = {
  itemCotacaoId: string
  nome: string
  unidade: string
  quantidadePorEmbalagem: number
  quantidadeSolicitada: number
  ultimoPrecoUnitario: number | null
  menorPrecoUnitario: number | null
  precos: CelulaGrid[]
}

export type GridAoVivo = {
  status: StatusCotacao
  respondidos: number
  totalParticipantes: number
  itens: ItemGrid[]
}

export type CorrecaoLance = {
  id: string
  lanceId: string
  participanteId: string
  itemCotacaoId: string
  usuarioId: string
  statusAnterior: string | null
  statusNovo: string | null
  precoAnterior: number | null
  precoNovo: number | null
  criadoEm: string
}

// Correção de lance pelo admin: preço da embalagem OU "não cotado".
export const corrigirLanceSchema = z
  .object({
    preco: z.number().min(0).optional(),
    naoCotado: z.boolean().optional(),
  })
  .refine((v) => v.naoCotado === true || typeof v.preco === 'number', {
    message: 'Informe um preço ou marque como não cotado',
  })
export type CorrigirLanceValues = z.infer<typeof corrigirLanceSchema>
