import type { HTMLAttributes } from "react"
import { cn } from "@/shared/lib/utils"

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-shimmer rounded-md", className)} {...props} />
}

/**
 * Esqueleto composto de uma linha de lista: avatar circular + duas barras de
 * texto. Usado nos estados de carregamento de listas/modal densos (ex. modal
 * de Representantes), substituindo o "nada" ou spinners gigantes pelo formato
 * esperado do conteúdo (spec.md §8, change melhoria-ux-performance-grid).
 */
export function RowSkeleton() {
  return (
    <li aria-hidden className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-6 w-14 rounded-full shrink-0" />
    </li>
  )
}
