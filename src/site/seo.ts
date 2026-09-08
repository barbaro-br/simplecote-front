import { useEffect } from 'react'

function garantirMeta(nomeOuPropriedade: string, usaPropriedade: boolean): HTMLMetaElement {
  const seletor = usaPropriedade
    ? `meta[property="${nomeOuPropriedade}"]`
    : `meta[name="${nomeOuPropriedade}"]`
  let meta = document.querySelector<HTMLMetaElement>(seletor)
  if (!meta) {
    meta = document.createElement('meta')
    if (usaPropriedade) meta.setAttribute('property', nomeOuPropriedade)
    else meta.name = nomeOuPropriedade
    document.head.appendChild(meta)
  }
  return meta
}

/**
 * SEO básico por página do site (SPA): define o `<title>`, a
 * `<meta name="description">` e, opcionalmente, o `og:image`. Sem SSR/prerender.
 */
export function useSEO(titulo: string, descricao: string, ogImage?: string): void {
  useEffect(() => {
    document.title = titulo
    garantirMeta('description', false).content = descricao
    if (ogImage) garantirMeta('og:image', true).content = ogImage
  }, [titulo, descricao, ogImage])
}
