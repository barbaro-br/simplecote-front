import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface HoverCardProps {
  trigger: ReactNode
  children: ReactNode
}

/**
 * Trigger + painel flutuante via portal (`document.body`, `position: fixed`) — não
 * clipa dentro de container com `overflow` (grade ao vivo, Card com tabela). Abre em
 * `mouseenter`/`focus`, fecha em `mouseleave`/`blur`/`Esc`/scroll. `role="tooltip"`.
 */
export function HoverCard({ trigger, children }: HoverCardProps) {
  const [aberto, setAberto] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const abrirTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const fecharTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const posicionar = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect()
    if (r) setCoords({ top: r.bottom + 4, left: r.left })
  }, [])

  // mouseenter: pequeno atraso pra não piscar ao passar o mouse de raspão.
  const abrirComDelay = useCallback(() => {
    clearTimeout(fecharTimer.current)
    abrirTimer.current = setTimeout(() => {
      posicionar()
      setAberto(true)
    }, 150)
  }, [posicionar])

  // focus (teclado): abre na hora.
  const abrirJa = useCallback(() => {
    clearTimeout(fecharTimer.current)
    clearTimeout(abrirTimer.current)
    posicionar()
    setAberto(true)
  }, [posicionar])

  const fechar = useCallback(() => {
    clearTimeout(abrirTimer.current)
    fecharTimer.current = setTimeout(() => setAberto(false), 100)
  }, [])

  useEffect(() => {
    if (!aberto) return
    function aoTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    function aoRolar() {
      setAberto(false)
    }
    document.addEventListener('keydown', aoTecla)
    window.addEventListener('scroll', aoRolar, true)
    return () => {
      document.removeEventListener('keydown', aoTecla)
      window.removeEventListener('scroll', aoRolar, true)
    }
  }, [aberto])

  useEffect(
    () => () => {
      clearTimeout(abrirTimer.current)
      clearTimeout(fecharTimer.current)
    },
    [],
  )

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex min-w-0 items-center gap-1.5"
        onMouseEnter={abrirComDelay}
        onMouseLeave={fechar}
        onFocus={abrirJa}
        onBlur={fechar}
      >
        {trigger}
      </span>
      {aberto &&
        coords &&
        createPortal(
          <div
            role="tooltip"
            style={{ position: 'fixed', top: coords.top, left: coords.left }}
            className="z-50 animate-in fade-in zoom-in-95"
            onMouseEnter={() => clearTimeout(fecharTimer.current)}
            onMouseLeave={fechar}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  )
}
