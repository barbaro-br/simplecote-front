import { useState } from 'react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { dataHoraBr } from '@/shared/format/formatters'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useCatalogoGlobal, useCorrigirCatalogoGlobal, useMarcarRevisadoCatalogoGlobal, useMetricasCatalogoGlobal } from './backoffice.api'
import { MetricaCard } from './MetricaCard'
import type { CatalogoGlobalItem } from './backoffice.schema'

const TAMANHO_PAGINA = 30

function mensagemDeErro(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.'
}

// Linha de edição: nome/marca viram campo só quando o analista clica "Editar" —
// a lista inteira em modo de edição sempre seria ruído (change revisao-e-
// metrica-catalogo-global, produto/catalogo-global "Revisão do backoffice").
function LinhaCatalogoGlobal({ item }: { item: CatalogoGlobalItem }) {
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(item.nome)
  const [marca, setMarca] = useState(item.marca ?? '')
  const corrigir = useCorrigirCatalogoGlobal()
  const marcarRevisado = useMarcarRevisadoCatalogoGlobal()

  function salvar() {
    corrigir.mutate(
      { id: item.id, nome, marca: marca.trim() || null },
      {
        onSuccess: () => setEditando(false),
        onError: (e) => {
          if (e instanceof SessaoExpiradaError) return
          toast.error(mensagemDeErro(e))
        },
      },
    )
  }

  function cancelar() {
    setNome(item.nome)
    setMarca(item.marca ?? '')
    setEditando(false)
  }

  function revisar() {
    marcarRevisado.mutate(item.id, {
      onError: (e) => {
        if (e instanceof SessaoExpiradaError) return
        toast.error(mensagemDeErro(e))
      },
    })
  }

  if (editando) {
    return (
      <tr className="border-b border-border bg-muted/30">
        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.codigoBarras}</td>
        <td className="px-3 py-2">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} className="h-8 text-sm" />
        </td>
        <td className="px-3 py-2">
          <Input
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="Sem marca"
            className="h-8 text-sm"
          />
        </td>
        <td className="px-3 py-2 text-xs text-muted-foreground">{dataHoraBr(item.criadoEm)}</td>
        <td className="px-3 py-2 text-right">
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={cancelar} disabled={corrigir.isPending}>
              Cancelar
            </Button>
            <Button size="sm" onClick={salvar} disabled={corrigir.isPending || !nome.trim()}>
              {corrigir.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-border">
      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.codigoBarras}</td>
      <td className="px-3 py-2 text-sm">{item.nome}</td>
      <td className="px-3 py-2 text-sm text-muted-foreground">{item.marca ?? '—'}</td>
      <td className="px-3 py-2 text-xs text-muted-foreground">{dataHoraBr(item.criadoEm)}</td>
      <td className="px-3 py-2 text-right">
        <div className="flex justify-end items-center gap-2">
          {item.revisado ? (
            <span className="text-xs font-medium text-success">Revisado</span>
          ) : (
            <Button size="sm" variant="outline" onClick={revisar} disabled={marcarRevisado.isPending}>
              Marcar revisado
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setEditando(true)}>
            Editar
          </Button>
        </div>
      </td>
    </tr>
  )
}

export function CatalogoGlobalPage() {
  const [busca, setBusca] = useState('')
  const buscaDebounced = useDebounce(busca, 300)
  const [apenasNaoRevisados, setApenasNaoRevisados] = useState(false)
  const [pagina, setPagina] = useState(0)

  const { data: metricas } = useMetricasCatalogoGlobal()
  const { data, isLoading, error } = useCatalogoGlobal({
    q: buscaDebounced,
    apenasNaoRevisados,
    pagina,
    tamanho: TAMANHO_PAGINA,
  })

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / TAMANHO_PAGINA)) : 1

  return (
    <PageContainer maxWidth="full" className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight ui-uppercase">Catálogo Global</h1>
        <p className="text-sm text-muted-foreground">
          Referência compartilhada entre todas as lojas (código de barras → nome). Revise entradas recentes e
          corrija o que estiver errado.
        </p>
      </div>

      {metricas && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricaCard rotulo="Produtos no catálogo" valor={metricas.totalProdutos.toLocaleString('pt-BR')} />
          <MetricaCard rotulo="Reaproveitamentos" valor={metricas.totalReaproveitamentos.toLocaleString('pt-BR')} />
          <MetricaCard
            rotulo="Lojas que reaproveitaram"
            valor={metricas.compradoresQueReaproveitaram.toLocaleString('pt-BR')}
          />
          <MetricaCard rotulo="Aguardando revisão" valor={metricas.naoRevisados.toLocaleString('pt-BR')} />
        </div>
      )}

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPagina(0)
            }}
            placeholder="Buscar por nome ou código de barras…"
            className="max-w-xs"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={apenasNaoRevisados}
              onChange={(e) => {
                setApenasNaoRevisados(e.target.checked)
                setPagina(0)
              }}
            />
            Só não revisados
          </label>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {error && <p className="text-sm text-destructive">Erro ao carregar: {mensagemDeErro(error)}</p>}

        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Código de barras</th>
                    <th className="px-3 py-2 font-medium">Nome</th>
                    <th className="px-3 py-2 font-medium">Marca</th>
                    <th className="px-3 py-2 font-medium">Criado em</th>
                    <th className="px-3 py-2 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itens.map((item) => (
                    <LinhaCatalogoGlobal key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
              {data.itens.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhum item encontrado.</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {data.total.toLocaleString('pt-BR')} {data.total === 1 ? 'item' : 'itens'} · página {pagina + 1} de{' '}
                {totalPaginas}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagina + 1 >= totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </PageContainer>
  )
}
