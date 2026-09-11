import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Check, CloudSlash, WarningCircle, X } from '@phosphor-icons/react'
import { moeda } from '@/shared/format/formatters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { sanitizarEntradaValor } from '@/shared/utils/preco'
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

/**
 * Indicador de estado do lance, do tamanho de um ícone — não muda a altura da
 * linha (o texto "salvando…/✓ salvo" fazia isso e deslocava a lista):
 * sem preço → X apagado · salvando → spinner · salvo → ✓ (com `pop`) ·
 * sem conexão → nuvem cortada · erro → alerta vermelho.
 */
function StatusPreco({
  status,
  temErro,
  temPreco,
}: {
  status?: StatusCelula
  temErro: boolean
  temPreco: boolean
}) {
  if (temErro) {
    return (
      <WarningCircle
        weight="fill"
        className="size-4 shrink-0 text-[var(--pnl-perigo,#ff6b6b)]"
        aria-label="preço com erro"
      />
    )
  }
  if (status === 'falhou') {
    return (
      <CloudSlash
        className="size-4 shrink-0 text-[var(--pnl-atencao,#e0a030)]"
        aria-label="sem conexão — salva quando voltar"
      />
    )
  }
  if (status === 'enviando') {
    return (
      <span
        role="img"
        aria-label="salvando"
        className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-[var(--pnl-acento,#57bf8e)] border-t-transparent"
      />
    )
  }
  if (status === 'sincronizado' || temPreco) {
    return (
      <Check
        key={status === 'sincronizado' ? 'ok' : 'idle'}
        weight="bold"
        className={cn(
          'size-4 shrink-0 text-[var(--pnl-acento-hi,#6fe6ac)]',
          status === 'sincronizado' && 'pop',
        )}
        aria-label={status === 'sincronizado' ? 'salvo' : 'com preço'}
      />
    )
  }
  return (
    <X
      className="size-3.5 shrink-0 text-[var(--pnl-txt-4,rgba(255,255,255,0.3))]"
      aria-label="sem preço"
    />
  )
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
    const val = sanitizarEntradaValor(bruto)
    if (val === null) return
    setTexto(val)
    onPrecoChange?.(item.itemCotacaoId, val.trim() !== '')
  }

  const temPreco = texto.trim() !== ''
  const mensagemErro = erroLocal ?? erro ?? null
  const unitAbbr = UNIT_ABBR[item.unidade] ?? item.unidade
  const sub =
    item.unidade === 'Unidade'
      ? `${unitAbbr} · comprar ${item.quantidadeSolicitada}`
      : `${unitAbbr} c/ ${item.quantidadePorEmbalagemSnapshot} · comprar ${item.quantidadeSolicitada}`

  // Um campo só. O preço por unidade vira uma dica discreta abaixo do campo,
  // e só quando a embalagem tem >1 unidade (senão é o mesmo número — ruído).
  const mostrarUnitario = item.quantidadePorEmbalagemSnapshot > 1
  const dicaUnitario =
    item.precoUnitario != null
      ? `≈ ${moeda(item.precoUnitario)}/un`
      : status === 'enviando' && temPreco
        ? 'calculando…'
        : null

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
          <div className="mt-0.5 font-mono text-[10px] tracking-tight text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            {item.codigoBarras}
          </div>
        )}
        {/* Erro só pra leitor de tela — o feedback visual vai no ícone de
            status, que não empurra a linha (antes o texto "salvo" mudava a
            altura e deslocava a lista). */}
        {mensagemErro && (
          <p role="alert" className="sr-only">
            {mensagemErro}
          </p>
        )}
      </td>

      <td className="px-2 py-2.5 pr-4 sm:pr-5">
        <div className="flex items-start justify-end gap-1.5">
          <div className="flex flex-col items-end gap-0.5">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-2 py-1 transition-colors',
                'border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.04] focus-within:ring-1 focus-within:ring-[var(--pnl-acento,#57bf8e)]/50',
                flash && 'flash-green',
              )}
            >
              <span className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">R$</span>
              <label htmlFor={`preco-${item.itemCotacaoId}`} className="sr-only">
                {item.unidade === 'Unidade'
                  ? `Preço — ${item.nome}`
                  : `Preço da embalagem (${unitAbbr} c/ ${item.quantidadePorEmbalagemSnapshot}) — ${item.nome}`}
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
                className="w-16 bg-transparent text-right text-[16px] font-semibold tabular-nums text-[var(--pnl-txt,#fff)] outline-none placeholder:text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] disabled:opacity-50 sm:text-[13px]"
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
            {mostrarUnitario && dicaUnitario && (
              <span className="pr-1 text-[10px] tabular-nums text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                {dicaUnitario}
              </span>
            )}
          </div>
          <StatusPreco status={status} temErro={mensagemErro != null} temPreco={temPreco} />
        </div>
      </td>
    </tr>
  )
}
