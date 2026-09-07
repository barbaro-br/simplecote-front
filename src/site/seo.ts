import { useEffect } from 'react'

/**
 * SEO básico por página do site (SPA): define o `<title>` e a
 * `<meta name="description">` da aba. Sem SSR/prerender por ora.
 */
export function useSEO(titulo: string, descricao: string): void {
  useEffect(() => {
    document.title = titulo
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = descricao
  }, [titulo, descricao])
}
