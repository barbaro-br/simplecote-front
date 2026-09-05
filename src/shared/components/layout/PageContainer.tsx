import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

export type PageMaxWidth = 'md' | 'lg' | '4xl' | '5xl'

const MAX_WIDTH_CLASSES: Record<PageMaxWidth, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
}

type PageContainerProps = { maxWidth: PageMaxWidth } & HTMLAttributes<HTMLDivElement>

export function PageContainer({ maxWidth, className, ...props }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full', MAX_WIDTH_CLASSES[maxWidth], className)} {...props} />
  )
}
