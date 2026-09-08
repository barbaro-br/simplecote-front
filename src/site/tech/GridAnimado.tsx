import { useDeveAnimar } from './useReduzirMovimento'

/**
 * Fundo de grid/dots com máscara radial e leve drift. Decorativo; dentro de um
 * container `overflow-hidden`. Sem `deveAnimar` fica estático.
 */
export function GridAnimado({ className }: { className?: string }) {
  const deveAnimar = useDeveAnimar()

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}>
      <div
        className={`absolute inset-0 ${deveAnimar ? 'grid-drift' : ''}`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--brand-navy) 22%, transparent) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
        }}
      />
    </div>
  )
}
