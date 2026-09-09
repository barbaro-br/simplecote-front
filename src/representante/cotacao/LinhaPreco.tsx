import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { X } from '@phosphor-icons/react'
import { moeda } from '@/shared/format/formatters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/lib/utils'
import { precoSchema, type ItemLance } from './cotacao-token.schema'
import type { StatusCelula } from './useFilaDeSincronizacao'

const UNIT_ABBR: Record<string, string> = {
  Fardo: 'fd',
  Caixa: 'cx',
  Cartela: 'crt',
  Unidade: 'un',
}

function precoInicial(item: ItemLance): string {
  return item.preco != null ? String(item.preco) : ''
}

type Props = {
  item: ItemLance
  podeEditar: boolean
  autoFocus?: boolean
  status?: StatusCelula
  erro?: string
  novo?: boolean
  aoAssentar: (patch: { preco?: number; naoCotado?: boolean }) => void
  onPrecoChange?: (itemCotacaoId: string, temPreco: boolean) => void
}

/**
 * Linha da grade de preços do representante (redesign-painel-dark, Fase 1).
 * Substitui o `ItemLanceCard`: mesma lógica de autosave (debounce 800ms +
 * `precoSchema` + toast "Desfazer" ao limpar), mas renderiza como `<tr>` na
 * `GradeDados`, com os tokens `--pnl-*`. Coluna editável = "Seu preço".
 */
export function LinhaPreco({
  item,
  podeEditar,
  autoFocus,
  status,
  erro,
  novo,
  aoAssentar,
  onPrecoChange,
}: Props) {
  const [texto, setTexto] = useState(() => precoInicial(item))
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const debounced = useDebounce(texto.trim(), 800)
  const jaEnviadoRef = useRef(precoInicial(item))

  useEffect(() => {
    if (!podeEditar) return
    if (debounced === jaEnviadoRef.current) return

    if (debounced === '') {
      if (jaEnviadoRef.current !== '') {
        const anterior = jaEnviadoRef.current
        jaEnviadoRef.current = ''
        setErroLocal(null)
        aoAssentar({ naoCotado: true })
        toast('Preço removido', {
          id: `preco-removido-${item.itemCotacaoId}`,
          duration: 4000,
          position: 'top-center',
          action: { label: 'Desfazer', onClick: () => setTexto(anterior) },
        })
      }
      return
    }

    const n = Number(debounced.replace(',', '.'))
    const parsed = precoSchema.safeParse(n)
    if (!parsed.success) {
      // eslint-disable-next-line react/set-state-in-effect
      setErroLocal(parsed.error.issues[0]?.message ?? 'Preço inválido')
      return
    }
    setErroLocal(null)
    jaEnviadoRef.current = debounced
    aoAssentar({ preco: parsed.data })
  }, [debounced, podeEditar, aoAssentar, item.itemCotacaoId])

  // Flash verde quando o preço vai de vazio → preenchido.
  const anteriorRef = useRef(texto)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (!anteriorRef.current && texto) {
      setFlash(false)
      requestAnimationFrame(() => requestAnimationFrame(() => setFlash(true)))
      const t = setTimeout(() => setFlash(false), 700)
      anteriorRef.current = texto
      return () => clearTimeout(t)
    }
    anteriorRef.current = texto
  }, [texto])

  function alterar(bruto: string) {
    const val = bruto.replace(/[^0-9.,]/g, '')
    const partes = val.replace(',', '.').split('.')
    if (partes.length > 2) return
    if (partes[1] !== undefined && partes[1].length > 2) return
    setTexto(val)
    onPrecoChange?.(item.itemCotacaoId, val.trim() !== '')
  }

  const temPreco = texto.trim() !== ''
  const unitAbbr = UNIT_ABBR[item.unidade] ?? item.unidade
  const sub =
    item.unidade === 'Unidade'
      ? `${unitAbbr} · comprar ${item.quantidadeSolicitada}`
      : `${unitAbbr} c/ ${item.quantidadePorEmbalagemSnapshot} · comprar ${item.quantidadeSolicitada}`
  const unitario =
    item.precoUnitario != null
      ? moeda(item.precoUnitario)
      : status === 'enviando' && temPreco
        ? 'calculando…'
        : '—'

  const msg = (() => {
    if (erroLocal) return { t: erroLocal, c: 'text-[var(--pnl-perigo,#ff6b6b)]', alerta: true }
    if (erro) return { t: erro, c: 'text-[var(--pnl-perigo,#ff6b6b)]', alerta: true }
    if (status === 'enviando')
      return { t: 'salvando…', c: 'text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]', alerta: false }
    if (status === 'sincronizado')
      return { t: '✓ salvo', c: 'text-[var(--pnl-acento-hi,#6fe6ac)]', alerta: false }
    if (status === 'falhou')
      return {
        t: 'sem conexão — salva quando voltar',
        c: 'text-[var(--pnl-atencao,#e0a030)]',
        alerta: false,
      }
    return null
  })()

  return (
    <tr className="border-t border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))] align-top">
      <td className="px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold capitalize text-[var(--pnl-txt,#fff)]">
            {item.nome}
          </span>
          {novo && (
            <span className="shrink-0 rounded-full bg-[var(--pnl-acento,#57bf8e)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--pnl-acento-hi,#6fe6ac)]">
              Novo
            </span>
          )}
        </div>
        <div className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{sub}</div>
        {item.codigoBarras && (
          <div className="mt-0.5 font-mono text-[10px] tracking-tight text-[var(--pnl-txt-4,rgba(255,255,255,0.3))]">
            {item.codigoBarras}
          </div>
        )}
        {msg && (
          <p role={msg.alerta ? 'alert' : undefined} className={cn('mt-1 text-[11px]', msg.c)}>
            {msg.t}
          </p>
        )}
      </td>

      <td className="px-2 py-2.5 text-right">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md border px-2 py-1 transition-colors',
            'border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.04] focus-within:ring-1 focus-within:ring-[var(--pnl-acento,#57bf8e)]/50',
            flash && 'flash-green',
          )}
        >
          <span className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">R$</span>
          <label htmlFor={`preco-${item.itemCotacaoId}`} className="sr-only">
            Preço da embalagem — {item.nome}
          </label>
          <input
            id={`preco-${item.itemCotacaoId}`}
            type="text"
            inputMode="decimal"
            pattern="[0-9.,]*"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus={autoFocus}
            value={texto}
            disabled={!podeEditar}
            placeholder="0,00"
            onChange={(e) => alterar(e.target.value)}
            className="w-16 bg-transparent text-right text-[13px] font-semibold tabular-nums text-[var(--pnl-txt,#fff)] outline-none placeholder:text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] disabled:opacity-50"
          />
          {temPreco && podeEditar && (
            <button
              type="button"
              aria-label={`Limpar preço de ${item.nome}`}
              onClick={() => alterar('')}
              className="text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] transition-colors hover:text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]"
            >
              <X className="size-3" weight="bold" aria-hidden />
            </button>
          )}
        </span>
      </td>

      <td className="whitespace-nowrap px-2 py-2.5 pr-4 text-right sm:pr-5">
        <span
          className={cn(
            'tabular-nums',
            item.precoUnitario != null
              ? 'text-[13px] font-semibold text-[var(--pnl-txt,#fff)]'
              : 'text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]',
          )}
        >
          {unitario}
        </span>
      </td>
    </tr>
  )
}
