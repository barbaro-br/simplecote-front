type BrandLogoProps = {
  /** `full` = símbolo + wordmark (padrão); `mark` = só o símbolo. */
  variant?: 'full' | 'mark'
  /** Classe no wrapper. O tamanho do símbolo vem de `size`. */
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const MARCA: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
}

const WORDMARK: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
}

/**
 * Marca SimpleCote — SVG vetorial, transparente e recolorível (substitui os
 * JPEGs de IA de `src/assets/logo-simplecote*.jpg`, que tinham fundo branco
 * chapado e o wordmark com artefato). O símbolo usa as cores da marca via
 * `--brand-navy` / `--brand-mint` (definidas no `index.css`), com fallback
 * embutido; o "S" e a seta são branco fixo pra contrastar sobre o gradiente,
 * então funciona igual no claro e no escuro. É uma reinterpretação geométrica
 * do símbolo original (S entrelaçado + seta pra cima).
 */
export function BrandLogo({ variant = 'full', className, size = 'md' }: BrandLogoProps) {
  const simbolo = (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="SimpleCote"
      className={`${MARCA[size]} shrink-0`}
    >
      <defs>
        <linearGradient id="brandlogo-g" x1="3" y1="3" x2="45" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-navy, #1e3a5f)" />
          <stop offset="1" stopColor="var(--brand-mint, #5fbf92)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#brandlogo-g)" />
      <path
        d="M32 15c-5-4-14-2.8-15.5 3.2-1.4 5.7 6 6.1 8 6.1 6 0 8.8 1.6 7.3 7.4-1.5 5.8-11 5.8-16 1.8"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m19.5 21 4.5-4.8 4.5 4.8"
        stroke="#c9f2dd"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  if (variant === 'mark') {
    return (
      <span role="img" aria-label="SimpleCote" className={className}>
        {simbolo}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      {simbolo}
      <span className={`font-bold tracking-tight ${WORDMARK[size]}`}>
        <span className="text-foreground">Simple</span>
        <span className="text-[var(--brand-mint,#3fae7a)]">Cote</span>
      </span>
    </span>
  )
}
