// O prazo da cotação é montado no fuso America/Sao_Paulo, não no do navegador
// (admin e servidor podem estar em fusos diferentes). Sem dependência nova
// (AGENTS.md): usa `Intl.DateTimeFormat` pra descobrir o offset de São Paulo na
// data alvo e monta o ISO-8601 UTC a partir dele. Compartilhado por
// AbrirCotacaoDialog e EstenderPrazoDialog.

const DIAS_SEMANA: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

export function componentesSaoPaulo(instante: Date): {
  ano: number; mes: number; dia: number; hora: number; minuto: number; diaSemana: number
} {
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

export function calcularPrazoIso(data: Date | undefined, hora: string, minuto: string): string | null {
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
export function dataAmanha(): Date {
  const sp = componentesSaoPaulo(new Date())
  return new Date(sp.ano, sp.mes - 1, sp.dia + 1)
}

export function estaNoPassado(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
}

export const HORAS = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, '0'))
export const MINUTOS = Array.from({ length: 60 }).map((_, i) => i.toString().padStart(2, '0'))
