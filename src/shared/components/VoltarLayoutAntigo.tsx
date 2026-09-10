import { ArrowUUpLeft } from '@phosphor-icons/react'
import { cn } from '@/shared/lib/utils'

/**
 * Escape hatch da fase de transição do redesign: um link discreto pra voltar
 * ao layout antigo (outra implantação). Só aparece se `VITE_URL_LAYOUT_ANTIGO`
 * estiver definido — sem a env, não renderiza nada.
 */
export function VoltarLayoutAntigo({ className }: { className?: string }) {
  const url = import.meta.env.VITE_URL_LAYOUT_ANTIGO as string | undefined
  if (!url) return null

  return (
    <a
      href={url}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
    >
      <ArrowUUpLeft className="size-4 shrink-0" aria-hidden />
      <span className="whitespace-nowrap">Voltar ao layout antigo</span>
    </a>
  )
}
