import { useRef, useState } from 'react'
import { moeda, dataHoraBr } from '@/shared/format/formatters'
import type { ItemGrid } from './cotacoes.schema'

// Popover de leitura (sem lib): hover no nome do item mostra a referência de
// última compra do produto. Posição simples abaixo/à esquerda.
export function UltimaCompraPopover({ item }: { item: ItemGrid }) {
  const [aberto, setAberto] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function aoEntrar() {
    timer.current = setTimeout(() => setAberto(true), 200)
  }
  function aoSair() {
    clearTimeout(timer.current)
    setAberto(false)
  }

  const temCompra = item.ultimaCompraEm != null && item.ultimoPrecoUnitario != null
  const referencia = item.ultimoPrecoUnitario
  const menor = item.menorPrecoUnitario
  const seta =
    temCompra && menor != null && referencia != null
      ? menor < referencia
        ? '▼ abaixo da última compra'
        : menor > referencia
          ? '▲ acima da última compra'
          : '= igual à última compra'
      : ''

  return (
    <span className="relative inline-block" onMouseEnter={aoEntrar} onMouseLeave={aoSair}>
      <span className="cursor-help underline decoration-dotted underline-offset-2">{item.nome}</span>
      {aberto && (
        <div
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1 w-64 rounded-md border bg-popover p-3 text-xs shadow-md"
        >
          <p className="font-medium text-foreground">Última compra</p>
          {temCompra ? (
            <div className="mt-1 space-y-0.5 text-muted-foreground">
              <p className="tabular-nums text-foreground">{moeda(referencia as number)} /un</p>
              <p>{item.ultimaCompraEmpresa ?? '—'}</p>
              <p>{dataHoraBr(item.ultimaCompraEm as string)}</p>
              {seta && <p className="pt-1">{seta}</p>}
            </div>
          ) : (
            <p className="mt-1 text-muted-foreground">Sem compra anterior.</p>
          )}
        </div>
      )}
    </span>
  )
}
