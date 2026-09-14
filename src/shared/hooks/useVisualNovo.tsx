import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const CHAVE_STORAGE = 'simplecote:visual-novo'

type VisualNovoContextValue = {
  ligado: boolean
  alternar: () => void
}

const VisualNovoContext = createContext<VisualNovoContextValue | null>(null)

function lerPreferencia(): boolean {
  try {
    return localStorage.getItem(CHAVE_STORAGE) === '1'
  } catch {
    return false
  }
}

/**
 * Toggle "Visual novo" (redesign/stitch-skin): o cliente escolhe quando
 * trocar pra paleta/tipografia nova — o padrão continua sendo o visual de
 * produção atual até o cliente ligar. Preferência por navegador
 * (localStorage), não por conta — cada dispositivo escolhe o seu.
 *
 * Reflete o estado em `document.documentElement.dataset.visualNovo` e na
 * classe `.v2-theme`.
 */
export function VisualNovoProvider({ children }: { children: ReactNode }) {
  const [ligado, setLigado] = useState(lerPreferencia)

  useEffect(() => {
    document.documentElement.dataset.visualNovo = ligado ? '1' : undefined
    document.documentElement.classList.toggle('v2-theme', ligado)
    try {
      localStorage.setItem(CHAVE_STORAGE, ligado ? '1' : '0')
    } catch {
      // localStorage indisponível — preferência fica só em memória nesta sessão
    }
  }, [ligado])

  function alternar() {
    setLigado((v) => !v)
  }

  return <VisualNovoContext.Provider value={{ ligado, alternar }}>{children}</VisualNovoContext.Provider>
}

const PADRAO_SEM_PROVIDER: VisualNovoContextValue = { ligado: false, alternar: () => {} }

export function useVisualNovo(): VisualNovoContextValue {
  const ctx = useContext(VisualNovoContext)
  return ctx ?? PADRAO_SEM_PROVIDER
}
