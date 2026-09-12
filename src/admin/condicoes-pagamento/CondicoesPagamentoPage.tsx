import { useMemo, useState } from 'react'
import { Eye, EyeSlash, PlusCircle } from '@phosphor-icons/react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CabecalhoPagina, Superficie, Selo, ChipsFiltro, type OpcaoChip } from '@/shared/ui'
import { useCondicoesPagamento, useInativarCondicaoPagamento, useAtivarCondicaoPagamento } from './condicoes-pagamento.api'
import { CondicaoPagamentoForm } from './CondicaoPagamentoForm'

const FILTROS: OpcaoChip[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ativos', rotulo: 'Ativos' },
  { valor: 'inativos', rotulo: 'Inativos' },
]

export function CondicoesPagamentoPage() {
  const { data: condicoes, isLoading, error } = useCondicoesPagamento({ incluirInativos: true })
  const inativar = useInativarCondicaoPagamento()
  const ativar = useAtivarCondicaoPagamento()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  const condicoesOrdenadas = useMemo(
    () =>
      [...(condicoes ?? [])]
        .filter((c) => filtro === 'todos' || (filtro === 'ativos' ? c.ativo : !c.ativo))
        .sort((a, b) => Number(b.ativo) - Number(a.ativo)),
    [condicoes, filtro],
  )

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando condições de pagamento…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar condições de pagamento: {error.message}</p>

  return (
    <PageContainer maxWidth="5xl" className="space-y-6">
      <CabecalhoPagina
        titulo="Condições de Pagamento"
        subtitulo="Catálogo de condições oferecidas na cotação, na resposta do representante e no pedido avulso."
        acao={
          <Button onClick={() => setMostrarForm(true)}>
            <PlusCircle className="mr-2 size-4" />
            Nova Condição
          </Button>
        }
      />

      <Dialog open={mostrarForm} onClose={() => setMostrarForm(false)} size="lg" ariaLabel="Nova condição de pagamento">
        <CondicaoPagamentoForm aoSalvar={() => setMostrarForm(false)} />
      </Dialog>

      <Superficie>
        <ChipsFiltro opcoes={FILTROS} valor={filtro} aoTrocar={setFiltro} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="bg-white/[0.03] border-b border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
              <tr className="text-left text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                <th className="px-4 py-3 font-medium ui-uppercase">Descrição</th>
                <th className="px-4 py-3 font-medium ui-uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
              {!condicoes?.length ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
                    Nenhuma condição de pagamento cadastrada.
                  </td>
                </tr>
              ) : (
                condicoesOrdenadas.map((condicao) => (
                  <tr
                    key={condicao.id}
                    className={`transition-colors hover:bg-white/[0.03] ${condicao.ativo ? '' : 'opacity-60'}`}
                  >
                    <td className="px-4 py-3 font-medium ui-uppercase text-[var(--pnl-txt,#fff)]">
                      {condicao.descricao}
                      {!condicao.ativo && (
                        <Selo tom="neutro" className="ml-2">
                          Inativa
                        </Selo>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {condicao.ativo ? (
                          <IconButton
                            icon={EyeSlash}
                            label="Inativar"
                            onClick={() => inativar.mutate(condicao.id)}
                            disabled={inativar.isPending}
                          />
                        ) : (
                          <IconButton
                            icon={Eye}
                            label="Ativar"
                            onClick={() => ativar.mutate(condicao.id)}
                            disabled={ativar.isPending}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Superficie>
    </PageContainer>
  )
}
