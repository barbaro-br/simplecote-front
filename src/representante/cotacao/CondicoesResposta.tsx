import { useEffect, useRef, useState } from 'react'
import { Combobox } from '@/shared/components/ui/combobox'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useAtualizarCondicoes } from './cotacao-token.api'
import type { CondicaoPagamentoDisponivel } from './cotacao-token.schema'

type Props = {
  token: string
  condicaoPagamento: string | null
  prazoEntregaEstimado: string | null
  condicoesPagamentoDisponiveis: CondicaoPagamentoDisponivel[]
  podeEditar: boolean
}

/**
 * Seção própria, fora dos cards de item (design.md - Decisão 3): condição de
 * pagamento e prazo de entrega valem para a resposta inteira. Mesmo padrão de
 * debounce (800ms) do autosave de preço (`LinhaPreco`), mas mutation direta —
 * sem fila offline: perder uma dessas duas edições num soluço de rede é bem
 * menos crítico que perder um preço, e o representante pode só reeditar.
 */
export function CondicoesResposta({
  token,
  condicaoPagamento,
  prazoEntregaEstimado,
  condicoesPagamentoDisponiveis,
  podeEditar,
}: Props) {
  const atualizar = useAtualizarCondicoes(token)

  const idInicial = condicoesPagamentoDisponiveis.find((c) => c.descricao === condicaoPagamento)?.id ?? ''
  const [condicaoId, setCondicaoId] = useState(idInicial)
  const [prazo, setPrazo] = useState(prazoEntregaEstimado ?? '')

  const debouncedCondicao = useDebounce(condicaoId, 800)
  const debouncedPrazo = useDebounce(prazo.trim(), 800)
  const condicaoEnviadaRef = useRef(idInicial)
  const prazoEnviadoRef = useRef(prazoEntregaEstimado ?? '')

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

  return (
    <div className="grid gap-3 border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] px-4 py-3 sm:grid-cols-2 sm:px-5">
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
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        />
      </div>
    </div>
  )
}
