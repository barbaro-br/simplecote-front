import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Calendar } from '@/shared/components/ui/calendar'
import { Clock, PaperPlaneRight } from '@phosphor-icons/react'
import { dataHoraBr } from '@/shared/format/formatters'

type Props = {
  pendente?: boolean
  /** quantos itens a cotação tem no momento (para o resumo/aviso) */
  totalItens?: number
  /** quantos fornecedores serão convidados ao abrir */
  totalFornecedores?: number
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

export function AbrirCotacaoDialog({
  pendente,
  totalItens,
  totalFornecedores,
  onAbrir,
  onCancelar,
}: Props) {
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

  const faltaAlgo = totalItens === 0 || totalFornecedores === 0

  return (
    <Dialog open onClose={onCancelar} title="Abrir cotação" className="max-w-md p-5 space-y-4">
      <p className="text-sm text-muted-foreground">
        Os representantes convidados são notificados na hora e respondem até o prazo abaixo.
      </p>

      {(totalItens != null || totalFornecedores != null) && (
        <p className="text-[13px] text-muted-foreground">
          {totalItens != null && (
            <>
              <strong className="text-foreground">
                {totalItens} {totalItens === 1 ? 'item' : 'itens'}
              </strong>
              {totalFornecedores != null && ' · '}
            </>
          )}
          {totalFornecedores != null && (
            <strong className="text-foreground">
              {totalFornecedores} {totalFornecedores === 1 ? 'fornecedor' : 'fornecedores'}
            </strong>
          )}
          {faltaAlgo && (
            <span className="ml-1 font-medium text-warning">
              {totalItens === 0
                ? '— adicione itens antes de abrir.'
                : '— convide ao menos um fornecedor antes de abrir.'}
            </span>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-4">
        <Calendar
          mode="single"
          selected={data}
          onSelect={setData}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          className="pointer-events-auto rounded-lg border p-2"
        />
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" aria-hidden />
          <select
            aria-label="Hora"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="rounded-md border bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            {horas.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <span className="text-muted-foreground">:</span>
          <select
            aria-label="Minuto"
            value={minuto}
            onChange={(e) => setMinuto(e.target.value)}
            className="rounded-md border bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            {minutos.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {prazoIso && (
        <p className="text-[13px] text-muted-foreground">
          Expira {dataHoraBr(prazoIso)} (horário de Brasília)
        </p>
      )}

      {erro && <p className="text-[13px] font-medium text-destructive">{erro}</p>}

      <div className="flex justify-end gap-2 border-t pt-3">
        <Button variant="ghost" onClick={onCancelar} disabled={pendente}>
          Cancelar
        </Button>
        <Button onClick={confirmar} disabled={pendente} className="gap-2">
          {pendente ? 'Abrindo…' : 'Abrir Cotação'}
          <PaperPlaneRight className="size-4" />
        </Button>
      </div>
    </Dialog>
  )
}
