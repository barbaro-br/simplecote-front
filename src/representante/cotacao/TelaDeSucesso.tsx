import { useEffect } from 'react'

const AUTO_DISPENSA_MS = 3000

/**
 * Tela cheia de confirmação após finalizar a cotação. Some sozinha após ~3s.
 * Tema escuro (redesign-painel-dark, Fase 1).
 */
export function TelaDeSucesso({ nome, aoFechar }: { nome: string; aoFechar: () => void }) {
  useEffect(() => {
    const t = setTimeout(aoFechar, AUTO_DISPENSA_MS)
    return () => clearTimeout(t)
  }, [aoFechar])

  return (
    <div
      data-painel="dark"
      className="fade-in fixed inset-0 z-50 flex flex-col items-center justify-center"
    >
      <div className="success-pop flex flex-col items-center gap-4">
        <div className="flex size-24 items-center justify-center rounded-full bg-[var(--pnl-acento,#57bf8e)] shadow-xl">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12l5 5L20 7"
              stroke="var(--pnl-superficie,#12263f)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--pnl-txt,#fff)]">Cotação enviada!</p>
          <p className="mt-1 text-sm text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            Obrigado, {nome}. Até a próxima.
          </p>
        </div>
      </div>
      <button
        onClick={aoFechar}
        className="absolute bottom-12 text-[13px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))] underline underline-offset-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        Fechar
      </button>
    </div>
  )
}
