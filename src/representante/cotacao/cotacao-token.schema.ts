import { z } from 'zod'
import type { StatusCotacao, ParticipanteStatus, LanceStatus } from '@/shared/domain/tipos-base'

// Espelha CotacaoParticipanteResponse do backend (GET /public/cotacoes/{token}).

export type ItemLance = {
  itemCotacaoId: string
  nome: string
  codigoBarras: string | null
  unidade: string
  quantidadeSolicitada: number
  quantidadePorEmbalagemSnapshot: number
  preco: number | null
  precoUnitario: number | null
  statusLance: LanceStatus
}

export type CotacaoPorToken = {
  cotacaoId: string
  titulo: string
  status: StatusCotacao
  prazo: string | null
  podeEditar: boolean
  participanteStatus: ParticipanteStatus
  representanteNome: string
  empresaNome: string
  compradorNome: string
  itens: ItemLance[]
}

// Um item do PUT /public/cotacoes/{token}/lances (o front manda sempre 1).
export type LancePatch = {
  itemCotacaoId: string
  preco?: number
  naoCotado?: boolean
}

// Validação local do campo de preço: número >= 0 (o backend re-valida).
export const precoSchema = z
  .number({ message: 'Informe um preço válido' })
  .min(0, 'O preço não pode ser negativo')
