import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/** Container de lista — aplica as divisórias entre as `LinhaLista`. */
export function Lista({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ul
      className={cn(
        'divide-y divide-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]',
        className,
      )}
    >
      {children}
    </ul>
  )
}

function Iniciais({ texto }: { texto: string }) {
  const iniciais = texto
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[11px] font-semibold text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
      {iniciais}
    </span>
  )
}

/**
 * Linha de lista do painel: avatar (iniciais ou nó), título + meta, slot à
 * direita. Vira `<button>` quando tem `onClick`. design.md §2.
 */
export function LinhaLista({
  avatar,
  titulo,
  meta,
  fim,
  onClick,
  className,
}: {
  /** string → tile de iniciais; ReactNode → usado como está; ausente → sem avatar */
  avatar?: string | ReactNode
  titulo: ReactNode
  meta?: ReactNode
  fim?: ReactNode
  onClick?: () => void
  className?: string
}) {
  const conteudo = (
    <>
      {typeof avatar === 'string' ? <Iniciais texto={avatar} /> : avatar}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-[var(--pnl-txt,#fff)]">
          {titulo}
        </span>
        {meta != null && (
          <span className="block truncate text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            {meta}
          </span>
        )}
      </span>
      {fim != null && <span className="flex shrink-0 items-center gap-2">{fim}</span>}
    </>
  )

  const base = cn('flex w-full items-center gap-3 px-4 py-3 text-left sm:px-5', className)

  return onClick ? (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(base, 'transition-colors hover:bg-white/[0.03]')}
      >
        {conteudo}
      </button>
    </li>
  ) : (
    <li className={base}>{conteudo}</li>
  )
}
