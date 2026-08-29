import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  /** Renderiza um `<h2>` e liga o `aria-labelledby`. Omitir quando o conteúdo já tem título próprio. */
  title?: string
  /** Rótulo acessível quando não há `title`. */
  ariaLabel?: string
  size?: 'md' | 'lg'
  children: ReactNode
}

const FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Dialog modal reutilizável: portal no `body`, overlay clique-fora, `Escape` fecha,
 * scroll-lock do body com cleanup, foco no container ao abrir e devolvido ao gatilho
 * ao fechar, `role="dialog"`/`aria-modal` e um focus-trap simples de Tab.
 */
export function Dialog({ open, onClose, title, ariaLabel, size = 'md', children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gatilhoRef = useRef<Element | null>(null)
  const onCloseRef = useRef(onClose)
  const tituloId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    gatilhoRef.current = document.activeElement
    const overflowAntes = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const container = containerRef.current
    const autofocus = container?.querySelector<HTMLElement>('[autofocus]')
    ;(autofocus ?? container)?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !container) return
      const focaveis = Array.from(container.querySelectorAll<HTMLElement>(FOCAVEIS))
      if (!focaveis.length) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      const ativo = document.activeElement
      if (e.shiftKey && (ativo === primeiro || ativo === container)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && ativo === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = overflowAntes
      if (gatilhoRef.current instanceof HTMLElement) gatilhoRef.current.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? tituloId : undefined}
        aria-label={title ? undefined : (ariaLabel ?? 'Diálogo')}
        tabIndex={-1}
        className={`w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto space-y-4 rounded-lg border bg-card p-6 shadow-lg outline-none`}
      >
        {title && (
          <div className="flex items-start justify-between">
            <h2 id={tituloId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
