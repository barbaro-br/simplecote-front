import { Fragment, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronRight, FileDown, Send } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Breadcrumb } from '@/shared/components/ui/breadcrumb'
import { moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import {
  baixarPedidoPdf,
  baixarResultadoXlsx,
  useCotacao,
  useEnviarPedido,
  usePedidos,
  useResultado,
} from './cotacoes.api'

const ROTULO_PEDIDO: Record<string, string> = {
  GERADO: 'Gerado',
  ENVIADO: 'Enviado',
  CONFIRMADO: 'Confirmado',
}

function precoDeVenda(precoCusto: number, margemStr: string): number | null {
  const valor = margemStr.trim()
  if (!valor) return null
  const numero = Number(valor.replace(',', '.'))
  if (!Number.isFinite(numero) || numero < 0) return null
  return precoCusto * (1 + numero / 100)
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
  const cotacao = useCotacao(id)
  const enviar = useEnviarPedido(id)
  const [erro, setErro] = useState<string | null>(null)
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [margemGlobal, setMargemGlobal] = useState('')
  const [margensPorItem, setMargensPorItem] = useState<Record<string, string>>({})

  function alternarExpansao(pedidoId: string) {
    setExpandidos((prev) => {
      const novo = new Set(prev)
      if (novo.has(pedidoId)) {
        novo.delete(pedidoId)
      } else {
        novo.add(pedidoId)
      }
      return novo
    })
  }

  function margemEfetiva(itemId: string): string {
    return margensPorItem[itemId] ?? margemGlobal
  }

  function tratarErro(e: unknown) {
    if (e instanceof SessaoExpiradaError) return
    setErro(e instanceof ApiError ? e.message : 'Erro inesperado.')
  }

  if (resultado.isLoading) return <p className="p-6 text-muted-foreground">Carregando resultado…</p>
  if (resultado.error)
    return <p className="p-6 text-destructive">Erro ao carregar o resultado: {resultado.error.message}</p>
  if (!resultado.data) return null

  const listaPedidos = pedidos.data ?? resultado.data.pedidos

  return (
    <PageContainer maxWidth="5xl" className="space-y-8">
      <Breadcrumb
        items={[
          { label: 'Cotações', to: '/admin/cotacoes' },
          { label: cotacao.data?.titulo ?? '', to: `/admin/cotacoes/${id}` },
          { label: 'Resultado' },
        ]}
      />
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
        <div className="px-4 py-3">
          <label htmlFor="margem-global" className="text-sm font-medium">
            Margem de lucro (%)
          </label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              id="margem-global"
              value={margemGlobal}
              onChange={(e) => setMargemGlobal(e.target.value)}
              placeholder="Ex: 30"
              inputMode="decimal"
              className="max-w-40"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Prévia de preço de venda — não afeta o pedido enviado. Aplica a todos os itens e pode ser
            ajustada por item.
          </p>
        </div>
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
              {listaPedidos.map((pedido) => {
                const expandido = expandidos.has(pedido.id)
                return (
                  <Fragment key={pedido.id}>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => alternarExpansao(pedido.id)}
                            aria-expanded={expandido}
                            aria-label={`${expandido ? 'Recolher' : 'Expandir'} itens de ${pedido.empresaNome}`}
                            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <ChevronRight className={`size-4 transition-transform ${expandido ? 'rotate-90' : ''}`} />
                          </button>
                          {pedido.empresaNome}
                        </div>
                      </td>
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
                    {expandido && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 bg-muted/20">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="py-1.5 font-medium">Produto</th>
                                <th className="py-1.5 font-medium text-right">Preço embalagem</th>
                                <th className="py-1.5 font-medium text-right">Preço unitário</th>
                                <th className="py-1.5 font-medium text-right">Margem (%)</th>
                                <th className="py-1.5 font-medium text-right">Preço de venda</th>
                                <th className="py-1.5 font-medium text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {pedido.itens.map((item) => {
                                const precoVenda = precoDeVenda(item.precoUnitario, margemEfetiva(item.id))
                                return (
                                  <tr key={item.id}>
                                    <td className="py-2 font-medium">{item.nomeSnapshot}</td>
                                    <td className="py-2 text-right tabular-nums text-muted-foreground">{moeda(item.precoEmbalagem)}</td>
                                    <td className="py-2 text-right tabular-nums text-muted-foreground">
                                      {moeda(item.precoUnitario)}
                                      {item.decididoPorDesempate && (
                                        <span
                                          title="Empate de preço — decidido por ordem de resposta"
                                          className="ml-2 inline-flex items-center rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning"
                                        >
                                          Empate
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2 text-right">
                                      <Input
                                        value={margemEfetiva(item.id)}
                                        onChange={(e) =>
                                          setMargensPorItem((prev) => ({ ...prev, [item.id]: e.target.value }))
                                        }
                                        placeholder="—"
                                        inputMode="decimal"
                                        aria-label={`Margem (%) de ${item.nomeSnapshot}`}
                                        className="ml-auto h-8 w-20 text-right tabular-nums"
                                      />
                                    </td>
                                    <td className="py-2 text-right tabular-nums text-foreground font-medium">
                                      {precoVenda === null ? '—' : moeda(precoVenda)}
                                    </td>
                                    <td className="py-2 text-right tabular-nums text-foreground font-medium">{moeda(item.subtotal)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
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
