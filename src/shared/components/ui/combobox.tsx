import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { CaretDown, PlusCircle } from '@phosphor-icons/react'
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
          'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        )}
        aria-haspopup="listbox"
        aria-expanded={aberto}
      >
        <span className={cn('truncate', !selecionada && 'text-muted-foreground')}>
          {selecionada ? selecionada.label : placeholder}
        </span>
        <CaretDown className="size-4 shrink-0 opacity-50" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} className="z-50">
          <Popover.Popup
            initialFocus={buscaRef}
            className="w-[var(--anchor-width)] rounded-md border bg-popover text-popover-foreground shadow-md outline-none"
          >
            <div className="p-2">
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
                className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <ul role="listbox" className="max-h-60 overflow-auto p-1">
              {podeCriar && (
                <li
                  role="option"
                  aria-selected={indice === 0}
                  onClick={criar}
                  onMouseEnter={() => setIndice(0)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary',
                    indice === 0 ? 'bg-accent' : 'hover:bg-accent',
                  )}
                >
                  <PlusCircle className="size-4 shrink-0" />
                  {rotuloCriar(textoFiltro)}
                </li>
              )}
              {filtradas.length === 0 && !podeCriar ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</li>
              ) : (
                filtradas.map((o, i) => {
                  const idx = podeCriar ? i + 1 : i
                  return (
                    <li
                      key={o.value}
                      role="option"
                      aria-selected={o.value === value}
                      onClick={() => selecionar(o)}
                      onMouseEnter={() => setIndice(idx)}
                      className={cn(
                        'cursor-pointer rounded-md px-3 py-2 text-sm',
                        idx === indice ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
                      )}
                    >
                      {o.label}
                    </li>
                  )
                })
              )}
            </ul>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
