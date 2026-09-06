import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Calendar } from '@/shared/components/ui/calendar'
import { Rocket, Clock, CalendarDays, SendHorizonal, Calendar as CalendarIcon, ArrowLeft, Check, Timer, Hourglass } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { dataHoraBr } from '@/shared/format/formatters'

type Props = {
  pendente?: boolean
  onAbrir: (prazoIso: string) => void
  onCancelar: () => void
}

type TipoPrazo = 'mais_24h' | 'mais_48h' | 'hoje_18' | 'amanha_18' | 'sexta_12' | 'custom'
type ViewMode = 'presets' | 'calendar'

// O prazo é montado no fuso America/Sao_Paulo, não no do navegador (admin e
// servidor podem estar em fusos diferentes). Sem dependência nova (AGENTS.md):
// usa `Intl.DateTimeFormat` para descobrir o offset de São Paulo na data alvo
// e monta o ISO-8601 UTC a partir dele.

const DIAS_SEMANA: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

function componentesSaoPaulo(instante: Date): { ano: number; mes: number; dia: number; hora: number; minuto: number; diaSemana: number } {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short',
    hour12: false,
  })
  const valores: Record<string, number> = {}
  let diaSemana = 0
  for (const p of dtf.formatToParts(instante)) {
    if (p.type === 'weekday') {
      diaSemana = DIAS_SEMANA[p.value] ?? 0
    } else if (p.type !== 'literal') {
      valores[p.type] = Number(p.value)
    }
  }
  return { ano: valores.year, mes: valores.month, dia: valores.day, hora: valores.hour % 24, minuto: valores.minute, diaSemana }
}

// Offset (em ms) de America/Sao_Paulo no instante dado: o quanto SP está à
// frente do UTC — negativo no Brasil (UTC-3).
function offsetSaoPauloMs(instante: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
  const valores: Record<string, number> = {}
  for (const p of dtf.formatToParts(instante)) {
    if (p.type !== 'literal') valores[p.type] = Number(p.value)
  }
  const comoUtc = Date.UTC(valores.year, valores.month - 1, valores.day, valores.hour % 24, valores.minute, valores.second)
  return comoUtc - instante.getTime()
}

// Instante UTC correspondente a uma data/hora de parede em São Paulo.
function montarIsoSaoPaulo(ano: number, mes: number, dia: number, hora: number, minuto: number): string {
  const comoUtc = Date.UTC(ano, mes - 1, dia, hora, minuto, 0)
  const offset = offsetSaoPauloMs(new Date(comoUtc))
  return new Date(comoUtc - offset).toISOString()
}

function calcularPrazoIso(tipo: TipoPrazo, customDate: Date | undefined, hour: string, minute: string): string | null {
  if (tipo === 'custom') {
    if (!customDate) return null
    return montarIsoSaoPaulo(
      customDate.getFullYear(),
      customDate.getMonth() + 1,
      customDate.getDate(),
      parseInt(hour, 10),
      parseInt(minute, 10),
    )
  }

  const agora = new Date()

  if (tipo === 'mais_24h') {
    return new Date(agora.getTime() + 24 * 60 * 60 * 1000).toISOString()
  }
  if (tipo === 'mais_48h') {
    return new Date(agora.getTime() + 48 * 60 * 60 * 1000).toISOString()
  }

  const sp = componentesSaoPaulo(agora)

  if (tipo === 'hoje_18') {
    return montarIsoSaoPaulo(sp.ano, sp.mes, sp.dia, 18, 0)
  }
  if (tipo === 'amanha_18') {
    const amanha = new Date(Date.UTC(sp.ano, sp.mes - 1, sp.dia + 1))
    return montarIsoSaoPaulo(amanha.getUTCFullYear(), amanha.getUTCMonth() + 1, amanha.getUTCDate(), 18, 0)
  }
  if (tipo === 'sexta_12') {
    const diasAteSexta = (5 - sp.diaSemana + 7) % 7
    const sexta = new Date(Date.UTC(sp.ano, sp.mes - 1, sp.dia + diasAteSexta))
    return montarIsoSaoPaulo(sexta.getUTCFullYear(), sexta.getUTCMonth() + 1, sexta.getUTCDate(), 12, 0)
  }

  return null
}

