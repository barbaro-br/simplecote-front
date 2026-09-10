import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Calendar } from '@/shared/components/ui/calendar'
import { Clock, X } from '@phosphor-icons/react'
import { dataHoraBr } from '@/shared/format/formatters'
import { HORAS, MINUTOS, calcularPrazoIso, dataAmanha, estaNoPassado } from './prazo-sao-paulo'

type Props = {
  pendente?: boolean
  /** prazo atual (para contexto e para saber se já venceu) */
  prazoAtualIso?: string | null
  onEstender: (prazoIso: string) => void
  onCancelar: () => void
}

export function EstenderPrazoDialog({ pendente, prazoAtualIso, onEstender, onCancelar }: Props) {
  const [data, setData] = useState<Date | undefined>(() => dataAmanha())
  const [hora, setHora] = useState('18')
  const [minuto, setMinuto] = useState('00')
  const [erro, setErro] = useState<string | null>(null)

  const prazoIso = calcularPrazoIso(data, hora, minuto)
  const vencido = prazoAtualIso != null && estaNoPassado(prazoAtualIso)

  function confirmar() {
    if (!prazoIso) {
      setErro('Informe uma data válida.')
      return
    }
    if (estaNoPassado(prazoIso)) {
      setErro('O novo prazo precisa ser no futuro.')
      return
    }
    setErro(null)
    onEstender(prazoIso)
  }

  return (
    <Dialog
      open
      onClose={onCancelar}
      ariaLabel="Estender prazo"
      className="max-w-md p-0 flex flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-start justify-between border-b px-5 py-3">
        <h2 className="text-lg font-semibold ui-uppercase">Estender prazo</h2>
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
          {vencido
            ? 'O prazo já venceu. Defina um novo prazo para os representantes voltarem a responder — sem precisar encerrar a cotação.'
            : 'Defina um novo prazo para a cotação. Quem ainda não finalizou continua respondendo até lá.'}
        </p>

        {prazoAtualIso && (
          <p className="text-[13px] text-muted-foreground">
            Prazo atual:{' '}
            <strong className={vencido ? 'text-warning' : 'text-foreground'}>
              {dataHoraBr(prazoAtualIso)}
            </strong>
            {vencido && ' (vencido)'}
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
            Novo prazo: {dataHoraBr(prazoIso)} (horário de Brasília)
          </p>
        )}

        {erro && <p className="text-[13px] font-medium text-destructive">{erro}</p>}
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t px-5 py-3">
        <Button variant="ghost" onClick={onCancelar} disabled={pendente}>
          Cancelar
        </Button>
        <Button onClick={confirmar} disabled={pendente}>
          {pendente ? 'Salvando…' : 'Salvar prazo'}
        </Button>
      </div>
    </Dialog>
  )
}
