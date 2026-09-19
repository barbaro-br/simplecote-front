import { CircleNotch, QrCode, Power, ArrowsClockwise } from '@phosphor-icons/react'
import { useQrCodeWhatsApp, useStatusWhatsApp, useDesconectarWhatsApp } from './configuracoes.api'
import { toast } from 'sonner'
import { useConfiguracaoLoja } from './configuracoes.api'

export function ConfiguracoesWhatsApp() {
  const { data: comprador } = useConfiguracaoLoja()
  const qrCodeEnabled = Boolean(comprador?.usaWhatsAppProprio)
  const qrCodeData = useQrCodeWhatsApp()
  const statusWhatsApp = useStatusWhatsApp(qrCodeEnabled)
  const desconectarWhatsApp = useDesconectarWhatsApp()

  if (!qrCodeEnabled) return null

  const conectado = statusWhatsApp.data?.state === 'open'

  return (
    <div className="rounded-none border border-white/15 bg-[#0d1410] p-6 shadow-xl space-y-4">
      <div className="border-b border-white/10 pb-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#25D366] uppercase">
          INTEGRAÇÃO
        </span>
        <label className="block text-base font-bold text-on-surface mt-0.5">
          WhatsApp da Loja
        </label>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          Conecte o WhatsApp do seu supermercado para que os avisos automáticos aos fornecedores sejam disparados a partir do seu próprio número.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border border-white/10 p-4 bg-[#131b15]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full border ${conectado ? 'bg-success/20 border-success text-success' : 'bg-white/5 border-white/10 text-on-surface-variant'}`}>
              <Power className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Status da conexão</p>
              <p className="text-xs text-on-surface-variant/80">
                {statusWhatsApp.isLoading ? 'Verificando...' : conectado ? 'Conectado' : statusWhatsApp.data?.state || 'Desconectado'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => statusWhatsApp.refetch()}
            disabled={statusWhatsApp.isFetching}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            title="Atualizar status"
          >
            <ArrowsClockwise className={`size-4 text-on-surface ${statusWhatsApp.isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {conectado ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                desconectarWhatsApp.mutateAsync().then(() => {
                  toast.success('WhatsApp desconectado.')
                  statusWhatsApp.refetch()
                  qrCodeData.refetch()
                }).catch(() => {
                  toast.error('Erro ao desconectar.')
                })
              }}
              disabled={desconectarWhatsApp.isPending}
              className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-bold uppercase tracking-wide disabled:opacity-50 transition-colors"
            >
              {desconectarWhatsApp.isPending ? 'Desconectando...' : 'Desconectar WhatsApp'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 border border-white/10 bg-[#131b15] gap-4">
            {qrCodeData.isLoading || qrCodeData.isFetching ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CircleNotch className="size-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-on-surface-variant">Gerando QR Code...</p>
              </div>
            ) : qrCodeData.isError ? (
              <div className="text-center py-6">
                <p className="text-sm text-rose-400 mb-4">Erro ao carregar QR Code.</p>
                <button
                  type="button"
                  onClick={() => qrCodeData.refetch()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-xs font-bold uppercase tracking-wide transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            ) : qrCodeData.data?.base64 ? (
              <>
                <img src={qrCodeData.data.base64} alt="QR Code WhatsApp" className="w-64 h-64 object-contain" />
                <p className="text-xs text-on-surface-variant text-center max-w-sm">
                  Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie este QR Code.
                </p>
                <button
                  type="button"
                  onClick={() => qrCodeData.refetch()}
                  className="mt-2 inline-flex items-center gap-2 text-xs text-primary hover:underline font-medium"
                >
                  <ArrowsClockwise className="size-3" />
                  Gerar novo código
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => qrCodeData.refetch()}
                className="px-4 py-2 bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <QrCode className="size-4" />
                Gerar QR Code
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
