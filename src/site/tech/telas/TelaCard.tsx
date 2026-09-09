import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Superficie, SecaoCabecalho } from '@/shared/ui'

/**
 * Moldura das "telas" recriadas do produto no deck da landing. Agora é só uma
 * casca fina sobre os primitivos do painel (`Superficie` + `SecaoCabecalho`) —
 * eles têm fallback pros `--brand-*`, então funcionam aqui fora do
 * `[data-painel="dark"]`. Mantém o glow e a sombra mais forte da landing.
 */
export function TelaCard({
  titulo,
  pulso = false,
  children,
  className,
}: {
  titulo: string
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
      <Superficie className={cn('shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75)]', className)}>
        <SecaoCabecalho
          titulo={titulo}
          pulso={pulso}
          acao={
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
              Simulação
            </span>
          }
        />
        {children}
      </Superficie>
    </div>
  )
}
