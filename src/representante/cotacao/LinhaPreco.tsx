import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { CloudSlash, WarningCircle, X } from '@phosphor-icons/react'
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

type EstadoCaixa = 'vazio' | 'pulado' | 'salvando' | 'salvo' | 'offline' | 'erro'

// Toda a comunicação de estado mora na cor da borda do campo — sem ícone de
// "salvo" fixo (o quadradinho de status ao lado do × confundia: pareciam duas
// coisas competindo pelo mesmo espaço). "Pulado" é só um aviso — não é erro.
function classeEstadoCaixa(estado: EstadoCaixa): string {
  switch (estado) {
    case 'salvo':
      return 'border-[var(--pnl-acento,#57bf8e)]/55'
    case 'salvando':
      return 'border-[var(--pnl-acento,#57bf8e)]/35'
    case 'offline':
      return 'border-[var(--pnl-atencao,#e0a030)]/60'
    case 'erro':
      return 'border-[var(--pnl-perigo,#ff6b6b)]/60'
    case 'pulado':
      return 'border-[var(--pnl-perigo,#ff6b6b)]/45 bg-[var(--pnl-perigo,#ff6b6b)]/[0.07]'
    default:
      return 'border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.04]'
  }
}

type Props = {
  item: ItemLance
  podeEditar: boolean
  autoFocus?: boolean
  status?: StatusCelula
  erro?: string
  novo?: boolean
  /** Sem preço e algum item depois dele (na ordem exibida) já tem — provavelmente pulado. */
  pulado?: boolean
  aoAssentar: (patch: { preco?: number; naoCotado?: boolean }) => void
  onPrecoChange?: (itemCotacaoId: string, temPreco: boolean) => void
}

/**
 * Cartão de preço do representante (redesign-painel-dark). Substitui o
 * `ItemLanceCard` antigo E a versão em linha de tabela: nome ocupa a largura
 * toda numa linha própria (só quebra se for realmente comprido); o preço fica
 * numa segunda linha, ao lado da embalagem — nada disputando coluna. Mesma
 * lógica de autosave de sempre (debounce 800ms + `precoSchema` + toast
 * "Desfazer" ao limpar).
 */
export function LinhaPreco({
  item,
  podeEditar,
  autoFocus,
  status,
  erro,
  novo,
  pulado,
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

  const estado: EstadoCaixa = mensagemErro
    ? 'erro'
    : status === 'falhou'
      ? 'offline'
      : status === 'enviando'
        ? 'salvando'
        : status === 'sincronizado' || temPreco
          ? 'salvo'
          : pulado
            ? 'pulado'
            : 'vazio'

  // Só existe UM elemento nesse slot por vez — nunca um selo de "salvo" e um ×
  // de limpar juntos. Prioridade: erro > offline > salvando > limpar.
  let conteudoSlot: ReactNode = null
  if (mensagemErro) {
    conteudoSlot = (
      <WarningCircle
        weight="fill"
        className="size-3.5 text-[var(--pnl-perigo,#ff6b6b)]"
        aria-label="preço com erro"
      />
    )
  } else if (status === 'falhou') {
    conteudoSlot = (
      <CloudSlash
        className="size-3.5 text-[var(--pnl-atencao,#e0a030)]"
        aria-label="sem conexão — salva quando voltar"
      />
    )
  } else if (status === 'enviando') {
    conteudoSlot = (
      <span
        role="img"
        aria-label="salvando"
        className="size-3 animate-spin rounded-full border-2 border-[var(--pnl-acento,#57bf8e)] border-t-transparent"
      />
    )
  } else if (temPreco && podeEditar) {
    conteudoSlot = (
      <button
        type="button"
        aria-label={`Limpar preço de ${item.nome}`}
        onClick={() => alterar('')}
        className="flex items-center justify-center text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] transition-colors hover:text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]"
      >
        <X className="size-3" weight="bold" aria-hidden />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-[var(--pnl-superficie,#12263f)] px-3.5 py-3 transition-colors',
        'border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]',
        flash && 'flash-green',
      )}
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[13px] font-semibold capitalize text-[var(--pnl-txt,#fff)]">
          {item.nome}
        </span>
        {novo && (
          <span className="shrink-0 rounded-full bg-[var(--pnl-acento,#57bf8e)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--pnl-acento-hi,#6fe6ac)]">
            Novo
          </span>
        )}
      </div>
      {item.codigoBarras && (
        <div className="mt-0.5 font-mono text-[10px] tracking-tight text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
          {item.codigoBarras}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
          {sub}
        </span>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          {/* `data-estado`: gancho de teste (o estado não tem mais ícone fixo
              pra mirar — vive só na cor da borda). */}
          <span
            data-estado={estado}
            className={cn(
              'flex w-[108px] items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors',
              classeEstadoCaixa(estado),
              'focus-within:border-[var(--pnl-acento,#57bf8e)] focus-within:ring-1 focus-within:ring-[var(--pnl-acento,#57bf8e)]/50',
            )}
          >
            <span className="shrink-0 text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">R$</span>
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
              className="min-w-0 flex-1 bg-transparent text-right text-[16px] font-semibold tabular-nums text-[var(--pnl-txt,#fff)] outline-none placeholder:text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] disabled:opacity-50 sm:text-[13px]"
            />
            <span className="flex size-3.5 shrink-0 items-center justify-center">{conteudoSlot}</span>
          </span>
          {mostrarUnitario && dicaUnitario && (
            <span className="pr-1 text-[10px] tabular-nums text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
              {dicaUnitario}
            </span>
          )}
        </div>
      </div>

      {/* Erro só pra leitor de tela — o feedback visual é a cor da borda, que
          não empurra o cartão de baixo (antes o texto "salvo" mudava a
          altura e deslocava a lista). */}
      {mensagemErro && (
        <p role="alert" className="sr-only">
          {mensagemErro}
        </p>
      )}
    </div>
  )
}
