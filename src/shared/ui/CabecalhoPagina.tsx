import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Cabeçalho padrão de página do painel: título + subtítulo à esquerda, ação
 * primária à direita. design.md §3.
 */
export function CabecalhoPagina({
  titulo,
  subtitulo,
  acao,
  className,
}: {
  titulo: ReactNode
  subtitulo?: ReactNode
  acao?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--pnl-txt,#fff)]">
          {titulo}
        </h1>
        {subtitulo != null && (
          <p className="mt-0.5 text-sm text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
            {subtitulo}
          </p>
        )}
      </div>
      {acao != null && <div className="shrink-0">{acao}</div>}
    </div>
  )
}
