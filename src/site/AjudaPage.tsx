import { PERGUNTAS_FREQUENTES } from '@/admin/ajuda/faq'
import { useSEO } from './seo'
import { EmbedYouTube } from './tech/EmbedYouTube'
import { RevealSecao } from './tech/RevealSecao'

export function AjudaPage() {
  useSEO('Central de ajuda — SimpleCote', 'Perguntas frequentes sobre como usar o SimpleCote.')

  return (
    <div className="overflow-x-clip">
      <RevealSecao>
        <div className="mx-auto w-full max-w-2xl px-4 py-16">
          <div data-reveal className="mb-10 space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Central de ajuda</h1>
            <p className="text-muted-foreground">Perguntas frequentes sobre como usar o SimpleCote.</p>
          </div>

          <div data-reveal className="mb-8">
            <EmbedYouTube titulo="Tutorial do SimpleCote" />
          </div>

          <div className="space-y-3">
            {PERGUNTAS_FREQUENTES.map(({ pergunta, resposta }) => (
              <details key={pergunta} className="group rounded-lg border bg-background/60 open:bg-muted/40">
                <summary className="cursor-pointer select-none rounded-lg px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
                  {pergunta}
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{resposta}</p>
              </details>
            ))}
          </div>
        </div>
      </RevealSecao>
    </div>
  )
}
