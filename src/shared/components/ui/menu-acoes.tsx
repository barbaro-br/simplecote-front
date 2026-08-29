import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { Button } from './button'

type MenuItem = {
  label: string
  onSelect: () => void
  disabled?: boolean
}

type MenuAcoesProps = {
  items: MenuItem[]
}

export function MenuAcoes({ items }: MenuAcoesProps) {
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function aoClicarFora(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    function aoApertarTecla(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false)
    }
    if (aberto) {
      document.addEventListener('pointerdown', aoClicarFora)
      document.addEventListener('keydown', aoApertarTecla)
    }
    return () => {
      document.removeEventListener('pointerdown', aoClicarFora)
      document.removeEventListener('keydown', aoApertarTecla)
    }
  }, [aberto])

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setAberto(!aberto)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        title="Mais opções"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-48 origin-top-right rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in zoom-in-95"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                role="menuitem"
                disabled={item.disabled}
                className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      )}
    </div>
  )
}
