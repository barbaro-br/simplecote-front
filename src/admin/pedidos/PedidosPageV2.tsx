import { useState } from 'react'
import { CaretDown, CaretUp, FilePdf, PaperPlaneTilt } from '@phosphor-icons/react'
import { usePedidosAgregados, useReenviarPedido } from './pedidos.api'
import { baixarPedidoPdf } from '@/admin/cotacoes/cotacoes.api'
import { agruparPedidosPorEmpresa, ROTULO_STATUS } from './pedidos.util'
import { moeda } from '@/shared/format/formatters'
import type { PedidoResumo } from './pedidos.schema'

function AccordionEmpresa({ empresaNome, totalGeral, pedidos }: { empresaNome: string; totalGeral: number; pedidos: PedidoResumo[] }) {
  const [aberto, setAberto] = useState(false)
  const reenviar = useReenviarPedido()

  return (
    <div className="bg-surface-container-low rounded-xl border border-surface-container-highest overflow-hidden shadow-sm">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-space-lg bg-surface-container hover:bg-surface-container-high transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset sticky top-0 z-10"
      >
        <div className="flex items-center gap-space-md">
          {aberto ? <CaretUp className="size-5 text-on-surface-variant" /> : <CaretDown className="size-5 text-on-surface-variant" />}
          <div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface">{empresaNome}</h3>
            <span className="text-label-sm text-on-surface-variant">{pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-body-sm text-on-surface-variant">Total</span>
          <span className="text-headline-md font-headline-md text-primary">{moeda(totalGeral)}</span>
        </div>
      </button>

      {aberto && (
        <div className="border-t border-surface-container-highest p-space-md animate-in slide-in-from-top-2 duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container-highest text-label-md font-label-md text-on-surface-variant uppercase">
                  <th className="px-space-md py-space-sm">Origem</th>
                  <th className="px-space-md py-space-sm">Status</th>
                  <th className="px-space-md py-space-sm text-right">Qtd. Itens</th>
                  <th className="px-space-md py-space-sm text-right">Total Pedido</th>
                  <th className="px-space-md py-space-sm text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container transition-colors">
                    <td className="px-space-md py-space-md">
                      <span className="text-body-md text-on-surface">{p.origem === 'AVULSO' ? 'Avulso' : 'Cotação'}</span>
                    </td>
                    <td className="px-space-md py-space-md">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm font-label-md uppercase">
                        {ROTULO_STATUS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-space-md py-space-md text-right tabular-nums text-body-md text-on-surface">
                      {p.quantidadeItens}
                    </td>
                    <td className="px-space-md py-space-md text-right tabular-nums text-body-md text-on-surface font-medium">
                      {moeda(p.total)}
                    </td>
                    <td className="px-space-md py-space-md text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => baixarPedidoPdf(p.id)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
                          title="Baixar PDF"
                        >
                          <FilePdf className="size-5" />
                        </button>
                        <button
                          onClick={() => reenviar.mutate(p.id)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
                          title="Reenviar e-mail"
                        >
                          <PaperPlaneTilt className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export function PedidosPageV2() {
  const { data, isLoading } = usePedidosAgregados()

  if (isLoading) {
    return <div className="p-space-xl text-on-surface-variant">Carregando pedidos...</div>
  }

  const todosPedidos = [
    ...(data?.avulsos || []),
    ...(data?.grupos?.flatMap(g => g.pedidos) || [])
  ]

  const gruposPorEmpresa = agruparPedidosPorEmpresa(todosPedidos)

  return (
    <div className="p-space-xl max-w-5xl mx-auto space-y-space-lg">
      <div>
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Pedidos (Visual Novo)</h1>
        <p className="text-body-md text-on-surface-variant mt-space-xs">Visualize todos os pedidos agrupados por fornecedor em formato sanfona.</p>
      </div>

      <div className="space-y-space-md">
        {gruposPorEmpresa.length === 0 ? (
          <div className="text-body-md text-on-surface-variant">Nenhum pedido encontrado.</div>
        ) : (
          gruposPorEmpresa.map((grupo) => (
            <AccordionEmpresa
              key={grupo.empresaNome}
              empresaNome={grupo.empresaNome}
              totalGeral={grupo.totalGeral}
              pedidos={grupo.pedidos}
            />
          ))
        )}
      </div>
    </div>
  )
}
