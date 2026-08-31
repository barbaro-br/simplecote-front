import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  /** Renderiza um `<h2>` e liga o `aria-labelledby`. Omitir quando o conteúdo já tem título próprio. */
  title?: string
  /** Rótulo acessível quando não há `title`. */
  ariaLabel?: string
  size?: 'md' | 'lg' | 'xl'
  className?: string
  children: ReactNode
}

const FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Pilha de dialogs abertos: com modais aninhados, só o do topo responde a `Escape`.
const pilhaAberta: symbol[] = []

/**
 * Dialog modal reutilizável: portal no `body`, overlay clique-fora, `Escape` fecha,
 * scroll-lock do body com cleanup, foco no container ao abrir e devolvido ao gatilho
 * ao fechar, `role="dialog"`/`aria-modal` e um focus-trap simples de Tab.
 */
export function Dialog({ open, onClose, title, ariaLabel, size = 'md', className, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gatilhoRef = useRef<Element | null>(null)
  const onCloseRef = useRef(onClose)
  const tituloId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    const id = Symbol('dialog')
    pilhaAberta.push(id)
    gatilhoRef.current = document.activeElement
    const overflowAntes = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const container = containerRef.current
    const autofocus = container?.querySelector<HTMLElement>('[autofocus]')
    ;(autofocus ?? container)?.focus()

    function noTopo() {
      return pilhaAberta[pilhaAberta.length - 1] === id
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!noTopo()) return
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
      const i = pilhaAberta.indexOf(id)
      if (i !== -1) pilhaAberta.splice(i, 1)
      document.body.style.overflow = overflowAntes
      if (gatilhoRef.current instanceof HTMLElement) gatilhoRef.current.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
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
        className={`w-full ${size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] flex flex-col rounded-xl border bg-card/95 shadow-2xl backdrop-blur-md outline-none animate-in zoom-in-95 duration-200 ${className || 'p-6 space-y-4'}`}
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
