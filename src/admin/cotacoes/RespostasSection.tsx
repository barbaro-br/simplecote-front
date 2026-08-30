import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import type { CelulaGrid } from './cotacoes.schema'
import { useAoVivo, useCorrigirLance, useParticipantes, useReabrirParticipante } from './cotacoes.api'

function textoCelula(celula: CelulaGrid | undefined): string {
  if (!celula || celula.status === 'PENDENTE') return '—'
  if (celula.status === 'NAO_COTADO') return 'não cotou'
  return celula.preco != null ? moeda(celula.preco) : '—'
}

type Edicao = { itemId: string; participanteId: string }

export function RespostasSection({ cotacaoId }: { cotacaoId: string }) {
  const grid = useAoVivo(cotacaoId)
  const participantes = useParticipantes(cotacaoId)
  const corrigir = useCorrigirLance(cotacaoId)
  const reabrir = useReabrirParticipante(cotacaoId)
  const [editando, setEditando] = useState<Edicao | null>(null)
  const [preco, setPreco] = useState('')
  const [naoCotado, setNaoCotado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  if (grid.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Respostas</CardTitle>
        </CardHeader>
        <div className="p-4 text-sm text-muted-foreground">Carregando respostas…</div>
      </Card>
    )
  }

  if (grid.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Respostas</CardTitle>
        </CardHeader>
        <div className="p-4 text-sm text-destructive">Erro ao carregar as respostas: {grid.error.message}</div>
      </Card>
    )
  }

  if (!grid.data) return null

  // Colunas = participantes; se a lista ainda não carregou, deriva das células da grade.
  const colunas =
    participantes.data?.map((p) => ({
      participanteId: p.participanteId,
      nome: p.empresaNome,
      respondido: p.participanteStatus === 'RESPONDIDO',
    })) ??
    Array.from(
      new Map(
        grid.data.itens
          .flatMap((i) => i.precos)
          .map((c) => [c.participanteId, { participanteId: c.participanteId, nome: c.empresa, respondido: false }]),
      ).values(),
    )

  function abrirEdicao(itemId: string, participanteId: string, celula: CelulaGrid | undefined) {
    setEditando({ itemId, participanteId })
    setPreco(celula?.preco != null ? String(celula.preco) : '')
    setNaoCotado(celula?.status === 'NAO_COTADO')
    setErro(null)
  }

  async function salvar() {
    if (!editando) return
    setErro(null)
    try {
      await corrigir.mutateAsync({
        participanteId: editando.participanteId,
        itemId: editando.itemId,
        ...(naoCotado ? { naoCotado: true } : { preco: Number(preco) }),
      })
      setEditando(null)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Erro ao corrigir o lance.')
    }
  }

  if (!grid.data.itens.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Respostas</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 text-sm text-muted-foreground">Nenhum item na cotação.</div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Respostas</CardTitle>
          <span className="text-sm text-muted-foreground">
            {grid.data.respondidos}/{grid.data.totalParticipantes} responderam
          </span>
        </div>
      </CardHeader>

      {erro && (
        <div role="alert" className="px-4 pb-4 text-sm text-destructive">
          {erro}
        </div>
      )}

      <div className="overflow-x-auto border-t">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Item</th>
              {colunas.map((c) => (
                <th key={c.participanteId} className="px-4 py-2 font-medium">
                  <div className="flex flex-col gap-1">
                    <span>{c.nome}</span>
                    {c.respondido && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-xs -ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => reabrir.mutate(c.participanteId)}
                        disabled={reabrir.isPending}
                      >
                        Reabrir resposta
                      </Button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {grid.data.itens.map((item) => (
              <tr key={item.itemCotacaoId} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-2 font-medium">{item.nome}</td>
                {colunas.map((col) => {
                  const celula = item.precos.find((c) => c.participanteId === col.participanteId)
                  const emEdicao =
                    editando?.itemId === item.itemCotacaoId &&
                    editando?.participanteId === col.participanteId
                  return (
                    <td key={col.participanteId} className="px-4 py-2">
                      {emEdicao ? (
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={preco}
                            disabled={naoCotado}
                            onChange={(e) => setPreco(e.target.value)}
                            aria-label="Preço da embalagem"
                            className="h-8 text-sm"
                          />
                          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={naoCotado}
                              onChange={(e) => setNaoCotado(e.target.checked)}
                              className="rounded border-input text-primary focus:ring-primary"
                            />
                            não cotado
                          </label>
                          <div className="flex gap-1 mt-1">
                            <Button size="sm" className="h-6 px-2 text-xs flex-1" onClick={salvar} disabled={corrigir.isPending}>
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs flex-1 text-muted-foreground hover:text-foreground hover:bg-muted"
                              onClick={() => setEditando(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="tabular-nums text-primary hover:underline hover:text-primary/80 transition-colors text-left"
                          onClick={() => abrirEdicao(item.itemCotacaoId, col.participanteId, celula)}
                        >
                          {textoCelula(celula)}
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
