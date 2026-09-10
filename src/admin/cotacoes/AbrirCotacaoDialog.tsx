import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Calendar } from '@/shared/components/ui/calendar'
import { Clock, PaperPlaneRight, X } from '@phosphor-icons/react'
import { dataHoraBr } from '@/shared/format/formatters'
import { HORAS, MINUTOS, calcularPrazoIso, dataAmanha, estaNoPassado } from './prazo-sao-paulo'

type Props = {
  pendente?: boolean
  /** quantos itens a cotação tem no momento (para o resumo/aviso) */
  totalItens?: number
  /** quantos fornecedores serão convidados ao abrir */
  totalFornecedores?: number
  onAbrir: (prazoIso: string) => void
  onCancelar: () => void
}

export function AbrirCotacaoDialog({
  pendente,
  totalItens,
  totalFornecedores,
  onAbrir,
  onCancelar,
}: Props) {
  const [data, setData] = useState<Date | undefined>(() => dataAmanha())
  const [hora, setHora] = useState('18')
  const [minuto, setMinuto] = useState('00')
  const [erro, setErro] = useState<string | null>(null)

  const prazoIso = calcularPrazoIso(data, hora, minuto)

  function confirmar() {
    if (!prazoIso) {
      setErro('Informe uma data válida.')
      return
    }

    if (estaNoPassado(prazoIso)) {
      setErro('O prazo precisa ser no futuro.')
      return
    }

    setErro(null)
    onAbrir(prazoIso)
  }

  const faltaAlgo = totalItens === 0 || totalFornecedores === 0

  return (
    // p-0 + flex-col: cabeçalho e rodapé fixos, só o miolo (calendário) rola —
    // em telas baixas o botão "Abrir Cotação" nunca some.
    <Dialog open onClose={onCancelar} ariaLabel="Abrir cotação" className="max-w-md p-0 flex flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between border-b px-5 py-3">
        <h2 className="text-lg font-semibold ui-uppercase">Abrir cotação</h2>
        <button
          type="button"
          onClick={onCancelar}
          aria-label="Fechar"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <p className="text-sm text-muted-foreground">
          Os representantes convidados são notificados na hora e respondem até o prazo abaixo.
        </p>

        {(totalItens != null || totalFornecedores != null) && (
          <p className="text-[13px] text-muted-foreground">
            {totalItens != null && (
              <>
                <strong className="text-foreground">
                  {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                </strong>
                {totalFornecedores != null && ' · '}
              </>
            )}
            {totalFornecedores != null && (
              <strong className="text-foreground">
                {totalFornecedores} {totalFornecedores === 1 ? 'fornecedor' : 'fornecedores'}
              </strong>
            )}
            {faltaAlgo && (
              <span className="ml-1 font-medium text-warning">
                {totalItens === 0
                  ? '— adicione itens antes de abrir.'
                  : '— convide ao menos um fornecedor antes de abrir.'}
              </span>
            )}
          </p>
        )}

        <div className="flex flex-wrap items-start gap-4">
          <Calendar
            mode="single"
            selected={data}
            onSelect={setData}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="pointer-events-auto rounded-lg border p-2"
          />
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" aria-hidden />
            <select
              aria-label="Hora"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="rounded-md border bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            >
              {HORAS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="text-muted-foreground">:</span>
            <select
              aria-label="Minuto"
              value={minuto}
              onChange={(e) => setMinuto(e.target.value)}
              className="rounded-md border bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            >
              {MINUTOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {prazoIso && (
          <p className="text-[13px] text-muted-foreground">
            Expira {dataHoraBr(prazoIso)} (horário de Brasília)
          </p>
        )}

        {erro && <p className="text-[13px] font-medium text-destructive">{erro}</p>}
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t px-5 py-3">
        <Button variant="ghost" onClick={onCancelar} disabled={pendente}>
          Cancelar
        </Button>
        <Button onClick={confirmar} disabled={pendente} className="gap-2">
          {pendente ? 'Abrindo…' : 'Abrir Cotação'}
          <PaperPlaneRight className="size-4" />
        </Button>
      </div>
    </Dialog>
  )
}
