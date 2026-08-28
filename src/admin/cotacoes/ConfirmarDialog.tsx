import { Button } from '@/shared/components/ui/button'

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
 * Sem lib de dialog — overlay simples com `role="dialog"`.
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{descricao}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancelar} disabled={pendente}>
            Voltar
          </Button>
          <Button variant="destructive" onClick={onConfirmar} disabled={pendente} autoFocus>
            {pendente ? 'Processando…' : rotuloConfirmar}
          </Button>
        </div>
      </div>
    </div>
  )
}
