import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { moeda } from '@/shared/format/formatters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { precoSchema, type ItemLance } from './cotacao-token.schema'
import type { StatusCelula } from './useFilaDeSincronizacao'
import { VistoStatus } from './VistoStatus'

const LIMIAR_SWIPE = 70

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
  index?: number
  podeEditar: boolean
  autoFocus?: boolean
  status: StatusCelula | undefined
  erro: string | undefined
  novo?: boolean
  aoAssentar: (patch: { preco?: number; naoCotado?: boolean }) => void
  /** Avisa a página, a cada tecla/gesto, se o campo tem valor — alimenta a bolha de progresso. */
  onPrecoChange?: (itemCotacaoId: string, temPreco: boolean) => void
}

export function ItemLanceCard({
  item,
  index,
  podeEditar,
  autoFocus,
  status,
  erro,
  novo,
  aoAssentar,
  onPrecoChange,
}: Props) {
  const [precoTexto, setPrecoTexto] = useState(() => precoInicial(item))
  const [erroLocal, setErroLocal] = useState<string | null>(null)

  const valorDebounced = useDebounce(precoTexto.trim(), 800)
  // Guarda o último valor que já foi enviado ao servidor (número em texto, ou '' para não cotado).
  const jaEnviadoRef = useRef(precoInicial(item))

  useEffect(() => {
    if (!podeEditar) return
    if (valorDebounced === jaEnviadoRef.current) return

    if (valorDebounced === '') {
      // Campo esvaziado: só sincroniza "não cotado" se antes havia um preço enviado.
      if (jaEnviadoRef.current !== '') {
        const valorAnterior = jaEnviadoRef.current
        jaEnviadoRef.current = ''
        setErroLocal(null)
        aoAssentar({ naoCotado: true })
        toast('Preço removido', {
          id: `preco-removido-${item.itemCotacaoId}`,
          duration: 4000,
          position: 'top-center',
          action: { label: 'Desfazer', onClick: () => setPrecoTexto(valorAnterior) },
        })
      }
      return
    }

    const n = Number(valorDebounced.replace(',', '.'))
    const parsed = precoSchema.safeParse(n)
    if (!parsed.success) {
      setErroLocal(parsed.error.issues[0]?.message ?? 'Preço inválido')
      return
    }
    setErroLocal(null)
    jaEnviadoRef.current = valorDebounced
    aoAssentar({ preco: parsed.data })
  }, [valorDebounced, podeEditar, aoAssentar])

  // Flash de borda verde quando o preço vai de vazio → preenchido.
  const precoAnteriorRef = useRef(precoTexto)
  const [flashando, setFlashando] = useState(false)
  useEffect(() => {
    if (!precoAnteriorRef.current && precoTexto) {
      setFlashando(false)
      requestAnimationFrame(() => requestAnimationFrame(() => setFlashando(true)))
      const t = setTimeout(() => setFlashando(false), 700)
      precoAnteriorRef.current = precoTexto
      return () => clearTimeout(t)
    }
    precoAnteriorRef.current = precoTexto
  }, [precoTexto])

  function alterarPreco(bruto: string) {
    const val = bruto.replace(/[^0-9.,]/g, '')
    const normalizado = val.replace(',', '.')
    const partes = normalizado.split('.')
    if (partes.length > 2) return
    if (partes[1] !== undefined && partes[1].length > 2) return
    setPrecoTexto(val)
    onPrecoChange?.(item.itemCotacaoId, val.trim() !== '')
  }

  // Deslizar o card para a esquerda além do limiar limpa o preço (= não cotado).
  const toqueInicioX = useRef<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)

  function onTouchStart(e: React.TouchEvent) {
    if (!podeEditar) return
    toqueInicioX.current = e.touches[0].clientX
  }
  function onTouchMove(e: React.TouchEvent) {
    if (toqueInicioX.current === null) return
    const dx = e.touches[0].clientX - toqueInicioX.current
    if (dx < 0) setSwipeOffset(Math.max(dx, -LIMIAR_SWIPE - 20))
  }
  function onTouchEnd() {
    if (swipeOffset < -LIMIAR_SWIPE) {
      setPrecoTexto('')
      onPrecoChange?.(item.itemCotacaoId, false)
    }
    setSwipeOffset(0)
    toqueInicioX.current = null
  }

  const swipeRevelado = swipeOffset < -LIMIAR_SWIPE / 2
  const temPreco = precoTexto.trim() !== ''
  const unitario =
    item.precoUnitario != null
      ? moeda(item.precoUnitario)
      : status === 'enviando' && temPreco
        ? 'calculando…'
        : '—'

  const unitAbbr = UNIT_ABBR[item.unidade] ?? item.unidade
  const unitText =
    item.unidade === 'Unidade'
      ? `${unitAbbr} · comprar ${item.quantidadeSolicitada}`
      : `${unitAbbr} com ${item.quantidadePorEmbalagemSnapshot}un · comprar ${item.quantidadeSolicitada}`

  const mensagem = (() => {
    if (erroLocal) return { texto: erroLocal, cor: 'text-destructive' }
    if (erro) return { texto: erro, cor: 'text-destructive' }
    if (status === 'enviando') return { texto: 'salvando…', cor: 'text-muted-foreground' }
    if (status === 'sincronizado') return { texto: '✓ salvo', cor: 'text-success' }
    if (status === 'falhou')
      return { texto: 'sem conexão — vai salvar quando voltar', cor: 'text-warning' }
    return null
  })()

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Fundo revelado ao deslizar */}
      <div
        className={`absolute inset-y-0 right-0 flex w-20 items-center justify-center rounded-xl bg-destructive transition-opacity duration-150 ${
          swipeRevelado ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div
        className={`flex flex-col gap-2 rounded-xl border bg-card px-4 py-3 transition-colors md:flex-row md:items-center md:gap-4 ${
          flashando ? 'flash-green' : 'border-border'
        }`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 0.25s ease' : 'none',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {index != null && (
          <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground md:flex">
            {index}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            {index != null && (
              <span className="shrink-0 text-[10px] font-semibold text-muted-foreground md:hidden">
                {index}.
              </span>
            )}
            <span className="truncate text-[13px] font-semibold capitalize">{item.nome}</span>
            {novo && (
              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                Novo
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {unitText}
          </p>
          {item.codigoBarras && (
            <p className="mt-0.5 font-mono text-[10px] tracking-wide text-muted-foreground">
              {item.codigoBarras}
            </p>
          )}
        </div>

        <div className="flex items-end gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              P.CX
            </span>
            <label htmlFor={`preco-${item.itemCotacaoId}`} className="sr-only">
              Preço da embalagem
            </label>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 transition-colors focus-within:border-muted-foreground">
              <span className="text-[11px] font-medium text-muted-foreground">R$</span>
              <input
                id={`preco-${item.itemCotacaoId}`}
                type="text"
                inputMode="decimal"
                pattern="[0-9.,]*"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                autoFocus={autoFocus}
                value={precoTexto}
                disabled={!podeEditar}
                onChange={(e) => alterarPreco(e.target.value)}
                placeholder="0,00"
                className="w-20 bg-transparent text-[12px] font-semibold tabular-nums outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              P.UN
            </span>
            <div className="min-w-[114px] rounded-lg border border-border bg-card px-2 py-1 text-center">
              <span
                className={`whitespace-nowrap tabular-nums ${
                  item.precoUnitario != null
                    ? 'text-sm font-semibold text-foreground'
                    : 'text-[11px] text-muted-foreground'
                }`}
              >
                {unitario}
              </span>
            </div>
          </div>
          <VistoStatus filled={temPreco} />
        </div>
      </div>

      {mensagem && (
        <p
          className={`px-4 pt-1 text-[11px] ${mensagem.cor}`}
          role={erro || erroLocal ? 'alert' : undefined}
        >
          {mensagem.texto}
        </p>
      )}
    </div>
  )
}
