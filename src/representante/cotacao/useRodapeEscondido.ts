import { useEffect, useState } from 'react'

const CONSULTA_MOBILE = '(max-width: 767px)'
const LIMIAR_ROLAGEM = 6 // px de movimento pra contar como "rolou"
const MARGEM_FIM = 160 // px do fim da página em que o rodapé volta a aparecer

function ehMobile(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(CONSULTA_MOBILE).matches
}

function ehCampoPreco(alvo: EventTarget | null): boolean {
  return alvo instanceof HTMLElement && alvo.id.startsWith('preco-')
}

/**
 * Rodapé fixo da tela de resposta em telas de celular (iOS Safari, Android
 * Chrome, etc.): esconde enquanto um preço está sendo digitado (o teclado do
 * iOS deixa a barra fixa presa atrás dele) e enquanto o representante rola a
 * lista para baixo lendo; reaparece ao rolar para cima ou ao chegar perto do
 * fim. Em desktop (e no jsdom, sem `matchMedia`) retorna sempre `false` — nada
 * muda.
 */
export function useRodapeEscondido(): boolean {
  const [mobile] = useState(ehMobile)
  const [precoFocado, setPrecoFocado] = useState(false)
  const [rolandoParaBaixo, setRolandoParaBaixo] = useState(false)
  const [pertoDoFim, setPertoDoFim] = useState(false)

  useEffect(() => {
    if (!mobile) return
    const aoFocar = (e: FocusEvent) => {
      if (ehCampoPreco(e.target)) setPrecoFocado(true)
    }
    const aoDesfocar = (e: FocusEvent) => {
      if (ehCampoPreco(e.target)) setPrecoFocado(false)
    }
    document.addEventListener('focusin', aoFocar)
    document.addEventListener('focusout', aoDesfocar)
    return () => {
      document.removeEventListener('focusin', aoFocar)
      document.removeEventListener('focusout', aoDesfocar)
    }
  }, [mobile])

  useEffect(() => {
    if (!mobile) return
    let ultimoY = window.scrollY
    let raf = 0
    const avaliar = () => {
      const y = window.scrollY
      const doc = document.documentElement
      setPertoDoFim(window.innerHeight + y >= doc.scrollHeight - MARGEM_FIM)
      if (Math.abs(y - ultimoY) > LIMIAR_ROLAGEM) {
        setRolandoParaBaixo(y > ultimoY && y > 80)
        ultimoY = y
      }
    }
    const aoRolar = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(avaliar)
    }
    window.addEventListener('scroll', aoRolar, { passive: true })
    avaliar()
    return () => {
      window.removeEventListener('scroll', aoRolar)
      cancelAnimationFrame(raf)
    }
  }, [mobile])

  if (!mobile) return false
  return precoFocado || (rolandoParaBaixo && !pertoDoFim)
}
