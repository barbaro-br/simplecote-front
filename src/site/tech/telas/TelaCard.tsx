import type { ReactNode } from 'react'

/**
 * Moldura escura padrão das "telas" recriadas do produto no deck da home
 * (superfície `brand-navy-deep`, glow mint atrás, cabeçalho com rótulo +
 * etiqueta "Simulação"). Ver `paleta-grade-ao-vivo.md`.
 */
export function TelaCard({
  titulo,
  pulso = false,
  children,
  className,
}: {
  titulo: string
  /** ponto verde piscando ao lado do título (só faz sentido em tela "ao vivo") */
  pulso?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className="relative w-full min-w-0 max-w-2xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-brand-mint/20 blur-3xl"
      />
      <div
        className={`overflow-hidden rounded-2xl border border-white/10 bg-brand-navy-deep shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75)] ring-1 ring-inset ring-white/[0.06] ${className ?? ''}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 sm:px-5">
          <span className="flex items-center gap-2 text-xs font-medium text-white/85">
            <span className="relative flex size-2">
              {pulso && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-mint/70" />
              )}
              <span className="relative inline-flex size-2 rounded-full bg-brand-mint" />
            </span>
            {titulo}
          </span>
          <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
            Simulação
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
