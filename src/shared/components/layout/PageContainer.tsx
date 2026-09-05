import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

export type PageMaxWidth = 'md' | 'lg' | '4xl' | '5xl' | 'full'

const MAX_WIDTH_CLASSES: Record<PageMaxWidth, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  // Telas com tabela/grade densa (ex: grade ao vivo) — usa mais da largura
  // disponível em telas grandes, sem ir de ponta a ponta.
  full: 'max-w-[1600px]',
}

type PageContainerProps = { maxWidth: PageMaxWidth } & HTMLAttributes<HTMLDivElement>

export function PageContainer({ maxWidth, className, ...props }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full', MAX_WIDTH_CLASSES[maxWidth], className)} {...props} />
  )
}
