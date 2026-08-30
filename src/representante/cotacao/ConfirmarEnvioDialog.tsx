import { BottomSheetRoot, BottomSheetContent, BottomSheetHeader, BottomSheetTitle, BottomSheetClose } from '@/shared/components/ui/bottom-sheet'
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
    <BottomSheetRoot open={aberto} onOpenChange={(open) => !open && aoCancelar()}>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>Enviar cotação?</BottomSheetTitle>
        </BottomSheetHeader>
        <div className="px-6 pb-6 space-y-4">
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

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="h-11 flex-1" onClick={aoCancelar}>
              Cancelar
            </Button>
            <Button className="h-11 flex-1" onClick={aoConfirmar}>
              Confirmar
            </Button>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheetRoot>
  )
}
