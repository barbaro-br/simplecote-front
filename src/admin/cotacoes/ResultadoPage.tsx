import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
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
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resultado da apuração</h1>
        <Link to={`/admin/cotacoes/${id}`} className="text-sm text-primary hover:underline">
          ← Detalhe
        </Link>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setErro(null)
            baixarResultadoXlsx(id).catch(tratarErro)
          }}
        >
          Baixar XLSX
        </Button>
      </div>

      {erro && (
        <div role="alert" className="text-sm text-destructive">
          {erro}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Vencedor por item</h2>
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">Produto</th>
                <th className="px-4 py-2 font-medium">Empresa vencedora</th>
                <th className="px-4 py-2 font-medium text-right">Preço embalagem</th>
                <th className="px-4 py-2 font-medium text-right">Preço unitário</th>
                <th className="px-4 py-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vencedores.map((v) => (
                <tr key={v.chave}>
                  <td className="px-4 py-2">{v.produto}</td>
                  <td className="px-4 py-2">{v.empresa}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{moeda(v.precoEmbalagem)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{moeda(v.precoUnitario)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{moeda(v.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {resultado.data.itensSemVencedor.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Itens sem vencedor:</p>
            <ul className="list-disc pl-5">
              {resultado.data.itensSemVencedor.map((item) => (
                <li key={item.id}>{item.nomeSnapshot}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Pedidos</h2>
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-2 font-medium">Empresa</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
                <th className="px-4 py-2 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {listaPedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="px-4 py-2">{pedido.empresaNome}</td>
                  <td className="px-4 py-2">{ROTULO_PEDIDO[pedido.status] ?? pedido.status}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{moeda(pedido.total)}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setErro(null)
                          baixarPedidoPdf(pedido.id).catch(tratarErro)
                        }}
                      >
                        Baixar PDF
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
                          Enviar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
