export type StatusCotacao = 'RASCUNHO' | 'ABERTA' | 'ENCERRADA' | 'PEDIDOS_GERADOS' | 'CANCELADA'
export type ParticipanteStatus = 'CONVIDADO' | 'VISUALIZOU' | 'RESPONDIDO'
export type LanceStatus = 'PENDENTE' | 'COTADO' | 'NAO_COTADO'
export type PedidoStatus = 'GERADO' | 'ENVIADO' | 'CONFIRMADO'

export interface InvalidParam {
  name: string
  reason: string
}

export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
  invalidParams?: InvalidParam[]
}
