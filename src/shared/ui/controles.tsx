import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

const BASE_BOTAO =
  'inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--pnl-acento,#57bf8e)]'

/** Ação principal: menta sólido sobre navy. design.md §2. */
export const BotaoPrimario = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function BotaoPrimario({ className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        BASE_BOTAO,
        'bg-[var(--pnl-acento,#57bf8e)] px-3 py-1.5 text-[var(--pnl-superficie,#12263f)] hover:brightness-110',
        className,
      )}
      {...rest}
    />
  )
})

/** Ação secundária: contorno sutil sobre a superfície. */
export const BotaoFantasma = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function BotaoFantasma({ className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        BASE_BOTAO,
        'border border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/5 px-3 py-1.5 text-[var(--pnl-txt,#fff)] hover:bg-white/10',
        className,
      )}
      {...rest}
    />
  )
})

/** Botão só-ícone (contorno sutil). */
export const BotaoIcone = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }
>(function BotaoIcone({ className, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        BASE_BOTAO,
        'size-8 border border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/5 text-[var(--pnl-txt-2,rgba(255,255,255,0.7))] hover:bg-white/10 hover:text-[var(--pnl-txt,#fff)]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})

/** Input de texto do painel. */
export const CampoTexto = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function CampoTexto({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.04] px-3 py-1.5 text-[13px] text-[var(--pnl-txt,#fff)] placeholder:text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] focus:outline-none focus:ring-1 focus:ring-[var(--pnl-acento,#57bf8e)]/50',
        className,
      )}
      {...rest}
    />
  )
})

/** Campo de busca (input com ícone de lupa). */
export const Busca = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Busca({ className, ...rest }, ref) {
  return (
    <div className={cn('relative', className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--pnl-txt-4,rgba(255,255,255,0.3))]"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        ref={ref}
        type="search"
        className="w-full rounded-md border border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.04] py-1.5 pl-9 pr-3 text-[13px] text-[var(--pnl-txt,#fff)] placeholder:text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] focus:outline-none focus:ring-1 focus:ring-[var(--pnl-acento,#57bf8e)]/50"
        {...rest}
      />
    </div>
  )
})
