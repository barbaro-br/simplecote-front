import { PERGUNTAS_FREQUENTES } from '@/admin/ajuda/faq'
import { useSEO } from './seo'
import { HeroFundo } from './HeroFundo'
import { Painel } from './tech/Painel'
import { EmbedYouTube } from './tech/EmbedYouTube'
import { RevealSecao } from './tech/RevealSecao'

export function AjudaPage() {
  useSEO('Central de ajuda — SimpleCote', 'Perguntas frequentes sobre como usar o SimpleCote.')

  return (
    <div className="overflow-x-clip">
      {/* Mesmo fundo de marca da home (versão leve: só gradiente + scrim) */}
      <HeroFundo variant="simples" />

      <div className="relative z-10">
        <RevealSecao className="px-4 py-20">
          <div data-reveal className="mx-auto mb-12 max-w-2xl space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">Central de ajuda</h1>
            <p className="text-white/80">Perguntas frequentes sobre como usar o SimpleCote.</p>
          </div>

          <Painel className="mx-auto max-w-3xl p-6 sm:p-10">
            <div data-reveal className="mb-8">
              <EmbedYouTube titulo="Tutorial do SimpleCote" />
            </div>

            <div className="space-y-3">
              {PERGUNTAS_FREQUENTES.map(({ pergunta, resposta }) => (
                <details
                  key={pergunta}
                  className="group rounded-lg border bg-background/60 open:bg-muted/40"
                >
                  <summary className="cursor-pointer select-none rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-muted">
                    {pergunta}
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{resposta}</p>
                </details>
              ))}
            </div>
          </Painel>
        </RevealSecao>
      </div>
    </div>
  )
}
