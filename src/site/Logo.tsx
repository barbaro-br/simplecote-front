import logoClaro from '@/assets/logo-simplecote.jpg'
import logoEscuro from '@/assets/logo-simplecote-alt.jpg'

type LogoProps = {
  variant?: 'completo' | 'simbolo'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const TAMANHOS: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-6 w-6',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
}

/**
 * Marca SimpleCote. Os JPEGs são lockups horizontais com fundo branco e o
 * wordmark tem um "E" final invertido (artefato) — por isso usamos só o símbolo
 * "S" (recorte à esquerda via `object-cover`/`object-left`) e escrevemos
 * "SimpleCote" como texto HTML. A variante `-alt` é usada no tema escuro.
 */
export function Logo({ variant = 'completo', size = 'md', className }: LogoProps) {
  const simbolo = (
    <span className={`relative inline-block shrink-0 overflow-hidden ${TAMANHOS[size]}`} aria-hidden="true">
      <img
        src={logoClaro}
        alt=""
        className="h-full w-full object-cover object-left dark:hidden"
        draggable={false}
      />
      <img
        src={logoEscuro}
        alt=""
        className="hidden h-full w-full object-cover object-left dark:block"
        draggable={false}
      />
    </span>
  )

  if (variant === 'simbolo') {
    return (
      <span role="img" aria-label="SimpleCote" className={className}>
        {simbolo}
      </span>
    )
  }

  return (
    <span className={`flex items-center gap-2.5 ${className ?? ''}`}>
      {simbolo}
      <span className="text-lg font-bold tracking-tight">SimpleCote</span>
    </span>
  )
}
