import { useEffect } from 'react'

const AUTO_DISPENSA_MS = 3000

/**
 * Tela cheia de confirmação após finalizar a cotação
 * (change redesign-tela-preco-representante). Some sozinha após ~3s.
 */
export function TelaDeSucesso({ nome, aoFechar }: { nome: string; aoFechar: () => void }) {
  useEffect(() => {
    const t = setTimeout(aoFechar, AUTO_DISPENSA_MS)
    return () => clearTimeout(t)
  }, [aoFechar])

  return (
    <div className="fade-in fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="success-pop flex flex-col items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-xl">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12l5 5L20 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">Cotação enviada!</p>
          <p className="mt-1 text-sm text-muted-foreground">Obrigado, {nome}. Até a próxima.</p>
        </div>
      </div>
      <button
        onClick={aoFechar}
        className="absolute bottom-12 text-[13px] text-muted-foreground underline underline-offset-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        Fechar
      </button>
    </div>
  )
}
