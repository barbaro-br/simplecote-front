import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui/card'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { moeda } from '@/shared/format/formatters'
import { useMetricasCatalogoGlobal, useResumoSaas } from './backoffice.api'
import { MetricaCard } from './MetricaCard'
import type { FunilAtivacao } from './backoffice.schema'

const DEGRAUS: { rotulo: string; chave: keyof FunilAtivacao }[] = [
  { rotulo: 'Cadastraram', chave: 'cadastraram' },
  { rotulo: 'Verificaram e-mail', chave: 'verificaram' },
  { rotulo: 'Criaram 1ª cotação', chave: 'criaramCotacao' },
  { rotulo: 'Apuraram 1ª cotação', chave: 'apuraram' },
]

export function ResumoPage() {
  const { data, isLoading, error } = useResumoSaas()
  const { data: metricasCatalogoGlobal } = useMetricasCatalogoGlobal()

  if (isLoading) {
    return (
      <PageContainer maxWidth="full" className="space-y-6">
        <p className="p-6 text-muted-foreground">Carregando resumo…</p>
      </PageContainer>
    )
  }

  if (error || !data) {
    return (
      <PageContainer maxWidth="full" className="space-y-6">
        <p className="p-6 text-destructive">Erro ao carregar resumo: {error?.message}</p>
      </PageContainer>
    )
  }

  const { lojas, lojasAtivas30d, cotacoesNoMes, gmvTotal, cadastros30d, funil } = data
  const maxCadastros = Math.max(1, ...cadastros30d.map((p) => p.qtd))
  const maxFunil = Math.max(1, funil.cadastraram)

  return (
    <PageContainer maxWidth="full" className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight ui-uppercase">Resumo</h1>
          <p className="text-sm text-muted-foreground">Panorama do SimpleCote.</p>
        </div>
        <Link to="/backoffice/lojas" className="text-sm font-medium text-primary hover:underline">
          Ver todas as lojas →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricaCard
          rotulo="Lojas"
          valor={lojas.total}
          extra={
            <div className="flex flex-wrap gap-1">
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Teste · {lojas.emTeste}
              </span>
              <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                Prazo vencido · {lojas.prazoVencido}
              </span>
              <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                Suspensas · {lojas.suspensas}
              </span>
            </div>
          }
        />
        <MetricaCard rotulo="Lojas ativas (30d)" valor={lojasAtivas30d} />
        <MetricaCard rotulo="Cotações no mês" valor={cotacoesNoMes} />
        <MetricaCard rotulo="GMV total" valor={moeda(gmvTotal)} />
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold ui-uppercase">Cadastros (últimos 30 dias)</h2>
        {!cadastros30d.length ? (
          <p className="text-sm text-muted-foreground">Sem cadastros no período.</p>
        ) : (
          <div className="flex h-40 items-end gap-1">
            {cadastros30d.map((p) => (
              <div
                key={p.data}
                title={`${p.data}: ${p.qtd}`}
                className="flex-1 rounded-t-sm bg-primary/70"
                style={{ height: `${(p.qtd / maxCadastros) * 100}%` }}
              />
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold ui-uppercase">Catálogo global</h2>
          <Link to="/backoffice/catalogo-global" className="text-sm font-medium text-primary hover:underline">
            Ver e revisar →
          </Link>
        </div>
        {metricasCatalogoGlobal ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricaCard rotulo="Produtos no catálogo" valor={metricasCatalogoGlobal.totalProdutos.toLocaleString('pt-BR')} />
            <MetricaCard rotulo="Reaproveitamentos" valor={metricasCatalogoGlobal.totalReaproveitamentos.toLocaleString('pt-BR')} />
            <MetricaCard
              rotulo="Lojas que reaproveitaram"
              valor={metricasCatalogoGlobal.compradoresQueReaproveitaram.toLocaleString('pt-BR')}
            />
            <MetricaCard rotulo="Aguardando revisão" valor={metricasCatalogoGlobal.naoRevisados.toLocaleString('pt-BR')} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold ui-uppercase">Funil de ativação</h2>
        <div className="space-y-3">
          {DEGRAUS.map((d) => (
            <div key={d.chave} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-sm">{d.rotulo}</span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded bg-primary/70"
                  style={{ width: `${(funil[d.chave] / maxFunil) * 100}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-sm text-muted-foreground">{funil[d.chave]}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  )
}
