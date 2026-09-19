import { CircleNotch, QrCode, Power, ArrowsClockwise } from '@phosphor-icons/react'
import { useGlobalQrCodeWhatsApp, useGlobalStatusWhatsApp, useGlobalDesconectarWhatsApp } from './backoffice.api'
import { toast } from 'sonner'
import { Card } from '@/shared/components/ui/card'

export function GlobalWhatsAppCard() {
  const qrCodeData = useGlobalQrCodeWhatsApp()
  const statusWhatsApp = useGlobalStatusWhatsApp(true)
  const desconectarWhatsApp = useGlobalDesconectarWhatsApp()

  const conectado = statusWhatsApp.data?.state === 'open'

  return (
    <Card className="p-6 space-y-4 border-[#25D366]/30">
      <div className="border-b border-border/50 pb-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#25D366] uppercase">
          INTEGRAÇÃO GLOBAL
        </span>
        <h2 className="text-lg font-semibold ui-uppercase mt-1">WhatsApp da Aplicação</h2>
        <p className="text-sm text-muted-foreground mt-1">
          WhatsApp padrão usado para enviar avisos de lojas que não possuem integração própria ativa.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border border-border/50 p-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full border ${conectado ? 'bg-success/20 border-success text-success' : 'bg-muted border-border text-muted-foreground'}`}>
              <Power className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Status da conexão global</p>
              <p className="text-xs text-muted-foreground">
                {statusWhatsApp.isLoading ? 'Verificando...' : conectado ? 'Conectado' : statusWhatsApp.data?.state || 'Desconectado'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => statusWhatsApp.refetch()}
            disabled={statusWhatsApp.isFetching}
            className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
            title="Atualizar status"
          >
            <ArrowsClockwise className={`size-4 text-foreground ${statusWhatsApp.isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {conectado ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                desconectarWhatsApp.mutateAsync().then(() => {
                  toast.success('WhatsApp Global desconectado.')
                  statusWhatsApp.refetch()
                  qrCodeData.refetch()
                }).catch(() => {
                  toast.error('Erro ao desconectar WhatsApp Global.')
                })
              }}
              disabled={desconectarWhatsApp.isPending}
              className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 text-xs font-semibold uppercase tracking-wide disabled:opacity-50 transition-colors"
            >
              {desconectarWhatsApp.isPending ? 'Desconectando...' : 'Desconectar WhatsApp Global'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 border border-border/50 bg-muted/10 gap-4">
            {qrCodeData.isLoading || qrCodeData.isFetching ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CircleNotch className="size-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Gerando QR Code Global...</p>
              </div>
            ) : qrCodeData.isError ? (
              <div className="text-center py-6">
                <p className="text-sm text-destructive mb-4">Erro ao carregar QR Code Global.</p>
                <button
                  type="button"
                  onClick={() => qrCodeData.refetch()}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-xs font-semibold uppercase tracking-wide transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            ) : qrCodeData.data?.base64 ? (
              <>
                <img src={qrCodeData.data.base64} alt="QR Code WhatsApp Global" className="w-64 h-64 object-contain" />
                <p className="text-xs text-muted-foreground text-center max-w-sm">
                  Abra o WhatsApp e escaneie o código para conectar o número padrão da aplicação.
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
                onClick={() => {
                  qrCodeData.refetch()
                  statusWhatsApp.refetch()
                }}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <QrCode className="size-4" />
                Gerar QR Code Global
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
