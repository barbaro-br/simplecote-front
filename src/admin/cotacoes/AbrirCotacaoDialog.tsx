import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'

type Props = {
  pendente?: boolean
  onAbrir: (prazoIso: string) => void
  onCancelar: () => void
}

/**
 * Coleta o `prazo` via `<input type="datetime-local">` (valor local, sem offset)
 * e converte para ISO-8601 com offset (`toISOString`) — o backend espera `OffsetDateTime`.
 */
export function AbrirCotacaoDialog({ pendente, onAbrir, onCancelar }: Props) {
  const [prazoLocal, setPrazoLocal] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function confirmar() {
    if (!prazoLocal) {
      setErro('Informe o prazo')
      return
    }
    onAbrir(new Date(prazoLocal).toISOString())
  }

  return (
    <Dialog open onClose={onCancelar} title="Abrir cotação">
      <p className="text-sm text-muted-foreground">
        Ao abrir, os participantes convidados podem responder até o prazo definido.
      </p>
      <div>
        <label htmlFor="prazo" className="text-sm font-medium">
          Prazo para respostas
        </label>
        <input
          id="prazo"
          type="datetime-local"
          value={prazoLocal}
          onChange={(e) => {
            setPrazoLocal(e.target.value)
            setErro(null)
          }}
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        />
        {erro && <p className="text-sm text-destructive mt-1">{erro}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancelar} disabled={pendente}>
          Voltar
        </Button>
        <Button onClick={confirmar} disabled={pendente}>
          {pendente ? 'Abrindo…' : 'Abrir'}
        </Button>
      </div>
    </Dialog>
  )
}
