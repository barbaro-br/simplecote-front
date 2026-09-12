import { createElement, useState } from 'react'
import {
  Calendar,
  ClockCounterClockwise,
  EnvelopeSimple,
  Lifebuoy,
  LockOpen,
  Note,
  Prohibit,
  Trash,
  UserPlus,
  type Icon,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Dialog } from '@/shared/components/ui/dialog'
import { dataHoraBr } from '@/shared/format/formatters'
import { useAdicionarNota, useNotas, useRemoverNota, useTimeline } from './backoffice.api'
import type { TimelineItem } from './backoffice.schema'

// Mostra só as mais recentes na própria tela (a API já devolve mais novo
// primeiro) — o resto fica atrás de "Ver histórico completo", pra uma loja
// com centenas/milhares de eventos não esticar a página de detalhe inteira.
const LIMITE_INLINE = 6

const ROTULO_TIPO_EVENTO: Record<string, string> = {
  cadastro: 'Cadastro',
  verificacao: 'Verificação de e-mail',
  suporte: 'Suporte',
  suspensao: 'Suspensão',
  reativacao: 'Reativação',
  prazo_alterado: 'Prazo alterado',
  exclusao: 'Exclusão',
  nota: 'Nota',
}

const ICONE_TIPO_EVENTO: Record<string, Icon> = {
  cadastro: UserPlus,
  verificacao: EnvelopeSimple,
  suporte: Lifebuoy,
  suspensao: Prohibit,
  reativacao: LockOpen,
  prazo_alterado: Calendar,
  exclusao: Trash,
  nota: Note,
}

function rotuloTipoEvento(tipo: string): string {
  return ROTULO_TIPO_EVENTO[tipo] ?? tipo
}

function iconePorTipoEvento(tipo: string): Icon {
  return ICONE_TIPO_EVENTO[tipo] ?? Note
}

// Data relativa curta ("há 5 min", "há 3 dias"); a absoluta vai no `title`.
function tempoRelativo(dataIso: string): string {
  const diffMs = Date.now() - new Date(dataIso).getTime()
  const seg = Math.floor(diffMs / 1000)
  if (seg < 60) return 'agora'
  const min = Math.floor(seg / 60)
  if (min < 60) return `há ${min} min`
  const horas = Math.floor(min / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 365) return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
  const anos = Math.floor(dias / 365)
  return `há ${anos} ${anos === 1 ? 'ano' : 'anos'}`
}

function mensagemDeErro(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.'
}

function ItemTimeline({ item }: { item: TimelineItem }) {
  // `createElement` (em vez de `<Icone .../>`) evita o falso positivo do lint
  // "static-components": `Icone` é uma referência já existente vinda de um
  // lookup, não um componente novo sendo criado a cada render.
  const icone = createElement(iconePorTipoEvento(item.tipo), {
    className: 'mt-0.5 size-4 shrink-0 text-muted-foreground',
    'aria-hidden': true,
  })
  return (
    <li data-testid="timeline-item" className="flex gap-3">
      {icone}
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{rotuloTipoEvento(item.tipo)}</p>
        <p className="text-xs text-muted-foreground" title={dataHoraBr(item.quando)}>
          {tempoRelativo(item.quando)} · {item.ator ?? 'Sistema'}
        </p>
        <p className="text-sm text-muted-foreground">{item.descricao}</p>
      </div>
    </li>
  )
}

export function NotasEHistorico({ compradorId }: { compradorId: string }) {
  const notas = useNotas(compradorId)
  const timeline = useTimeline(compradorId)
  const adicionarNota = useAdicionarNota(compradorId)
  const removerNota = useRemoverNota(compradorId)

  const [texto, setTexto] = useState('')
  const [notaARemover, setNotaARemover] = useState<string | null>(null)
  const [historicoAberto, setHistoricoAberto] = useState(false)

  async function enviarNota() {
    try {
      await adicionarNota.mutateAsync(texto)
      setTexto('')
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      toast.error(mensagemDeErro(e))
    }
  }

  async function confirmarRemoverNota() {
    if (!notaARemover) return
    try {
      await removerNota.mutateAsync(notaARemover)
      setNotaARemover(null)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      toast.error(mensagemDeErro(e))
    }
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold ui-uppercase">Notas e histórico</h2>

      <div className="space-y-2">
        <textarea
          aria-label="Nova nota"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma nota sobre esta loja…"
          className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="flex justify-end">
          <Button disabled={!texto.trim() || adicionarNota.isPending} onClick={enviarNota}>
            {adicionarNota.isPending ? 'Adicionando…' : 'Adicionar nota'}
          </Button>
        </div>
      </div>

      {notas.isLoading ? (
        <p className="py-3 text-sm text-muted-foreground">Carregando notas…</p>
      ) : notas.error ? (
        <p className="py-3 text-sm text-destructive">Erro ao carregar notas: {notas.error.message}</p>
      ) : !notas.data?.length ? (
        <p className="py-3 text-sm text-muted-foreground">Nenhuma nota.</p>
      ) : (
        <ul className="divide-y divide-border">
          {notas.data.map((nota) => (
            <li key={nota.id} className="flex items-start justify-between gap-3 py-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Super admin · <span title={dataHoraBr(nota.criadoEm)}>{tempoRelativo(nota.criadoEm)}</span>
                </p>
                <p className="text-sm">{nota.texto}</p>
              </div>
              {notaARemover === nota.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">Remover nota?</span>
                  <Button variant="ghost" size="sm" onClick={() => setNotaARemover(null)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={removerNota.isPending}
                    onClick={confirmarRemoverNota}
                  >
                    Confirmar remoção
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setNotaARemover(nota.id)}>
                  Remover
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t pt-4">
        <h3 className="mb-3 text-sm font-semibold ui-uppercase">Histórico</h3>
        {timeline.isLoading ? (
          <p className="py-3 text-sm text-muted-foreground">Carregando histórico…</p>
        ) : timeline.error ? (
          <p className="py-3 text-sm text-destructive">Erro ao carregar histórico: {timeline.error.message}</p>
        ) : !timeline.data?.length ? (
          <p className="py-3 text-sm text-muted-foreground">Nenhum evento registrado.</p>
        ) : (
          <>
            <ol className="space-y-4">
              {timeline.data.slice(0, LIMITE_INLINE).map((item, i) => (
                <ItemTimeline key={`${item.tipo}-${item.quando}-${i}`} item={item} />
              ))}
            </ol>

            {timeline.data.length > LIMITE_INLINE && (
              <div className="mt-4 flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => setHistoricoAberto(true)}>
                  <ClockCounterClockwise className="mr-2 size-4" />
                  Ver histórico completo ({timeline.data.length})
                </Button>
              </div>
            )}

            <Dialog
              open={historicoAberto}
              onClose={() => setHistoricoAberto(false)}
              title="Histórico completo"
              size="lg"
            >
              <ol className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                {timeline.data.map((item, i) => (
                  <ItemTimeline key={`${item.tipo}-${item.quando}-${i}`} item={item} />
                ))}
              </ol>
            </Dialog>
          </>
        )}
      </div>
    </Card>
  )
}
