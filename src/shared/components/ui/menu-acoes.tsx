import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'
import { Button } from './button'

type MenuItem = {
  label: string
  onSelect: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive'
}

type MenuAcoesProps = {
  items: MenuItem[]
}

export function MenuAcoes({ items }: MenuAcoesProps) {
  const [aberto, setAberto] = useState(false)
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; right: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const posicionar = useCallback(() => {
    const r = buttonRef.current?.getBoundingClientRect()
    if (r) {
      const nearBottom = r.bottom + 120 > window.innerHeight
      if (nearBottom) {
        setCoords({ bottom: window.innerHeight - r.top + 4, right: window.innerWidth - r.right })
      } else {
        setCoords({ top: r.bottom + 4, right: window.innerWidth - r.right })
      }
    }
  }, [])

  const abrir = () => {
    posicionar()
    setAberto(true)
  }

  const toggle = () => {
    if (aberto) {
      setAberto(false)
    } else {
      abrir()
    }
  }

  useEffect(() => {
    if (!aberto) return
    
    // Atualiza a posição ao rolar ou redimensionar
    const atualizarPosicao = () => posicionar()
    window.addEventListener('scroll', atualizarPosicao, true)
    window.addEventListener('resize', atualizarPosicao)

    function aoClicarFora(e: PointerEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setAberto(false)
      }
    }
    function aoApertarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }

    document.addEventListener('pointerdown', aoClicarFora)
    document.addEventListener('keydown', aoApertarTecla)
    
    return () => {
      window.removeEventListener('scroll', atualizarPosicao, true)
      window.removeEventListener('resize', atualizarPosicao)
      document.removeEventListener('pointerdown', aoClicarFora)
      document.removeEventListener('keydown', aoApertarTecla)
    }
  }, [aberto, posicionar])

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={aberto}
        title="Mais opções"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {aberto &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: coords.top, bottom: coords.bottom, right: coords.right }}
            className={`z-50 w-48 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in zoom-in-95 ${coords.bottom ? 'mb-1 origin-bottom-right' : 'mt-1 origin-top-right'}`}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  role="menuitem"
                  disabled={item.disabled}
                  className={`flex w-full items-center px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    item.variant === 'destructive'
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => {
                    if (item.disabled) return
                    item.onSelect()
                    setAberto(false)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
