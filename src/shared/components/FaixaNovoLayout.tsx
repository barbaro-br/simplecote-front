import { useState } from 'react'
import { Sparkle, X, ArrowRight } from '@phosphor-icons/react'

const CHAVE = 'simplecote:faixa-novo-layout-dispensada'

function foiDispensada(): boolean {
  try {
    return localStorage.getItem(CHAVE) === '1'
  } catch {
    return false
  }
}

/**
 * Faixa de transição do redesign: convida a experimentar o layout novo (outra
 * implantação). Só aparece se `VITE_URL_LAYOUT_NOVO` estiver definido; pode ser
 * dispensada (fica dispensada, guardado no navegador).
 */
export function FaixaNovoLayout() {
  const url = import.meta.env.VITE_URL_LAYOUT_NOVO as string | undefined
  const [dispensada, setDispensada] = useState(foiDispensada)

  if (!url || dispensada) return null

  function dispensar() {
    try {
      localStorage.setItem(CHAVE, '1')
    } catch {
      // localStorage indisponível — some só nesta sessão
    }
    setDispensada(true)
  }

  return (
    <div className="flex items-center gap-3 border-b border-primary/20 bg-primary/[0.08] px-4 py-2 text-sm">
      <Sparkle className="size-4 shrink-0 text-primary" weight="fill" aria-hidden />
      <p className="min-w-0 flex-1 text-foreground/90">
        Tem um <span className="font-medium">novo layout do painel</span> pra experimentar — mais
        limpo e rápido.
      </p>
      <a
        href={url}
        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Experimentar
        <ArrowRight className="size-3.5" aria-hidden />
      </a>
      <button
        type="button"
        onClick={dispensar}
        aria-label="Dispensar aviso do novo layout"
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
