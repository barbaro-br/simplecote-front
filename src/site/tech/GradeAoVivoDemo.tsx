import { useEffect, useMemo, useRef, useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { moeda } from '@/shared/format/formatters'
import { temMatchMedia } from './gsap-scroll'
import { useDeveAnimar } from './useReduzirMovimento'
import { TelaCard } from './telas/TelaCard'

// Fornecedores fictícios — é uma simulação, não dado real nem marca existente.
const FORNECEDORES = ['Aurora', 'Meridiano', 'Litoral'] as const

type Produto = {
  nome: string
  ean: string
  embalagem: string
  itensPorEmbalagem: number
  medida: string
  // preço da EMBALAGEM por fornecedor, na ordem de FORNECEDORES
  precos: number[]
  // embalagens/mês — só para a economia projetada ter cara de compra real
  volumeMes: number
}

const PRODUTOS: Produto[] = [
  { nome: 'Arroz tipo 1', ean: '7896006711234', embalagem: 'Fardo', itensPorEmbalagem: 6, medida: '5 kg', precos: [179.4, 174.0, 185.4], volumeMes: 28 },
  { nome: 'Feijão carioca', ean: '7891234500018', embalagem: 'Fardo', itensPorEmbalagem: 10, medida: '1 kg', precos: [84.0, 87.0, 82.0], volumeMes: 40 },
  { nome: 'Óleo de soja', ean: '7891107101235', embalagem: 'Caixa', itensPorEmbalagem: 20, medida: '900 ml', precos: [142.0, 138.0, 148.0], volumeMes: 52 },
  { nome: 'Açúcar refinado', ean: '7896015912346', embalagem: 'Fardo', itensPorEmbalagem: 10, medida: '1 kg', precos: [58.0, 60.5, 56.5], volumeMes: 24 },
  { nome: 'Café torrado', ean: '7896005213457', embalagem: 'Fardo', itensPorEmbalagem: 10, medida: '500 g', precos: [168.0, 159.0, 164.0], volumeMes: 32 },
]

// Cada fornecedor tem piso próprio (82% do lance inicial dele) — assim os
// preços nunca colapsam todos no mesmo número. Sem reset: quando todos
// saturam no piso, a grade fica parada no resultado (economia no teto).
const PISO_FRAC = 0.82
const INTERVALO_MS = 1500

const round2 = (n: number) => Math.round(n * 100) / 100
const idxMenor = (xs: number[]) => xs.indexOf(Math.min(...xs))

function eanFormatado(ean: string) {
  return ean.replace(/(\d{4})(\d{4})(\d{5})/, '$1 $2 $3')
}

function economiaProjetada(precos: number[][]): number {
  return PRODUTOS.reduce((soma, p, r) => {
    const queda = Math.min(...p.precos) - Math.min(...precos[r])
    return soma + Math.max(0, queda) * p.volumeMes
  }, 0)
}

/**
 * Grade ao vivo do produto rodando sozinha na home: os fornecedores vão
 * cobrindo o menor preço da embalagem item a item, sempre um pouco abaixo do
 * concorrente (nunca empatando), a célula vencedora acende e a economia
 * projetada sobe. Roteirizada (sem back, sem dado real). Respeita
 * `prefers-reduced-motion` — sem timers, estado assentado. `ativo` liga a
 * animação só quando este slide do deck está visível.
 */
export function GradeAoVivoDemo({ ativo = true }: { ativo?: boolean }) {
  const anima = useDeveAnimar() && temMatchMedia() && ativo

  const [precos, setPrecos] = useState<number[][]>(() => PRODUTOS.map((p) => [...p.precos]))
  const [flash, setFlash] = useState<{ r: number; c: number; k: number } | null>(null)
  const flashK = useRef(0)

  useEffect(() => {
    if (!anima) return
    const id = window.setInterval(() => {
      setPrecos((atual) => {
        const r = Math.floor(Math.random() * atual.length)
        const linha = atual[r]
        const min = Math.min(...linha)
        const vencedor = linha.indexOf(min)
        // um fornecedor que não é o vencedor e ainda tem folga até o piso dele
        const candidatos = linha
          .map((preco, c) => ({ preco, c }))
          .filter(({ preco, c }) => c !== vencedor && preco > PRODUTOS[r].precos[c] * PISO_FRAC + 0.02)
        if (!candidatos.length) return atual
        const { c } = candidatos[Math.floor(Math.random() * candidatos.length)]
        // cobre o menor por 0,8%–2,2%, sem furar o piso do próprio fornecedor
        const alvo = Math.max(
          PRODUTOS[r].precos[c] * PISO_FRAC,
          min * (1 - (0.008 + Math.random() * 0.014)),
        )
        const proxima = atual.map((l) => [...l])
        proxima[r][c] = round2(alvo)
        flashK.current += 1
        setFlash({ r, c, k: flashK.current })
        return proxima
      })
    }, INTERVALO_MS)
    return () => window.clearInterval(id)
  }, [anima])

  const economia = useMemo(() => economiaProjetada(precos), [precos])
  const economiaSuave = useNumeroSuave(economia, anima)

  return (
    <TelaCard titulo="Grade ao vivo" pulso={anima}>
      <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] border-collapse text-left">
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
              {precos.map((linha, r) => {
                const prod = PRODUTOS[r]
                const vencedor = idxMenor(linha)
                return (
                  <tr key={prod.nome} className="border-t border-white/[0.07] align-top">
                    <td className="whitespace-nowrap px-4 py-2.5 sm:px-5">
                      <div className="text-[13px] font-semibold text-white">{prod.nome}</div>
                      <div className="text-[11px] text-white/45">
                        {prod.embalagem} c/ {prod.itensPorEmbalagem} · {prod.medida}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] tracking-tight text-white/30">
                        {eanFormatado(prod.ean)}
                      </div>
                    </td>
                    {linha.map((preco, c) => {
                      const vencendo = c === vencedor
                      const piscando = flash?.r === r && flash?.c === c
                      const unit = preco / prod.itensPorEmbalagem
                      return (
                        <td key={c} className="px-2 py-2.5 text-right">
                          <span
                            key={piscando ? flash!.k : 'x'}
                            className={`inline-flex flex-col items-end rounded-md px-2 py-1 text-[13px] tabular-nums transition-colors duration-500 ${
                              vencendo
                                ? 'bg-brand-mint/15 font-semibold text-brand-mint-bright ring-1 ring-brand-mint/40'
                                : 'text-white/60'
                            } ${piscando && vencendo ? 'flash-green' : ''}`}
                          >
                            <span className="inline-flex items-center gap-1">
                              {vencendo && <CaretDown className="size-3" weight="bold" aria-hidden />}
                              {moeda(preco)}
                            </span>
                            <span
                              className={`text-[10px] font-normal ${vencendo ? 'text-brand-mint-bright/70' : 'text-white/30'}`}
                            >
                              {moeda(unit)}/un
                            </span>
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
    </TelaCard>
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
