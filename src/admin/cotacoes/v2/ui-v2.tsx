import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Tooltip } from '@/shared/components/ui/tooltip'

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined select-none align-middle ${className}`}>{name}</span>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-[#161d19] bg-surface-container-low border border-white/5 rounded-2xl shadow-md ${className}`}>{children}</div>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div className="flex flex-col">
        <h1 className="text-headline-lg font-headline-lg text-[#dde4dd] text-on-surface">{title}</h1>
        {subtitle && <p className="text-body-md text-[#bbcabf] text-on-surface-variant mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: { children: ReactNode; variant?: 'primary' | 'ghost' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
  const styles =
    variant === 'primary'
      ? 'bg-[#4edea3] text-[#003824] bg-primary text-on-primary hover:brightness-110 shadow-sm shadow-primary/20 active:scale-[0.98]'
      : 'bg-[#242c27] text-[#dde4dd] bg-surface-container-high text-on-surface hover:bg-[#2f3632] hover:text-white border border-white/5 active:scale-[0.98]'
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function IconButton({
  children,
  icon,
  danger,
  className = '',
  title,
  ...props
}: {
  children?: ReactNode
  icon?: string
  danger?: boolean
  className?: string
  title?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const dangerCls = danger
    ? 'text-[#ffb4ab] text-error hover:bg-[#ffb4ab]/10'
    : 'text-[#bbcabf] text-on-surface-variant hover:text-white hover:bg-white/5'

  const botao = (
    <button
      className={`p-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center ${dangerCls} ${className}`}
      {...props}
    >
      {icon ? <Icon name={icon} className="text-base" /> : children}
    </button>
  )

  if (title) {
    return (
      <Tooltip content={title} delay={80} side="top">
        {botao}
      </Tooltip>
    )
  }

  return botao
}

const STATUS_COLORS: Record<string, string> = {
  ABERTA: 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/30',
  RASCUNHO: 'bg-[#bbcabf]/10 text-[#bbcabf] border-[#bbcabf]/20',
  ENCERRADA: 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30',
  PEDIDOS_GERADOS: 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30',
  CANCELADA: 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30',
  GERADO: 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/30',
  ENVIADO: 'bg-[#adc6ff]/10 text-[#adc6ff] border-[#adc6ff]/30',
  CONFIRMADO: 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30',
  ATIVO: 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30',
  INATIVO: 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30',
  CONVITE_PENDENTE: 'bg-[#adc6ff]/10 text-[#adc6ff] border-[#adc6ff]/30',
  COTADO: 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30',
  NAO_COTADO: 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30',
  PENDENTE: 'bg-[#bbcabf]/10 text-[#bbcabf] border-[#bbcabf]/20',
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-on-surface-variant">—</span>
  const cls = STATUS_COLORS[status] ?? 'bg-surface-container-high text-on-surface-variant border-white/5'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${cls}`}>
      {status}
    </span>
  )
}

export function Table({
  children,
  className = '',
  containerClassName = '',
  tableClassName = '',
  tableStyle,
}: {
  children: ReactNode
  className?: string
  containerClassName?: string
  tableClassName?: string
  tableStyle?: React.CSSProperties
}) {
  return (
    <div className={`bg-[#161d19] bg-surface-container-low border border-white/15 rounded-none shadow-md overflow-hidden flex flex-col ${containerClassName}`}>
      <div className={`overflow-auto flex-1 min-h-0 ${className}`}>
        <table style={tableStyle} className={`w-full text-left border-collapse ${tableClassName}`}>{children}</table>
      </div>
    </div>
  )
}

export function Th({
  children,
  right,
  center,
  className = '',
  style,
  onResize,
  onDoubleClickResize,
}: {
  children: ReactNode
  right?: boolean
  center?: boolean
  className?: string
  style?: React.CSSProperties
  onResize?: (e: React.MouseEvent) => void
  onDoubleClickResize?: (e: React.MouseEvent) => void
}) {
  return (
    <th
      style={style}
      className={`sticky top-0 z-10 py-2.5 px-3.5 font-bold text-sm md:text-[15px] text-[#dde4dd] tracking-tight bg-[#1a231d] bg-surface-container border-b border-r border-white/15 last:border-r-0 shadow-xs relative select-none rounded-none group/th ${right ? 'text-right' : ''} ${center ? 'text-center' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-1 overflow-hidden pr-1">
        <span className="truncate font-bold text-sm md:text-[15px] text-[#dde4dd] font-headline-sm">{children}</span>
      </div>
      {onResize && (
        <div
          onMouseDown={onResize}
          onDoubleClick={onDoubleClickResize}
          className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize hover:bg-primary/80 active:bg-primary z-20 transition-colors flex items-center justify-center group/handle"
          title="Arrastar para redimensionar (duplo-clique para restaurar)"
        >
          <div className="w-[2px] h-4 bg-white/30 group-hover/handle:bg-primary transition-colors" />
        </div>
      )}
    </th>
  )
}

export function Td({
  children,
  right,
  center,
  muted,
  className = '',
  style,
}: {
  children: ReactNode
  right?: boolean
  center?: boolean
  muted?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <td
      style={style}
      className={`py-2 px-3.5 text-sm border-b border-r border-white/10 last:border-r-0 rounded-none ${right ? 'text-right' : ''} ${center ? 'text-center' : ''} ${muted ? 'text-on-surface-variant' : 'text-on-surface'} ${className}`}
    >
      {children}
    </td>
  )
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 gap-2 bg-surface-container-low/40 rounded-2xl border border-dashed border-outline-variant/50">
      <Icon name={icon} className="text-4xl text-on-surface-variant/70" />
      <p className="text-base font-medium text-on-surface">{title}</p>
      {description && <p className="text-sm text-on-surface-variant max-w-sm">{description}</p>}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-surface-container-high border-t-primary rounded-full animate-spin" />
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  hintClass = 'text-primary',
}: {
  label: string
  value: string | number
  hint?: string
  hintClass?: string
}) {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">{label}</span>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-on-surface">{value}</span>
        {hint && <span className={`text-xs font-medium ${hintClass}`}>{hint}</span>}
      </div>
    </Card>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Salvar',
  submitting,
  width = 'max-w-md',
  overlayClassName = 'bg-black/10',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  onSubmit?: (e: FormEvent) => void
  submitLabel?: string
  submitting?: boolean
  width?: string
  overlayClassName?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/15 bg-[#131b15] -mx-6 -mt-6 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono font-bold text-[#dde4dd] uppercase tracking-wider">{title}</h2>
          <span className="px-1.5 py-0.5 rounded-none text-[10px] font-mono font-semibold bg-primary/15 text-primary border border-primary/30">
            ITEM
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-on-surface-variant hover:text-on-surface rounded-none p-1 hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10"
          aria-label="Fechar"
        >
          <Icon name="close" className="text-base" />
        </button>
      </div>

      <div className="space-y-4 flex-1">{children}</div>

      {onSubmit && (
        <div className="flex justify-end items-center gap-2 mt-6 pt-3.5 border-t border-white/15 -mx-6 -mb-6 px-5 py-3.5 bg-[#131b15]/40">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-none border border-white/15 bg-transparent hover:bg-white/5 text-[#dde4dd] text-xs font-mono uppercase px-4 py-2"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase font-mono tracking-wider rounded-none px-6 py-2 shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all"
          >
            {submitting ? 'Salvando…' : submitLabel}
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className={`fixed inset-0 transition-opacity ${overlayClassName}`} onClick={onClose} />
      <div
        className={`relative z-10 w-full ${width} min-h-[380px] bg-[#0d1410] border border-white/20 rounded-none shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-6 overflow-visible text-[#dde4dd]`}
      >
        {onSubmit ? <form onSubmit={onSubmit} className="h-full">{content}</form> : content}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block space-y-1.5">
      <span className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{label}</span>
      {children}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return (
    <input
      className={`w-full bg-[#242c27] bg-surface-container-high text-[#dde4dd] text-on-surface placeholder:text-outline text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${className}`}
      {...rest}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props
  return (
    <select
      className={`w-full bg-[#242c27] bg-surface-container-high text-[#dde4dd] text-on-surface text-sm rounded-xl px-4 py-2.5 border border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}

export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione…',
  emptyMessage = 'Nenhum resultado encontrado.',
  itemPlural = 'itens',
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; sublabel?: string }[]
  placeholder?: string
  emptyMessage?: string
  itemPlural?: string
}) {
  const [termo, setTermo] = useState('')
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selecionado = options.find((o) => o.value === value)
  const LIMITE = 50

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  const filtrados = (
    termo.trim() ? options.filter((o) => o.label.toLowerCase().includes(termo.trim().toLowerCase())) : options
  ).slice(0, LIMITE)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="w-full bg-[#242c27] bg-surface-container-high text-[#dde4dd] text-on-surface text-sm rounded-xl px-4 py-2.5 text-left flex items-center justify-between gap-2 border border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
      >
        <span className={selecionado ? 'font-medium' : 'text-on-surface-variant'}>{selecionado ? selecionado.label : placeholder}</span>
        <Icon name="expand_more" className={`text-lg text-on-surface-variant transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>
      {aberto && (
        <div className="absolute left-0 right-0 z-[120] mt-1.5 w-full rounded-none bg-[#0d1410] border border-white/20 shadow-2xl overflow-hidden font-mono text-xs">
          <div className="p-2 border-b border-white/10 bg-[#131b15]">
            <input
              autoFocus
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Digite para buscar…"
              className="w-full bg-[#16201a] text-[#dde4dd] text-xs font-mono rounded-none px-3 py-2 border border-white/15 focus:outline-none focus:border-primary"
            />
          </div>
          <div className="max-h-56 overflow-y-auto divide-y divide-white/5">
            {filtrados.length === 0 ? (
              <div className="px-4 py-3 text-on-surface-variant text-sm text-center">{emptyMessage}</div>
            ) : (
              filtrados.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => {
                    onChange(o.value)
                    setTermo('')
                    setAberto(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-[#2f3632] hover:bg-surface-container-highest flex items-center justify-between gap-3 text-sm transition-colors cursor-pointer ${
                    o.value === value ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {o.sublabel && <span className="text-xs font-mono text-on-surface-variant shrink-0">{o.sublabel}</span>}
                </button>
              ))
            )}
            {options.length > LIMITE && filtrados.length === LIMITE && (
              <div className="px-4 py-2 text-on-surface-variant text-xs border-t border-white/10 bg-[#1a211d] text-center">
                Mostrando {LIMITE} de {options.length} {itemPlural} — digite para refinar.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return (
    <textarea
      className={`w-full bg-[#242c27] bg-surface-container-high text-[#dde4dd] text-on-surface placeholder:text-outline text-sm rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${className}`}
      {...rest}
    />
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
          checked ? 'bg-primary' : 'bg-surface-container-highest'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-surface shadow transition-transform ${
            checked ? 'translate-x-4 bg-on-primary' : 'translate-x-0 bg-on-surface-variant'
          }`}
        />
      </div>
      {label && <span className="text-sm font-medium text-on-surface">{label}</span>}
    </label>
  )
}

export function formatarMoeda(valor?: number | null): string {
  if (valor === undefined || valor === null) return 'R$ 0,00'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarData(dataIso?: string | null): string {
  if (!dataIso) return '—'
  const d = new Date(dataIso)
  if (isNaN(d.getTime())) return dataIso
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
