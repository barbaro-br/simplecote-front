import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  /** Vira `title` (tooltip nativo no hover pausado) e `aria-label`. */
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: 'default' | 'destructive'
}

// Ação compacta de tabela: só o ícone, com o significado no hover (title) e
// no leitor de tela (aria-label). Sem lib de tooltip.
export function IconButton({ icon: Icon, label, onClick, disabled, tone = 'default' }: Props) {
  const hoverClasses =
    tone === 'destructive'
      ? 'hover:bg-destructive/10 hover:text-destructive'
      : 'hover:bg-muted hover:text-foreground'

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors ${hoverClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none`}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  )
}
