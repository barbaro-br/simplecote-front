import logoUnica from '@/assets/logo-unica.png'

type BrandLogoProps = {
  /** `full` = símbolo + wordmark (padrão); `mark` = só o símbolo. */
  variant?: 'full' | 'mark'
  /** Classe no wrapper. O tamanho do símbolo vem de `size`. */
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** `claro` força o "Simple" branco — para header transparente sobre fundo escuro. */
  tom?: 'auto' | 'claro'
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
 * Marca SimpleCote — o símbolo é a arte do Figma `logo-unica` (S entrelaçado
 * 3D + seta pra cima) exportada como PNG, com o fundo branco removido no
 * recorte (`src/assets/logo-unica.png`), então funciona sobre claro e escuro.
 * É um raster: não recolore com os tokens da marca e perde nitidez se for
 * muito ampliado — pra uso grande (hero) prefira uma peça dedicada.
 * O wordmark ao lado continua sendo texto, recolorível via `--brand-mint`.
 */
export function BrandLogo({ variant = 'full', className, size = 'md', tom = 'auto' }: BrandLogoProps) {
  const simbolo = (
    <img
      src={logoUnica}
      alt="SimpleCote"
      className={`${MARCA[size]} shrink-0 object-contain`}
    />
  )

  if (variant === 'mark') {
    return (
      <span className={className}>
        {simbolo}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      {simbolo}
      <span className={`font-bold tracking-tight ${WORDMARK[size]}`}>
        <span className={tom === 'claro' ? 'text-white' : 'text-foreground'}>Simple</span>
        <span className="text-[var(--brand-mint,#3fae7a)]">Cote</span>
      </span>
    </span>
  )
}
