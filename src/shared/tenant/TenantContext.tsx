import { useState, type ReactNode } from 'react'
import { ehHostDoApp, resolverSlugDoHostname } from './slug-do-hostname'
import { useSlugExiste } from './tenant.api'
import { TenantContext } from './tenant-context'

export function TenantProvider({ children }: { children: ReactNode }) {
  const [base] = useState(() => {
    const hostname = window.location.hostname
    return { slug: resolverSlugDoHostname(), ehHostDoApp: ehHostDoApp(hostname) }
  })
  const { slug } = base
  const { data, isLoading } = useSlugExiste(slug)

  const existe = slug === null ? null : (data?.existe ?? null)
  const verificando = slug !== null && isLoading

  return (
    <TenantContext.Provider value={{ slug, existe, verificando, ehHostDoApp: base.ehHostDoApp }}>
      {children}
    </TenantContext.Provider>
  )
}
