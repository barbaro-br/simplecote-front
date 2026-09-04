import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

export function ErrorAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
    >
      <AlertTriangle className="size-4 shrink-0" />
      {children}
    </div>
  )
}
