export type PedidoResumo = {
  id: string
  origem: 'APURADO' | 'AVULSO'
  status: string
  empresaNome: string | null
  total: number
  quantidadeItens: number
  condicaoPagamento: string | null
  prazoEntregaEstimado: string | null
  geradoEm: string
}

export type GrupoCotacaoPedidos = {
  cotacaoId: string
  tituloCotacao: string
  pedidos: PedidoResumo[]
}

export type PedidosAgrupados = {
  grupos: GrupoCotacaoPedidos[]
  avulsos: PedidoResumo[]
}
