export function moeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function dataHoraBr(dataIsoZ: string): string {
  const data = new Date(dataIsoZ)
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data)
}

export function dataBr(dataIsoZ: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
  }).format(new Date(dataIsoZ))
}

/** Chave 'YYYY-MM' do mês/ano de uma data, no fuso America/Sao_Paulo — usada para agrupar/filtrar por mês. */
export function chaveMes(dataIsoZ: string): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date(dataIsoZ))
  const ano = partes.find((p) => p.type === 'year')!.value
  const mes = partes.find((p) => p.type === 'month')!.value
  return `${ano}-${mes}`
}

/** Rótulo legível de uma chave 'YYYY-MM', ex.: "Setembro de 2026". */
export function mesAnoBr(chaveMes: string): string {
  const [ano, mes] = chaveMes.split('-').map(Number)
  const rotulo = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(ano, mes - 1, 1)))
  return rotulo.charAt(0).toUpperCase() + rotulo.slice(1)
}
