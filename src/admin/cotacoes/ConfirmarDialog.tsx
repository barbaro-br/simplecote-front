import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'

type Props = {
  titulo: string
  descricao: string
  rotuloConfirmar?: string
  pendente?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

/**
 * Diálogo de confirmação para ações irreversíveis (regra 8 do spec.md).
 * Compõe o primitivo `Dialog`.
 */
export function ConfirmarDialog({
  titulo,
  descricao,
  rotuloConfirmar = 'Confirmar',
  pendente,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <Dialog open onClose={onCancelar} title={titulo}>
      <p className="text-sm text-muted-foreground">{descricao}</p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancelar} disabled={pendente}>
          Voltar
        </Button>
        <Button variant="destructive" onClick={onConfirmar} disabled={pendente} autoFocus>
          {pendente ? 'Processando…' : rotuloConfirmar}
        </Button>
      </div>
    </Dialog>
  )
}
