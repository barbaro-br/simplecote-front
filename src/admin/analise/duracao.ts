export function duracaoAprox(segundos: number): string {
  if (segundos < 60) return '< 1 min'
  const horas = segundos / 3600
  if (horas >= 24) return `~${Math.round(horas / 24)} dia${Math.round(horas / 24) > 1 ? 's' : ''}`
  if (horas >= 1) return `~${Math.round(horas)} h`
  const min = Math.round(segundos / 60)
  return `~${min} min`
}
