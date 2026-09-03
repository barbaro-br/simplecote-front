import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export type BreadcrumbItem = {
  label: string
  to?: string
}

/**
 * Trilha de navegação horizontal. Itens com `to` (e que não são o atual)
 * renderizam como `Link`; o segmento atual (último item, ou qualquer item sem
 * `to`) renderiza como texto simples, não clicável.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, index) => {
        const ehAtual = index === items.length - 1 || !item.to
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
            )}
            {item.to && !ehAtual ? (
              <Link
                to={item.to}
                className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
