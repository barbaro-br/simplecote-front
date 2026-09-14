import { cn } from "@/shared/lib/utils"
import type { ButtonProps } from "./button"

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground border border-border shadow-sm hover:bg-muted',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline: 'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
}

// Reskin (redesign/stitch-skin): variante do "default" usada só quando o
// toggle "Visual novo" está ligado (ver useVisualNovo) — sombra colorida em
// vez de escurecer no hover, batendo com a referência do Stitch.
const VARIANT_CLASSES_NOVO: Partial<Record<NonNullable<ButtonProps['variant']>, string>> = {
  default: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/85',
}

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ui-uppercase'

// Reskin (redesign/stitch-skin): cantos mais arredondados e sem o
// "bounce" de escala no hover — só com o toggle "Visual novo" ligado.
const BASE_CLASSES_NOVO =
  'inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ui-uppercase'

export function buttonClasses(opts: {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  visualNovo?: boolean
} = {}) {
  const { variant = 'default', size = 'default', className, visualNovo } = opts
  const base = visualNovo ? BASE_CLASSES_NOVO : BASE_CLASSES
  const variante = (visualNovo && VARIANT_CLASSES_NOVO[variant]) || VARIANT_CLASSES[variant]
  return cn(base, variante, SIZE_CLASSES[size], className)
}
