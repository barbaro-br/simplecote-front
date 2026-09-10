import {
  BottomSheetRoot,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from '@/shared/components/ui/bottom-sheet'
import { BotaoPrimario, BotaoFantasma } from '@/shared/ui'

type Props = {
  aberto: boolean
  itensSemPreco: number
  total: number
  aoConfirmar: () => void
  aoCancelar: () => void
}

/**
 * Confirmação antes de finalizar a resposta da cotação. Avisa quantos itens
 * vão sem preço. Tema escuro (redesign-painel-dark, Fase 1).
 */
export function ConfirmarEnvioDialog({
  aberto,
  itensSemPreco,
  total,
  aoConfirmar,
  aoCancelar,
}: Props) {
  return (
    <BottomSheetRoot open={aberto} onOpenChange={(open) => !open && aoCancelar()}>
      <BottomSheetContent
        data-painel="dark"
        className="border-t border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-[var(--pnl-superficie,#12263f)]"
      >
        <BottomSheetHeader>
          <BottomSheetTitle className="text-[var(--pnl-txt,#fff)]">Enviar cotação?</BottomSheetTitle>
        </BottomSheetHeader>
        <div className="space-y-4 px-6 pb-6">
          {itensSemPreco > 0 ? (
            <div className="rounded-xl border border-[var(--pnl-atencao,#e0a030)]/30 bg-[var(--pnl-atencao,#e0a030)]/10 px-3 py-2.5 text-[13px] text-[var(--pnl-atencao,#e0a030)]">
              <span className="font-bold">
                {itensSemPreco} {itensSemPreco === 1 ? 'item' : 'itens'}
              </span>{' '}
              sem preço {itensSemPreco === 1 ? 'será enviado' : 'serão enviados'} em branco.
            </div>
          ) : (
            <p className="text-sm text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
              Todos os {total} itens estão preenchidos.
            </p>
          )}

          <p className="text-xs text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            Esta ação não pode ser desfeita.
          </p>

          <div className="flex gap-3 pt-2">
            <BotaoFantasma className="h-11 flex-1 text-[14px]" onClick={aoCancelar}>
              Cancelar
            </BotaoFantasma>
            <BotaoPrimario className="h-11 flex-1 text-[14px]" onClick={aoConfirmar}>
              Confirmar
            </BotaoPrimario>
          </div>
        </div>
      </BottomSheetContent>
    </BottomSheetRoot>
  )
}
