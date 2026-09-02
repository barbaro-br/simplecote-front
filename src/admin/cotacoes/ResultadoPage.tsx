import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileDown, Send } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import {
  baixarPedidoPdf,
  baixarResultadoXlsx,
  useEnviarPedido,
  usePedidos,
  useResultado,
} from './cotacoes.api'

const ROTULO_PEDIDO: Record<string, string> = {
  GERADO: 'Gerado',
  ENVIADO: 'Enviado',
  CONFIRMADO: 'Confirmado',
}

function PedidoStatusBadge({ status }: { status: string }) {
  if (status === 'CONFIRMADO') {
    return <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">{ROTULO_PEDIDO[status]}</span>
  }
  if (status === 'ENVIADO') {
    return <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{ROTULO_PEDIDO[status]}</span>
  }
  return <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{ROTULO_PEDIDO[status] ?? status}</span>
}

export function ResultadoPage() {
  const { id = '' } = useParams()
  const resultado = useResultado(id)
  const pedidos = usePedidos(id)
  const enviar = useEnviarPedido(id)
  const [erro, setErro] = useState<string | null>(null)

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    setErro(e instanceof ApiError ? e.message : 'Erro inesperado.')
  }

  if (resultado.isLoading) return <p className="p-6 text-muted-foreground">Carregando resultado…</p>
  if (resultado.error)
    return <p className="p-6 text-destructive">Erro ao carregar o resultado: {resultado.error.message}</p>
  if (!resultado.data) return null

  // "Vencedor por item" derivado dos pedidos — um pedido por Empresa vencedora,
  // cada um com seus itens e preços já calculados pelo backend.
  const vencedores = resultado.data.pedidos.flatMap((pedido) =>
    pedido.itens.map((item) => ({
      chave: `${pedido.id}-${item.id}`,
      produto: item.nomeSnapshot,
      empresa: pedido.empresaNome,
      precoEmbalagem: item.precoEmbalagem,
      precoUnitario: item.precoUnitario,
      subtotal: item.subtotal,
    })),
  )

  const listaPedidos = pedidos.data ?? resultado.data.pedidos

  return (
    <PageContainer maxWidth="5xl" className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Resultado da apuração</h1>
          <p className="text-sm text-muted-foreground">Consulte os vencedores por item e acompanhe os pedidos.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setErro(null)
              baixarResultadoXlsx(id).catch(tratarErro)
            }}
          >
            <FileDown className="mr-2 size-4" />
            Baixar XLSX
          </Button>
          <Link to={`/admin/cotacoes/${id}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">
            ← Detalhe
          </Link>
        </div>
      </div>

      {erro && (
        <div role="alert" className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-md">
          {erro}
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Pedidos Gerados</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto border-t">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listaPedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{pedido.empresaNome}</td>
                  <td className="px-4 py-3">
                    <PedidoStatusBadge status={pedido.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground">{moeda(pedido.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setErro(null)
                          baixarPedidoPdf(pedido.id).catch(tratarErro)
                        }}
                      >
                        <FileDown className="mr-2 size-4 text-muted-foreground" />
                        PDF
                      </Button>
                      {pedido.status === 'GERADO' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setErro(null)
                            enviar.mutateAsync(pedido.id).catch(tratarErro)
                          }}
                          disabled={enviar.isPending}
                        >
                          <Send className="mr-2 size-3.5" />
                          Enviar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {listaPedidos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum pedido foi gerado nesta apuração.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Vencedor por item</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto border-t">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Empresa vencedora</th>
                <th className="px-4 py-3 font-medium text-right">Preço embalagem</th>
                <th className="px-4 py-3 font-medium text-right">Preço unitário</th>
                <th className="px-4 py-3 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vencedores.map((v) => (
                <tr key={v.chave} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{v.produto}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.empresa}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{moeda(v.precoEmbalagem)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{moeda(v.precoUnitario)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground font-medium">{moeda(v.subtotal)}</td>
                </tr>
              ))}
              {vencedores.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum vencedor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {resultado.data.itensSemVencedor.length > 0 && (
          <div className="border-t bg-muted/20 p-4">
            <p className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-warning/20 text-warning text-xs">!</span>
              Itens sem vencedor:
            </p>
            <ul className="grid gap-1 sm:grid-cols-2 text-sm text-muted-foreground">
              {resultado.data.itensSemVencedor.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  {item.nomeSnapshot}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
