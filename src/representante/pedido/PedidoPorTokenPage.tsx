import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileDown, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { moeda } from '@/shared/format/formatters'
import { ApiError } from '@/shared/api/api-client'
import { baixarPedidoPdfPublico, useConfirmarPedido, usePedidoPorToken } from './pedido-token.api'

export function PedidoPorTokenPage() {
  const { token = '' } = useParams()
  const pedido = usePedidoPorToken(token)
  const confirmar = useConfirmarPedido(token)
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  if (pedido.isLoading) return <p className="p-6 text-muted-foreground">Carregando…</p>

  if (pedido.error || !pedido.data) {
    return (
      <div className="mx-auto max-w-md p-6 text-center space-y-2">
        <h1 className="text-xl font-semibold">Link inválido</h1>
        <p className="text-muted-foreground">Este link de pedido não é válido ou expirou.</p>
      </div>
    )
  }

  const p = pedido.data
  const confirmado = p.status === 'CONFIRMADO' || p.confirmadoEm != null
  const aguardandoEnvio = p.status === 'GERADO'

  async function aoConfirmar() {
    setErro(null)
    try {
      await confirmar.mutateAsync(observacao.trim() || undefined)
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível confirmar. Tente novamente.')
    }
  }

  return (
    <div className="mx-auto max-w-md pb-32">
      <header className="sticky top-0 z-20 space-y-1 bg-background/95 backdrop-blur border-b px-4 py-3">
        <h1 className="text-xl font-semibold tracking-tight">Pedido</h1>
        <p className="text-sm text-muted-foreground font-medium">
          {p.empresaNome}
        </p>
        <p className={`text-sm pt-1 font-medium ${confirmado ? 'text-success flex items-center gap-1.5' : 'text-muted-foreground'}`}>
          {confirmado && <CheckCircle2 className="size-4" />}
          {confirmado ? 'Pedido confirmado' : 'Confira os itens e confirme o pedido'}
        </p>
      </header>

      <div className="px-4 py-4 space-y-4">
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <CardTitle>Resumo dos Itens</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-t">
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 font-medium text-right">Qtd.</th>
                  <th className="px-3 py-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {p.itens.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-3 py-3 font-medium">{item.nomeSnapshot}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{item.quantidade}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{moeda(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-medium bg-muted/10">
                  <td className="px-3 py-3" colSpan={2}>
                    Total do pedido
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-base text-primary">{moeda(p.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {confirmado && (
          <div className="rounded-md border bg-success/10 border-success/20 px-4 py-3 text-sm">
            <p className="font-medium text-success-foreground mb-1">Confirmado com sucesso!</p>
            {p.observacao && <p className="text-muted-foreground mt-2 border-t border-success/10 pt-2"><span className="font-medium text-foreground">Sua observação:</span> {p.observacao}</p>}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-20 border-t bg-background/95 backdrop-blur px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] space-y-3">
        {erro && (
          <div role="alert" className="text-sm text-destructive font-medium">
            {erro}
          </div>
        )}
        
        {aguardandoEnvio && (
          <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Aguardando envio pelo comprador.
          </div>
        )}

        {!aguardandoEnvio && !confirmado && (
          <div className="space-y-2 mb-3">
            <label htmlFor="obs" className="text-sm font-medium text-foreground">
              Observação <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              id="obs"
              value={observacao}
              maxLength={500}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground/70"
              placeholder="Alguma instrução para a entrega?"
              rows={2}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => {
              setErro(null)
              baixarPedidoPdfPublico(token).catch(() => setErro('Não foi possível baixar o PDF.'))
            }}
          >
            <FileDown className="mr-2 size-4" />
            Baixar PDF
          </Button>

          {!aguardandoEnvio && !confirmado && (
            <Button
              className="flex-[2] h-12 text-base"
              disabled={confirmar.isPending}
              onClick={aoConfirmar}
            >
              {confirmar.isPending ? 'Confirmando…' : 'Confirmar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
