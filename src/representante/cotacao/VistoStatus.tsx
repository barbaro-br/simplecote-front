/**
 * Indicador de status do item na tela de preços do representante
 * (change redesign-tela-preco-representante): cross-fade entre um visto verde
 * (tem preço) e uma marca vermelha (sem preço). É automático — deriva só de
 * `filled`, não há controle clicável.
 */
export function VistoStatus({ filled }: { filled: boolean }) {
  return (
    <div className="relative h-5 w-5 shrink-0">
      <span className="sr-only">{filled ? 'com preço' : 'sem preço'}</span>
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center rounded-md bg-success transition-all duration-300 ${
          filled ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center rounded-md bg-destructive transition-all duration-300 ${
          filled ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
