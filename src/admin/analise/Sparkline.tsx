export function Sparkline({ pontos, className }: { pontos: number[]; className?: string }) {
  const w = 60
  const h = 20

  if (!pontos || pontos.length <= 1) {
    return <svg width={w} height={h} className={className} data-testid="sparkline-empty" />
  }

  const max = Math.max(...pontos)
  const min = Math.min(...pontos)
  const range = max - min || 1 // Avoid division by zero if all points are the same

  const stepX = w / (pontos.length - 1)
  const lines = pontos
    .map((p, i) => {
      const x = i * stepX
      const y = h - ((p - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} className={className} data-testid="sparkline">
      <polyline
        points={lines}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        data-testid="sparkline-polyline"
      />
    </svg>
  )
}
