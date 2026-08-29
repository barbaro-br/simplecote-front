
import { cn } from '@/shared/lib/utils'

type ToggleDuploProps = {
  naoCotado: boolean
  onChange: (naoCotado: boolean) => void
  disabled?: boolean
  className?: string
}

export function ToggleDuplo({ naoCotado, onChange, disabled, className }: ToggleDuploProps) {
  return (
    <div
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full',
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled}
        aria-pressed={!naoCotado}
        onClick={() => onChange(false)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-1/2',
          !naoCotado && 'bg-background text-foreground shadow-sm'
        )}
      >
        Vou cotar
      </button>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={naoCotado}
        onClick={() => onChange(true)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-1/2',
          naoCotado && 'bg-background text-foreground shadow-sm'
        )}
      >
        Não cotado
      </button>
    </div>
  )
}
