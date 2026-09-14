import { Sparkle } from '@phosphor-icons/react'
import { cn } from '@/shared/lib/utils'
import { useVisualNovo } from '@/shared/hooks/useVisualNovo'

/**
 * Toggle "Visual novo" (redesign/stitch-skin): deixa o cliente experimentar
 * a paleta/tipografia nova sem forçar a troca em ninguém — preferência por
 * navegador (localStorage), reversível a qualquer momento no mesmo botão.
 */
export function VisualNovoToggle({ className }: { className?: string }) {
  const { ligado, alternar } = useVisualNovo()

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={ligado}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
        ligado ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      <Sparkle className="size-4 shrink-0" weight={ligado ? 'fill' : 'regular'} aria-hidden />
      <span className="whitespace-nowrap">{ligado ? 'Visual novo (ativo)' : 'Experimentar visual novo'}</span>
    </button>
  )
}
