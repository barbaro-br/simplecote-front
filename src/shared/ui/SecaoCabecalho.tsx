import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Topo de uma `Superficie`: título à esquerda (com dot opcional, `pulso` →
 * animação de "ao vivo"), slot de ação livre à direita (selo de status,
 * contador, botão-ícone). design.md §2.
 */
export function SecaoCabecalho({
  titulo,
  pulso = false,
  acao,
  /** quando definido, o título vira um `<h{nivel}>` (para telas que precisam de heading) */
  nivelTitulo,
  className,
}: {
  titulo: ReactNode
  pulso?: boolean
  acao?: ReactNode
  nivelTitulo?: 1 | 2 | 3
  className?: string
}) {
  const Titulo = nivelTitulo ? (`h${nivelTitulo}` as 'h1' | 'h2' | 'h3') : 'span'
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-5',
        'border-[var(--pnl-borda,rgba(255,255,255,0.1))]',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-[var(--pnl-txt,#fff)]">
        <span className="relative flex size-2 shrink-0">
          {pulso && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--pnl-acento,#57bf8e)]/70" />
          )}
          <span className="relative inline-flex size-2 rounded-full bg-[var(--pnl-acento,#57bf8e)]" />
        </span>
        <Titulo className="truncate">{titulo}</Titulo>
      </div>
      {acao != null && <div className="flex shrink-0 items-center gap-2">{acao}</div>}
    </div>
  )
}

/**
 * Faixa de contexto logo abaixo do cabeçalho: rótulo à esquerda, contagem/estado
 * à direita. Ex.: "Convites da cotação" · "3 de 5 responderam".
 */
export function SubFaixa({
  esquerda,
  direita,
  className,
}: {
  esquerda: ReactNode
  direita?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b px-4 py-2.5 text-[11px] sm:px-5',
        'border-[var(--pnl-borda,rgba(255,255,255,0.1))]',
        className,
      )}
    >
      <span className="text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">{esquerda}</span>
      {direita != null && (
        <span className="text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">{direita}</span>
      )}
    </div>
  )
}
