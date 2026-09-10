import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Calendar } from '@/shared/components/ui/calendar'
import { Rocket, Clock, PaperPlaneRight } from '@phosphor-icons/react'
import { dataHoraBr } from '@/shared/format/formatters'

type Props = {
  pendente?: boolean
  onAbrir: (prazoIso: string) => void
  onCancelar: () => void
}

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

function calcularPrazoIso(data: Date | undefined, hora: string, minuto: string): string | null {
  if (!data) return null
  return montarIsoSaoPaulo(
    data.getFullYear(),
    data.getMonth() + 1,
    data.getDate(),
    parseInt(hora, 10),
    parseInt(minuto, 10),
  )
}

// "Amanhã" no fuso de São Paulo, como um Date de meia-noite local (para o
// Calendar destacar o dia certo). `dia + 1` rola o mês automaticamente.
function dataAmanha(): Date {
  const sp = componentesSaoPaulo(new Date())
  return new Date(sp.ano, sp.mes - 1, sp.dia + 1)
}

// Hoisted pro módulo para o `react(purity)` do oxlint não reclamar do
// `Date.now()` no corpo do componente. Semântica idêntica ao original.
function estaNoPassado(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
}

export function AbrirCotacaoDialog({ pendente, onAbrir, onCancelar }: Props) {
  const [data, setData] = useState<Date | undefined>(() => dataAmanha())
  const [hora, setHora] = useState('18')
  const [minuto, setMinuto] = useState('00')
  const [erro, setErro] = useState<string | null>(null)

  const prazoIso = calcularPrazoIso(data, hora, minuto)

  function confirmar() {
    if (!prazoIso) {
      setErro('Informe uma data válida.')
      return
    }

    if (estaNoPassado(prazoIso)) {
      setErro('O prazo precisa ser no futuro.')
      return
    }

    setErro(null)
    onAbrir(prazoIso)
  }

  const horas = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, '0'))
  const minutos = Array.from({ length: 60 }).map((_, i) => i.toString().padStart(2, '0'))

  return (
    <Dialog
      open
      onClose={onCancelar}
      className="p-0 overflow-hidden bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl relative max-w-[420px]"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col relative z-10 min-h-0 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-6 pb-4 shrink-0 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 ring-1 ring-primary/20 shadow-inner">
            <Rocket className="size-7" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground ui-uppercase">Lançar Cotação</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Os representantes convidados serão notificados imediatamente e poderão responder até o prazo que você definir.
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center p-6 bg-background/40">
          <Calendar
            mode="single"
            selected={data}
            onSelect={setData}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="pointer-events-auto bg-background rounded-xl border border-border/50 shadow-sm p-3 mb-6"
          />

          <div className="flex items-center gap-3 w-full justify-center bg-background rounded-xl border border-border/50 p-3 shadow-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-[13px] font-medium text-foreground mr-1">Horário:</span>
            <select
              aria-label="Hora"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="bg-muted text-foreground border border-transparent hover:border-border rounded-lg text-sm px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
            >
              {horas.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="font-bold text-muted-foreground">:</span>
            <select
              aria-label="Minuto"
              value={minuto}
              onChange={(e) => setMinuto(e.target.value)}
              className="bg-muted text-foreground border border-transparent hover:border-border rounded-lg text-sm px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
            >
              {minutos.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {prazoIso && (
          <p className="shrink-0 px-6 pb-3 pt-3 text-center text-[13px] text-muted-foreground">
            Expira {dataHoraBr(prazoIso)} (horário de Brasília)
          </p>
        )}

        {erro && (
          <p className="shrink-0 px-6 pb-3 text-center text-[13px] text-destructive font-medium">
            {erro}
          </p>
        )}

        <div className="p-4 px-6 border-t border-border/50 bg-background/50 backdrop-blur-md shrink-0 flex justify-end gap-3 rounded-b-xl z-20">
          <Button variant="ghost" onClick={onCancelar} disabled={pendente} className="rounded-full text-[13px] font-medium text-muted-foreground hover:text-foreground">
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={pendente} className="rounded-full text-[13px] font-medium shadow-sm hover:shadow transition-all gap-2 px-6">
            {pendente ? 'Lançando...' : 'Abrir Cotação'}
            <PaperPlaneRight className="size-4" />
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
