import { useRef, useState } from 'react'
import { Info } from 'lucide-react'
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
  
  let IndicadorPreco = null
  if (temCompra && menor != null && referencia != null) {
    if (menor < referencia) {
      IndicadorPreco = <span className="text-success font-medium flex items-center gap-1"><span className="text-[10px]">▼</span> Abaixo da ref.</span>
    } else if (menor > referencia) {
      IndicadorPreco = <span className="text-destructive font-medium flex items-center gap-1"><span className="text-[10px]">▲</span> Acima da ref.</span>
    } else {
      IndicadorPreco = <span className="text-muted-foreground font-medium flex items-center gap-1"><span className="text-[10px]">=</span> Igual à ref.</span>
    }
  }

  return (
    <span className="relative inline-flex items-center gap-1.5" onMouseEnter={aoEntrar} onMouseLeave={aoSair}>
      <span className="font-medium">{item.nome}</span>
      <Info className="size-3.5 text-muted-foreground/50" />
      {aberto && (
        <div
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-md border bg-popover p-3 text-sm shadow-md animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
        >
          <p className="font-semibold text-foreground mb-2">Última compra</p>
          {temCompra ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="tabular-nums text-foreground font-medium">{moeda(referencia as number)} <span className="text-muted-foreground font-normal text-xs">/ un</span></p>
                {IndicadorPreco && <div className="text-xs">{IndicadorPreco}</div>}
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="truncate" title={item.ultimaCompraEmpresa ?? ''}>{item.ultimaCompraEmpresa ?? '—'}</p>
                <p>{dataHoraBr(item.ultimaCompraEm as string)}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">Sem compra anterior.</p>
          )}
        </div>
      )}
    </span>
  )
}
