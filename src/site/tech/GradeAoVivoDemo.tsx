import { useEffect, useMemo, useRef, useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { moeda } from '@/shared/format/formatters'
import { temMatchMedia } from './gsap-scroll'
import { useDeveAnimar } from './useReduzirMovimento'

// Fornecedores fictícios — é uma simulação, não dado real nem marca existente.
const FORNECEDORES = ['Aurora', 'Meridiano', 'Litoral'] as const

type Linha = { item: string; unidade: string; precos: number[]; volume: number }

// `precos` na ordem dos FORNECEDORES. `volume` = itens/mês só para a conta de
// economia projetada dar um número com cara de compra de supermercado.
const LINHAS_INICIAIS: Linha[] = [
  { item: 'Arroz', unidade: 'tipo 1 · 5 kg', precos: [27.9, 26.4, 28.1], volume: 640 },
  { item: 'Feijão', unidade: 'carioca · 1 kg', precos: [8.9, 9.2, 8.6], volume: 960 },
  { item: 'Óleo', unidade: 'soja · 900 ml', precos: [7.4, 7.1, 7.65], volume: 1200 },
  { item: 'Açúcar', unidade: 'refinado · 5 kg', precos: [21.5, 22.3, 21.1], volume: 520 },
  { item: 'Café', unidade: 'torrado · 500 g', precos: [16.8, 15.9, 16.4], volume: 600 },
]

const PISO = 0.72 // preço não cai abaixo de 72% do menor lance inicial da linha
const INTERVALO_MS = 1500

function menor(precos: number[]): number {
  return Math.min(...precos)
}

function economiaProjetada(linhas: Linha[]): number {
  return LINHAS_INICIAIS.reduce((soma, base, i) => {
    const queda = menor(base.precos) - menor(linhas[i].precos)
    return soma + Math.max(0, queda) * base.volume
  }, 0)
}

/**
 * Grade ao vivo do produto rodando sozinha na home: os fornecedores vão
 * cobrindo o menor preço item a item, a célula vencedora acende e a economia
 * projetada sobe. É roteirizada (sem back, sem dado real) e respeita
 * `prefers-reduced-motion` — sem timers, mostra um estado assentado.
 */
export function GradeAoVivoDemo() {
  const anima = useDeveAnimar() && temMatchMedia()

  const [linhas, setLinhas] = useState<Linha[]>(() =>
    LINHAS_INICIAIS.map((l) => ({ ...l, precos: [...l.precos] })),
  )
  const [flash, setFlash] = useState<{ r: number; c: number; k: number } | null>(null)
  const flashK = useRef(0)

  useEffect(() => {
    if (!anima) return
    const id = window.setInterval(() => {
      setLinhas((atual) => {
        const noPiso = atual.every((l, i) => menor(l.precos) <= menor(LINHAS_INICIAIS[i].precos) * PISO + 0.001)
        if (noPiso) {
          return LINHAS_INICIAIS.map((l) => ({ ...l, precos: [...l.precos] }))
        }
        const r = Math.floor(Math.random() * atual.length)
        const linha = atual[r]
        const alvo = menor(linha.precos)
        const piso = menor(LINHAS_INICIAIS[r].precos) * PISO
        // um fornecedor que não é o atual vencedor cobre por baixo
        const candidatos = linha.precos
          .map((p, c) => ({ p, c }))
          .filter(({ p }) => p > alvo)
        if (!candidatos.length) return atual
        const { c } = candidatos[Math.floor(Math.random() * candidatos.length)]
        const novo = Math.max(piso, alvo * (0.965 - Math.random() * 0.03))
        const precos = [...linha.precos]
        precos[c] = Math.round(novo * 100) / 100
        flashK.current += 1
        setFlash({ r, c, k: flashK.current })
        const copia = [...atual]
        copia[r] = { ...linha, precos }
        return copia
      })
    }, INTERVALO_MS)
    return () => window.clearInterval(id)
  }, [anima])

  const economia = useMemo(() => economiaProjetada(linhas), [linhas])
  const economiaSuave = useNumeroSuave(economia, anima)

  return (
    <div className="relative w-full max-w-2xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-brand-mint/20 blur-3xl"
      />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-navy-deep/95 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75)] ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 sm:px-5">
          <span className="flex items-center gap-2 text-xs font-medium text-white/85">
            <span className="relative flex size-2">
              {anima && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-mint/70" />
              )}
              <span className="relative inline-flex size-2 rounded-full bg-brand-mint" />
            </span>
            Grade ao vivo
          </span>
          <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
            Simulação
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-white/40">
                <th className="px-4 py-2 font-medium sm:px-5">Item</th>
                {FORNECEDORES.map((f) => (
                  <th key={f} className="px-2 py-2 text-right font-medium">
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha, r) => {
                const min = menor(linha.precos)
                return (
                  <tr key={linha.item} className="border-t border-white/[0.07]">
                    <td className="whitespace-nowrap px-4 py-2.5 sm:px-5">
                      <div className="text-[13px] font-semibold text-white">{linha.item}</div>
                      <div className="text-[11px] text-white/40">{linha.unidade}</div>
                    </td>
                    {linha.precos.map((preco, c) => {
                      const vencendo = preco === min
                      const piscando = flash?.r === r && flash?.c === c
                      return (
                        <td key={c} className="px-2 py-2.5 text-right">
                          <span
                            key={piscando ? flash!.k : 'x'}
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] tabular-nums transition-colors duration-500 ${
                              vencendo
                                ? 'bg-brand-mint/15 font-semibold text-brand-mint-bright ring-1 ring-brand-mint/40'
                                : 'text-white/65'
                            } ${piscando && vencendo ? 'flash-green' : ''}`}
                          >
                            {vencendo && <CaretDown className="size-3" weight="bold" aria-hidden />}
                            {moeda(preco)}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-white/10 bg-white/[0.03] px-4 py-3 sm:px-5">
          <span className="text-xs text-white/55">Economia projetada nesta cotação</span>
          <span className="text-lg font-bold text-brand-mint-bright tabular-nums sm:text-xl">
            {moeda(Math.round(economiaSuave))}
            <span className="ml-1 text-xs font-normal text-white/40">/ mês</span>
          </span>
        </div>
      </div>
    </div>
  )
}

/** Tween simples de um número até `alvo` (sem lib, sem setState síncrono no efeito). */
function useNumeroSuave(alvo: number, ativo: boolean): number {
  const [tween, setTween] = useState(alvo)
  const deRef = useRef(alvo)

  useEffect(() => {
    if (!ativo) return
    const inicio = performance.now()
    const de = deRef.current
    let raf = 0
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / 500)
      const v = de + (alvo - de) * (1 - Math.pow(1 - t, 3))
      setTween(v)
      deRef.current = v
      if (t < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [alvo, ativo])

  return ativo ? tween : alvo
}
