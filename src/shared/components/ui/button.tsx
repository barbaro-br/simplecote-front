import * as React from "react"
import { buttonClasses } from "./button-classes"
import { useVisualNovo } from "@/shared/hooks/useVisualNovo"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const { ligado: visualNovo } = useVisualNovo()
    return (
      <button
        ref={ref}
        className={buttonClasses({ variant, size, className, visualNovo })}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
