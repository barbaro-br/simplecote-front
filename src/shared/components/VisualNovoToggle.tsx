import { Sparkle } from '@phosphor-icons/react'
import { cn } from '@/shared/lib/utils'
import { useVisualNovo } from '@/shared/hooks/useVisualNovo'

/**
 * Toggle "Visual novo" (redesign/stitch-skin): deixa o cliente experimentar
 * a paleta/tipografia nova sem forçar a troca em ninguém — preferência por
 * navegador (localStorage), reversível a qualquer momento no mesmo botão.
 */
interface VisualNovoToggleProps {
  className?: string
  recolhido?: boolean
}

export function VisualNovoToggle({ className, recolhido = false }: VisualNovoToggleProps) {
  const { ligado, alternar } = useVisualNovo()

  if (recolhido) {
    return (
      <button
        type="button"
        onClick={alternar}
        aria-pressed={ligado}
        title={ligado ? 'Voltar para o visual clássico' : 'Ativar novo visual (Recomendado)'}
        className={cn(
          'relative flex items-center justify-center size-10 rounded-xl transition-all mx-auto cursor-pointer',
          ligado
            ? 'bg-white/5 text-on-surface-variant hover:text-on-surface hover:bg-white/10 border border-white/10'
            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
          className,
        )}
      >
        <Sparkle className="size-5 shrink-0" weight={ligado ? 'regular' : 'fill'} aria-hidden />
        {!ligado && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
      </button>
    )
  }

  // Se o usuário desativou o novo visual, exibe card chamando para reativar
  if (!ligado) {
    return (
      <button
        type="button"
        onClick={alternar}
        aria-pressed={false}
        className={cn(
          'w-full relative group overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 hover:from-emerald-500/25 hover:to-teal-500/20 p-2.5 text-left transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Sparkle className="size-4 shrink-0 animate-pulse text-emerald-300" weight="fill" />
            <span>Ativar Visual Novo</span>
          </div>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground group-hover:text-foreground/90 transition-colors leading-tight">
          Voltar para a nova grade contábil, prévia de apuração e dashboard financeiro.
        </p>
      </button>
    )
  }

  // Visual novo ativo (padrão): botão discreto para voltar ao visual clássico se desejado
  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={true}
      title="Alternar para a versão anterior do painel"
      className={cn(
        'w-full flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-white/[0.07] transition-colors cursor-pointer',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Sparkle className="size-3.5 shrink-0 text-primary" weight="fill" aria-hidden />
        <span className="text-[11px]">Visual novo padrão</span>
      </div>
      <span className="text-[10px] text-on-surface-variant/70 hover:text-on-surface underline">
        Visual clássico
      </span>
    </button>
  )
}
