import { useEffect, useRef, useState } from 'react'
import { Combobox } from '@/shared/components/ui/combobox'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useAtualizarCondicoes } from './cotacao-token.api'
import type { CondicaoPagamentoDisponivel } from './cotacao-token.schema'

type Props = {
  token: string
  condicaoPagamento: string | null
  prazoEntregaEstimado: string | null
  pedidoMinimo?: number | null
  condicoesPagamentoDisponiveis: CondicaoPagamentoDisponivel[]
  podeEditar: boolean
}

/**
 * Seção própria, fora dos cards de item (design.md - Decisão 3): condição de
 * pagamento, prazo de entrega e pedido mínimo valem para a resposta inteira. Mesmo padrão de
 * debounce (800ms) do autosave de preço (`LinhaPreco`), mas mutation direta.
 */
export function CondicoesResposta({
  token,
  condicaoPagamento,
  prazoEntregaEstimado,
  pedidoMinimo,
  condicoesPagamentoDisponiveis,
  podeEditar,
}: Props) {
  const atualizar = useAtualizarCondicoes(token)

  const idInicial = condicoesPagamentoDisponiveis.find((c) => c.descricao === condicaoPagamento)?.id ?? ''
  const [condicaoId, setCondicaoId] = useState(idInicial)
  const [prazo, setPrazo] = useState(prazoEntregaEstimado ?? '')
  const [minimo, setMinimo] = useState(pedidoMinimo != null && pedidoMinimo > 0 ? String(pedidoMinimo) : '')

  const debouncedCondicao = useDebounce(condicaoId, 800)
  const debouncedPrazo = useDebounce(prazo.trim(), 800)
  const debouncedMinimo = useDebounce(minimo.trim(), 800)

  const condicaoEnviadaRef = useRef(idInicial)
  const prazoEnviadoRef = useRef(prazoEntregaEstimado ?? '')
  const minimoEnviadoRef = useRef(pedidoMinimo != null && pedidoMinimo > 0 ? String(pedidoMinimo) : '')

  useEffect(() => {
    if (!podeEditar) return
    if (debouncedCondicao === condicaoEnviadaRef.current) return
    condicaoEnviadaRef.current = debouncedCondicao
    atualizar.mutate({ condicaoPagamentoId: debouncedCondicao || null })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `atualizar` (mutation) muda de identidade a cada render
  }, [debouncedCondicao, podeEditar])

  useEffect(() => {
    if (!podeEditar) return
    if (debouncedPrazo === prazoEnviadoRef.current) return
    prazoEnviadoRef.current = debouncedPrazo
    atualizar.mutate({ prazoEntregaEstimado: debouncedPrazo || null })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `atualizar` (mutation) muda de identidade a cada render
  }, [debouncedPrazo, podeEditar])

  useEffect(() => {
    if (!podeEditar) return
    if (debouncedMinimo === minimoEnviadoRef.current) return
    minimoEnviadoRef.current = debouncedMinimo
    const num = debouncedMinimo ? parseFloat(debouncedMinimo.replace(',', '.')) : null
    atualizar.mutate({ pedidoMinimo: num && !isNaN(num) && num >= 0 ? num : null })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `atualizar` (mutation) muda de identidade a cada render
  }, [debouncedMinimo, podeEditar])

  return (
    <div className="grid gap-3 border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] px-4 py-3 sm:grid-cols-3 sm:px-5">
      <div className="space-y-1.5">
        <label
          htmlFor="condicao-pagamento-resposta"
          className="text-[11px] font-medium uppercase tracking-wide text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]"
        >
          Condição de pagamento
        </label>
        <Combobox
          id="condicao-pagamento-resposta"
          options={condicoesPagamentoDisponiveis.map((c) => ({ value: c.id, label: c.descricao }))}
          value={condicaoId}
          onChange={setCondicaoId}
          placeholder="Nenhuma"
          emptyMessage="Nenhuma condição de pagamento cadastrada"
          disabled={!podeEditar}
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="prazo-entrega-resposta"
          className="text-[11px] font-medium uppercase tracking-wide text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]"
        >
          Prazo de entrega estimado
        </label>
        <input
          id="prazo-entrega-resposta"
          type="text"
          value={prazo}
          disabled={!podeEditar}
          onChange={(e) => setPrazo(e.target.value)}
          placeholder="Ex: 5 dias úteis"
          className="h-9 w-full rounded-none font-mono border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="pedido-minimo-resposta"
          className="text-[11px] font-medium uppercase tracking-wide text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]"
        >
          Pedido mínimo (R$)
        </label>
        <input
          id="pedido-minimo-resposta"
          type="number"
          step="0.01"
          min="0"
          value={minimo}
          disabled={!podeEditar}
          onChange={(e) => setMinimo(e.target.value)}
          placeholder="Ex: 1500,00"
          className="h-9 w-full rounded-none font-mono border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        />
      </div>
    </div>
  )
}
