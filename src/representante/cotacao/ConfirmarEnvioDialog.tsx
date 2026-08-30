import { Dialog } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'

type Props = {
  aberto: boolean
  itensSemPreco: number
  total: number
  aoConfirmar: () => void
  aoCancelar: () => void
}

/**
 * Confirmação antes de finalizar a resposta da cotação
 * (change redesign-tela-preco-representante). Avisa quantos itens vão sem preço.
 */
export function ConfirmarEnvioDialog({ aberto, itensSemPreco, total, aoConfirmar, aoCancelar }: Props) {
  return (
    <Dialog open={aberto} onClose={aoCancelar} title="Enviar cotação?">
      {itensSemPreco > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-700">
          <span className="font-bold">
            {itensSemPreco} {itensSemPreco === 1 ? 'item' : 'itens'}
          </span>{' '}
          sem preço {itensSemPreco === 1 ? 'será enviado' : 'serão enviados'} em branco.
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Todos os {total} itens estão preenchidos.
        </p>
      )}

      <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>

      <div className="flex gap-3">
        <Button variant="outline" className="h-11 flex-1" onClick={aoCancelar}>
          Cancelar
        </Button>
        <Button className="h-11 flex-1" onClick={aoConfirmar}>
          Confirmar
        </Button>
      </div>
    </Dialog>
  )
}