function presetExpirado(tipo: TipoPrazo): boolean {
  const iso = calcularPrazoIso(tipo, undefined, '18', '00')
  if (!iso) return false
  return new Date(iso).getTime() < Date.now()
}

function primeiroPresetValido(): TipoPrazo {
  const ordem: TipoPrazo[] = ['mais_24h', 'mais_48h', 'hoje_18', 'amanha_18', 'sexta_12']
  return ordem.find((t) => !presetExpirado(t)) ?? 'mais_24h'
}

export function AbrirCotacaoDialog({ pendente, onAbrir, onCancelar }: Props) {
  const [view, setView] = useState<ViewMode>('presets')
  
  const [tipoPrazo, setTipoPrazo] = useState<TipoPrazo>(primeiroPresetValido)
  
  const [customDate, setCustomDate] = useState<Date | undefined>(new Date())
  const [customHour, setCustomHour] = useState('18')
  const [customMinute, setCustomMinute] = useState('00')
  const [hasCustomSaved, setHasCustomSaved] = useState(false)
  
  const [erro, setErro] = useState<string | null>(null)

  function confirmarFinal() {
    const prazo = calcularPrazoIso(tipoPrazo, customDate, customHour, customMinute)
    if (!prazo) {
      setErro('Informe uma data válida.')
      return
    }
    
    if (new Date(prazo).getTime() < Date.now()) {
      setErro('O prazo precisa ser no futuro.')
      return
    }

    setErro(null)
    onAbrir(prazo)
  }

  function formatarCustomLabel() {
    if (!hasCustomSaved || !customDate) return 'Personalizado'
    const dia = String(customDate.getDate()).padStart(2, '0')
    const mes = String(customDate.getMonth() + 1).padStart(2, '0')
    return `${dia}/${mes} às ${customHour}:${customMinute}`
  }

  // "Sexta às 12h" só faz sentido de segunda a quinta (sexta/fim de semana o
  // próximo "sexta 12h" já está no passado ou é ambíguo).
  const diaSemana = componentesSaoPaulo(new Date()).diaSemana
  const mostrarSexta = diaSemana >= 1 && diaSemana <= 4

  const presetsBase: { id: TipoPrazo; label: string; icon: any }[] = [
    { id: 'mais_24h', label: '+24h', icon: Timer },
    { id: 'mais_48h', label: '+48h', icon: Hourglass },
    { id: 'hoje_18', label: 'Hoje às 18h', icon: Clock },
    { id: 'amanha_18', label: 'Amanhã às 18h', icon: CalendarDays },
  ]
  if (mostrarSexta) {
    presetsBase.push({ id: 'sexta_12', label: 'Sexta às 12h', icon: CalendarDays })
  }
  const presets: { id: TipoPrazo; label: string; icon: any }[] = [
    ...presetsBase,
    { id: 'custom', label: formatarCustomLabel(), icon: CalendarIcon },
  ]

  const prazoAtual = calcularPrazoIso(tipoPrazo, customDate, customHour, customMinute)

  const horas = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, '0'))
  const minutos = Array.from({ length: 60 }).map((_, i) => i.toString().padStart(2, '0'))

  return (
    <Dialog 
      open 
      onClose={onCancelar} 
      className="p-0 overflow-hidden bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl relative max-w-[420px]"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col relative z-10 transition-all duration-300">
        
        {view === 'presets' ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300 min-h-[420px] flex flex-col justify-center">
            <div className="px-6 py-6 pb-4 shrink-0 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 ring-1 ring-primary/20 shadow-inner">
                <Rocket className="size-7" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Lançar Cotação</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Os representantes convidados serão notificados imediatamente e poderão responder até o prazo que você definir.
              </p>
            </div>

            <div className="px-6 pb-2">
              <div className="grid grid-cols-2 gap-2.5">
                {presets.map(p => {
                  const Icon = p.icon
                  const isSelected = tipoPrazo === p.id
                  const vencido = p.id !== 'custom' && presetExpirado(p.id)
                  return (
                    <button
                      key={p.id}
                      disabled={vencido}
                      onClick={() => {
                        if (p.id === 'custom') {
                          setView('calendar')
                        } else {
                          setTipoPrazo(p.id)
                          setErro(null)
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-[13px] transition-all gap-1.5",
                        vencido
                          ? "bg-muted/20 border-transparent text-muted-foreground/50 cursor-not-allowed opacity-60"
                          : isSelected 
                            ? "bg-primary/10 border-primary/30 text-primary shadow-sm ring-1 ring-primary/20" 
                            : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="font-medium">{p.label}</span>
                    </button>
                  )
                })}
              </div>
              {erro && (
                <p className="text-[13px] text-destructive text-center mt-3 font-medium animate-in fade-in">
                  {erro}
                </p>
              )}
            </div>

            {prazoAtual && (
              <p className="px-6 pb-3 text-center text-[13px] text-muted-foreground">
                Expira {dataHoraBr(prazoAtual)} (horário de Brasília)
              </p>
            )}

            <div className="mt-4 p-4 px-6 border-t border-border/50 bg-background/50 backdrop-blur-md shrink-0 flex justify-end gap-3 rounded-b-xl z-20">
              <Button variant="ghost" onClick={onCancelar} disabled={pendente} className="rounded-full text-[13px] font-medium text-muted-foreground hover:text-foreground">
                Cancelar
              </Button>
              <Button onClick={confirmarFinal} disabled={pendente} className="rounded-full text-[13px] font-medium shadow-sm hover:shadow transition-all gap-2 px-6">
                {pendente ? 'Lançando...' : 'Abrir Cotação'}
                <SendHorizonal className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 min-h-[420px] flex flex-col">
            <div className="px-6 py-4 pb-2 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Data Personalizada</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full" onClick={() => setView('presets')}>
                <ArrowLeft className="size-4" />
              </Button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background/40">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={setCustomDate}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                className="pointer-events-auto bg-background rounded-xl border border-border/50 shadow-sm p-3 mb-6"
              />
              
              <div className="flex items-center gap-3 w-full justify-center bg-background rounded-xl border border-border/50 p-3 shadow-sm">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-[13px] font-medium text-foreground mr-1">Horário:</span>
                <select 
                  value={customHour} 
                  onChange={e => setCustomHour(e.target.value)}
                  className="bg-muted text-foreground border border-transparent hover:border-border rounded-lg text-sm px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                >
                  {horas.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="font-bold text-muted-foreground">:</span>
                <select 
                  value={customMinute} 
                  onChange={e => setCustomMinute(e.target.value)}
                  className="bg-muted text-foreground border border-transparent hover:border-border rounded-lg text-sm px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                >
                  {minutos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            
            <div className="p-4 px-6 border-t border-border/50 bg-background/50 backdrop-blur-md shrink-0 flex justify-between items-center rounded-b-xl z-20">
              <Button variant="ghost" onClick={() => setView('presets')} className="rounded-full text-[13px] font-medium text-muted-foreground hover:text-foreground">
                Voltar
              </Button>
              <Button 
                onClick={() => {
                  setTipoPrazo('custom')
                  setHasCustomSaved(true)
                  setView('presets')
                  setErro(null)
                }} 
                className="rounded-full text-[13px] font-medium shadow-sm hover:shadow transition-all gap-2 px-6"
              >
                <Check className="size-4" />
                Salvar Data
              </Button>
            </div>
          </div>
        )}

      </div>
    </Dialog>
  )
}
