import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Dialog } from '@/shared/components/ui/dialog'
import { PERGUNTAS_FREQUENTES } from './faq'

export function BotaoAjudaFlutuante() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="Ajuda"
        onClick={() => setAberto(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
      >
        <HelpCircle className="size-6" aria-hidden />
      </button>

      <Dialog open={aberto} onClose={() => setAberto(false)} title="Ajuda">
        <div className="space-y-2">
          {PERGUNTAS_FREQUENTES.map(({ pergunta, resposta }) => (
            <details
              key={pergunta}
              className="group rounded-lg border bg-background/60 open:bg-muted/40"
            >
              <summary className="cursor-pointer select-none rounded-lg px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
                {pergunta}
              </summary>
              <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{resposta}</p>
            </details>
          ))}
        </div>
      </Dialog>
    </>
  )
}
