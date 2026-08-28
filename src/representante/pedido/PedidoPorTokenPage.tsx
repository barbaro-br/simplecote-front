import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
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

  async function aoConfirmar() {
    setErro(null)
    try {
      await confirmar.mutateAsync(observacao.trim() || undefined)
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível confirmar. Tente novamente.')
    }
  }

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Pedido — {p.empresaNome}</h1>
        <p className="text-sm text-muted-foreground">
          {confirmado ? 'Pedido confirmado' : 'Confira os itens e confirme o pedido'}
        </p>
      </header>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium text-right">Qtd.</th>
              <th className="px-3 py-2 font-medium text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {p.itens.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2">{item.nomeSnapshot}</td>
                <td className="px-3 py-2 text-right tabular-nums">{item.quantidade}</td>
                <td className="px-3 py-2 text-right tabular-nums">{moeda(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-medium">
              <td className="px-3 py-2" colSpan={2}>
                Total
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{moeda(p.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setErro(null)
          baixarPedidoPdfPublico(token).catch(() => setErro('Não foi possível baixar o PDF.'))
        }}
      >
        Baixar PDF
      </Button>

      {erro && (
        <div role="alert" className="text-sm text-destructive">
          {erro}
        </div>
      )}

      {confirmado ? (
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
          Pedido confirmado. {p.observacao ? `Observação: ${p.observacao}` : ''}
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="obs" className="text-sm text-muted-foreground">
            Observação (opcional)
          </label>
          <textarea
            id="obs"
            value={observacao}
            maxLength={500}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows={3}
          />
          <Button
            className="w-full h-12 text-base"
            disabled={confirmar.isPending}
            onClick={aoConfirmar}
          >
            {confirmar.isPending ? 'Confirmando…' : 'Confirmar pedido'}
          </Button>
        </div>
      )}
    </div>
  )
}
