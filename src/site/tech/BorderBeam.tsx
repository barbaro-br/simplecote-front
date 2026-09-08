import { useDeveAnimar } from './useReduzirMovimento'

/**
 * Borda com um brilho `conic-gradient` girando (CSS `@property` + keyframes).
 * `desligavel` — sem `deveAnimar`, a borda fica estática (só o contorno).
 */
export function BorderBeam({
  className,
  desligavel = true,
}: {
  className?: string
  desligavel?: boolean
}) {
  const deveAnimar = useDeveAnimar()
  const animar = !desligavel || deveAnimar

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-[inherit] ${animar ? 'border-beam' : ''} ${className ?? ''}`}
    />
  )
}
