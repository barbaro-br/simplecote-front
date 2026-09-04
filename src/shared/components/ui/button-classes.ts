import { cn } from "@/shared/lib/utils"
import type { ButtonProps } from "./button"

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground border border-border shadow-sm hover:bg-muted',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline: 'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
}

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'

export function buttonClasses(opts: {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
} = {}) {
  const { variant = 'default', size = 'default', className } = opts
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)
}
