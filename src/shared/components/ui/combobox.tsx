import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { CaretDown, Check, MagnifyingGlass, PlusCircle } from '@phosphor-icons/react'
import { Popover } from '@base-ui/react'
import { cn } from '@/shared/lib/utils'

export type ComboboxOption = { value: string; label: string }

export type ComboboxProps = {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  id?: string
  disabled?: boolean
  className?: string
  popupClassName?: string
  /**
   * Opcional: quando o texto digitado não bate com nenhuma opção existente,
   * mostra um item "+ Criar…" no topo da lista que chama isto em vez de
   * `onChange`. Quem chama decide o que fazer (ex.: disparar uma mutação e só
   * então chamar `onChange` com o id criado) — o combobox não sabe criar nada
   * sozinho, só oferece o gatilho.
   */
  onCriarNova?: (texto: string) => void
  /** Rótulo do item de criação; padrão: `Criar "<texto>"`. */
  rotuloCriar?: (texto: string) => string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Selecione…',
  emptyMessage = 'Nenhum resultado encontrado',
  id,
  disabled = false,
  className,
  popupClassName,
  onCriarNova,
  rotuloCriar = (texto) => `Criar "${texto}"`,
}: ComboboxProps) {
  const [aberto, setAberto] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [indice, setIndice] = useState(0)
  const buscaRef = useRef<HTMLInputElement>(null)

  const selecionada = options.find((o) => o.value === value)

  const filtradas = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(filtro.toLowerCase())),
    [options, filtro],
  )

  const textoFiltro = filtro.trim()
  const podeCriar =
    Boolean(onCriarNova) &&
    textoFiltro.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === textoFiltro.toLowerCase())

  // Item de criação sempre no topo (índice 0) quando aplicável — desloca os
  // índices das opções filtradas em 1 pra navegação por teclado ficar simples.
  const totalNavegavel = filtradas.length + (podeCriar ? 1 : 0)

  function selecionar(option: ComboboxOption) {
    onChange(option.value)
    setAberto(false)
  }

  function criar() {
    if (!onCriarNova || !podeCriar) return
    onCriarNova(textoFiltro)
    setAberto(false)
  }

  function selecionarNoIndice(i: number) {
    if (podeCriar && i === 0) {
      criar()
    } else {
      const alvo = filtradas[podeCriar ? i - 1 : i]
      if (alvo) selecionar(alvo)
    }
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndice((i) => Math.min(i + 1, totalNavegavel - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndice((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (totalNavegavel === 0) return
      e.preventDefault()
      selecionarNoIndice(indice)
    } else if (e.key === 'Escape') {
      setAberto(false)
    }
  }

  return (
    <Popover.Root
      open={aberto && !disabled}
      onOpenChange={(open) => {
        if (disabled) return
        if (open) {
          setFiltro('')
          setIndice(0)
        }
        setAberto(open)
      }}
    >
      <Popover.Trigger
        id={id}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-none border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        aria-haspopup="listbox"
        aria-expanded={aberto}
      >
        <span className={cn('truncate text-left', !selecionada && 'text-muted-foreground')}>
          {selecionada ? selecionada.label : placeholder}
        </span>
        <CaretDown className="size-4 shrink-0 opacity-70" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} className="z-50">
          <Popover.Popup
            initialFocus={buscaRef}
            className={cn(
              'w-[var(--anchor-width)] min-w-[240px] rounded-none border border-border bg-popover text-popover-foreground shadow-2xl outline-none overflow-hidden',
              popupClassName,
            )}
          >
            <div className="border-b border-border/40 p-2 bg-muted/10">
              <div className="relative flex items-center">
                <MagnifyingGlass className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                <input
                  id={id ? `${id}-input` : undefined}
                  name={id ? `${id}-input` : 'combobox-input'}
                  ref={buscaRef}
                  type="text"
                  value={filtro}
                  placeholder="Buscar…"
                  aria-label="Buscar"
                  onChange={(e) => {
                    setFiltro(e.target.value)
                    setIndice(0)
                  }}
                  onKeyDown={aoTeclar}
                  className="h-8 w-full rounded-none border border-input bg-background/50 pl-8 pr-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>
            <ul role="listbox" className="max-h-60 overflow-y-auto overscroll-contain p-1 divide-y divide-border/20">
              {podeCriar && (
                <li
                  role="option"
                  aria-selected={indice === 0}
                  onClick={criar}
                  onMouseEnter={() => setIndice(0)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-none px-3 py-2 text-xs font-medium text-primary transition-colors',
                    indice === 0 ? 'bg-primary/15' : 'hover:bg-primary/10',
                  )}
                >
                  <PlusCircle className="size-4 shrink-0" />
                  {rotuloCriar(textoFiltro)}
                </li>
              )}
              {filtradas.length === 0 && !podeCriar ? (
                <li className="px-3 py-4 text-center text-xs text-muted-foreground">{emptyMessage}</li>
              ) : (
                filtradas.map((o, i) => {
                  const idx = podeCriar ? i + 1 : i
                  const isSelecionado = o.value === value
                  const isHighlighted = idx === indice
                  return (
                    <li
                      key={o.value}
                      role="option"
                      aria-selected={isSelecionado}
                      onClick={() => selecionar(o)}
                      onMouseEnter={() => setIndice(idx)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-2 rounded-none px-3 py-2 text-xs transition-colors',
                        isSelecionado
                          ? 'bg-primary/15 text-primary font-semibold'
                          : isHighlighted
                            ? 'bg-muted/80 text-foreground font-medium'
                            : 'text-foreground/90 hover:bg-muted/40 hover:text-foreground',
                      )}
                    >
                      <span className="truncate">{o.label}</span>
                      {isSelecionado && <Check className="size-3.5 shrink-0 text-primary" weight="bold" />}
                    </li>
                  )
                })
              )}
            </ul>
            {options.length > 0 && (
              <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-3 py-1.5 text-[10px] font-mono text-muted-foreground select-none">
                <span>{filtradas.length} {filtradas.length === 1 ? 'opção' : 'opções'}</span>
                {filtradas.length > 6 && <span>Role para ver mais</span>}
              </div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
