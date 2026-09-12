import type { ReactNode } from 'react'
import { LinhaLista, Selo, type TomSelo } from '@/shared/ui'
import { moeda } from '@/shared/format/formatters'
import type { PedidoResumo } from './pedidos.schema'

const ROTULO_STATUS: Record<string, string> = {
  GERADO: 'Gerado',
  ENVIADO: 'Enviado',
  CONFIRMADO: 'Confirmado',
  ABERTO: 'Aberto',
  FECHADO: 'Fechado',
}

const TOM_STATUS: Record<string, TomSelo> = {
  CONFIRMADO: 'sucesso',
  FECHADO: 'sucesso',
  ENVIADO: 'info',
  GERADO: 'neutro',
  ABERTO: 'neutro',
}

/**
 * Linha de pedido resumida (design.md - Decisão 1): mesmo formato reaproveitado
 * nos grupos por Cotação e na seção "Avulsos" de `PedidosPage` — Empresa/
 * identificador, status, total, quantidade de itens, condição de pagamento e
 * prazo de entrega ("—" quando ausentes).
 */
export function LinhaPedidoResumo({ titulo, pedido }: { titulo: ReactNode; pedido: PedidoResumo }) {
  return (
    <LinhaLista
      titulo={titulo}
      meta={
        <>
          {pedido.quantidadeItens} {pedido.quantidadeItens === 1 ? 'item' : 'itens'} · Cond.:{' '}
          {pedido.condicaoPagamento ?? '—'} · Prazo: {pedido.prazoEntregaEstimado ?? '—'}
        </>
      }
      fim={
        <>
          <Selo tom={TOM_STATUS[pedido.status] ?? 'neutro'}>{ROTULO_STATUS[pedido.status] ?? pedido.status}</Selo>
          <span className="tabular-nums font-medium text-[var(--pnl-txt,#fff)]">{moeda(pedido.total)}</span>
        </>
      }
    />
  )
}
