import { Button } from '@/shared/components/ui/button'

/**
 * Fallback exibido pelo error boundary quando um erro de render escapa.
 * Mensagem pt-BR + botão de recarregar (recarrega a página inteira).
 */
export function FallbackErro() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-base font-medium">Algo quebrou nesta tela. Recarregue a página.</p>
      <Button onClick={() => window.location.reload()}>Recarregar</Button>
    </div>
  )
}
