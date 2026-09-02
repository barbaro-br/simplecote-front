import { useState } from 'react'
import { VistoStatus } from './VistoStatus'

const PASSOS = [
  { titulo: 'Conheça o card de produto', conteudo: 'anatomia' },
  { titulo: 'O visto é automático', conteudo: 'visto' },
  {
    titulo: 'Pronto para começar!',
    conteudo: 'fim',
    desc: 'Preencha os preços, deslize um card para limpar, e toque em Finalizar para enviar sua resposta oficialmente ao sistema.',
  },
] as const

function MiniCard({ preco }: { preco: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-bold">café bom aroma</span>
          <span className="font-mono text-[9px] text-muted-foreground">7891234000015</span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground">fd com 20un · comprar 10</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="flex items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5">
          <span className="text-[9px] text-muted-foreground">R$</span>
          <span className="w-10 text-[11px] font-bold">
            {preco || <span className="text-muted-foreground/60">0,00</span>}
          </span>
        </div>
        <VistoStatus filled={!!preco} />
      </div>
    </div>
  )
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
      {children}
    </span>
  )
}

export function TutorialOnboarding({ aoConcluir }: { aoConcluir: () => void }) {
  const [passo, setPasso] = useState(0)
  const ultimo = passo === PASSOS.length - 1

  function avancar() {
    if (ultimo) aoConcluir()
    else setPasso((p) => p + 1)
  }

  return (
    <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tutorial"
        className="w-full rounded-t-3xl bg-card shadow-2xl md:max-w-sm md:rounded-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-center gap-1.5 pb-2 pt-5">
          {PASSOS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === passo ? 'h-1.5 w-5 bg-primary' : 'h-1.5 w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>

        <div key={passo} className="fade-in px-5 pb-2 pt-2">
          <h3 className="mb-3 text-[17px] font-bold">{PASSOS[passo].titulo}</h3>

          {PASSOS[passo].conteudo === 'anatomia' && (
            <div className="space-y-3">
              <MiniCard preco="12,68" />
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-muted p-3">
                  <Etiqueta>Nome</Etiqueta>
                  <p className="mt-1 text-[11px] text-muted-foreground">Produto em destaque</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <Etiqueta>Embalagem</Etiqueta>
                  <p className="mt-1 text-[11px] text-muted-foreground">Tipo, qtd e a comprar</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <Etiqueta>Preço</Etiqueta>
                  <p className="mt-1 text-[11px] text-muted-foreground">Preço da embalagem</p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <Etiqueta>Código</Etiqueta>
                  <p className="mt-1 text-[11px] text-muted-foreground">Código de barras</p>
                </div>
              </div>
            </div>
          )}

          {PASSOS[passo].conteudo === 'visto' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <MiniCard preco="" />
                <p className="text-center text-[11px] text-muted-foreground">
                  Sem preço → <span className="font-semibold text-destructive">X vermelho</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <MiniCard preco="12,68" />
                <p className="text-center text-[11px] text-muted-foreground">
                  Com preço → <span className="font-semibold text-success">visto verde</span>
                </p>
              </div>
              <p className="rounded-xl bg-muted px-3 py-2 text-center text-[12px] text-muted-foreground">
                O visto muda sozinho ao preencher o preço
              </p>
            </div>
          )}

          {PASSOS[passo].conteudo === 'fim' && (
            <div className="space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 12l5 5L20 7"
                    stroke="currentColor"
                    className="text-primary"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-center text-sm leading-relaxed text-muted-foreground">
                {PASSOS[passo].desc}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 px-5 pb-5 pt-3">
          <button
            onClick={avancar}
            className="w-full rounded-xl bg-primary py-3 text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {ultimo ? 'Entendi, vamos lá!' : 'Próximo'}
          </button>
          {!ultimo && (
            <button onClick={aoConcluir} className="py-1 text-[12px] text-muted-foreground">
              Pular tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
