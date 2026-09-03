import { memo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import type { CelulaGrid, GridAoVivo, ItemGrid } from './cotacoes.schema'
import { useCorrigirLance, useAtualizarQuantidadeItem } from './cotacoes.api'
import { UltimaCompraPopover } from './UltimaCompraPopover'

type Coluna = { participanteId: string; empresa: string }

// Colunas = Empresas convidadas, derivadas das células (o back manda a mesma
// lista de participantes em todos os itens).
function colunasDe(grade: GridAoVivo): Coluna[] {
  const map = new Map<string, Coluna>()
  for (const item of grade.itens) {
    for (const c of item.precos) {
      if (!map.has(c.participanteId)) {
        map.set(c.participanteId, { participanteId: c.participanteId, empresa: c.empresa })
      }
    }
  }
  return [...map.values()]
}

function rotuloStatus(status: CelulaGrid['status']): string {
  if (status === 'COTADO') return 'Cotado'
  if (status === 'NAO_COTADO') return 'Não cotou'
  return 'Pendente'
}

type LinhaProps = {
  item: ItemGrid
  colunas: Coluna[]
  aoCorrigir: (item: ItemGrid, celula: CelulaGrid) => void
  quantidadeEditavel: boolean
  quantidadePendente: boolean
  aoAtualizarQuantidade: (itemId: string, quantidade: number) => void
}

// `memo` por linha (spec.md §14): o poll não deve re-renderizar linhas iguais.
const LinhaItem = memo(function LinhaItem({
  item,
  colunas,
  aoCorrigir,
  quantidadeEditavel,
  quantidadePendente,
  aoAtualizarQuantidade,
}: LinhaProps) {
  return (
    <tr className="group transition-colors hover:bg-muted/40">
      <td className="sticky left-0 z-10 bg-background group-hover:bg-muted/40 px-4 py-2 border-r shadow-[1px_0_0_0_var(--border)]">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <UltimaCompraPopover item={item} />
            <div className="text-[11px] text-muted-foreground">
              {item.unidade} · {item.quantidadePorEmbalagem} un
            </div>
          </div>
          {quantidadeEditavel ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Diminuir quantidade de ${item.nome}`}
                className="size-6 h-6 w-6"
                onClick={() => aoAtualizarQuantidade(item.itemCotacaoId, item.quantidadeSolicitada - 1)}
                disabled={quantidadePendente || item.quantidadeSolicitada <= 1}
              >
                <Minus className="size-3" />
              </Button>
              <span className="min-w-6 text-center text-xs font-medium tabular-nums">
                {item.quantidadeSolicitada}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Aumentar quantidade de ${item.nome}`}
                className="size-6 h-6 w-6"
                onClick={() => aoAtualizarQuantidade(item.itemCotacaoId, item.quantidadeSolicitada + 1)}
                disabled={quantidadePendente}
              >
                <Plus className="size-3" />
              </Button>
            </div>
          ) : (
            <span className="shrink-0 text-xs text-muted-foreground">qtd {item.quantidadeSolicitada}</span>
          )}
        </div>
      </td>
      {colunas.map((col) => {
        const celula = item.precos.find((c) => c.participanteId === col.participanteId)
        if (!celula) {
          return (
            <td key={col.participanteId} className="px-4 py-3 text-muted-foreground text-center">
              —
            </td>
          )
        }
        const ehMenor =
          celula.status === 'COTADO' &&
          celula.precoUnitario != null &&
          item.menorPrecoUnitario != null &&
          celula.precoUnitario === item.menorPrecoUnitario
        return (
          <td key={col.participanteId} className="px-2 py-1 min-w-[140px]">
            <button
              type="button"
              onClick={() => aoCorrigir(item, celula)}
              aria-label={`Corrigir lance de ${col.empresa} para ${item.nome}`}
              className={`w-full h-full min-h-[2.5rem] rounded-md px-2 py-1 text-right transition-colors border hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                ehMenor 
                  ? 'bg-success/5 border-success/20 ring-1 ring-success/20' 
                  : 'bg-card border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-end gap-1.5 mb-0.5">
                {celula.status === 'COTADO' ? (
                  <span className="text-[11px] font-medium uppercase tracking-wider text-primary">
                    {rotuloStatus(celula.status)}
                  </span>
                ) : (
                  <span className="rounded-full bg-muted text-muted-foreground text-[10px] font-medium uppercase tracking-wider px-2 py-0.5">
                    {rotuloStatus(celula.status)}
                  </span>
                )}
                {ehMenor && <span className="text-[10px] font-bold bg-success text-success-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Menor</span>}
              </div>
              
              {celula.status === 'COTADO' && celula.preco != null ? (
                <div className="flex flex-col">
                  <span className={`tabular-nums font-semibold ${ehMenor ? 'text-success' : 'text-foreground'}`}>
                    {moeda(celula.preco)}
                  </span>
                  {celula.precoUnitario != null && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {moeda(celula.precoUnitario)} / un
                    </span>
                  )}
                </div>
              ) : (
                <span className="block text-muted-foreground/50 text-sm">—</span>
              )}
            </button>
          </td>
        )
      })}
    </tr>
  )
})

type Alvo = { item: ItemGrid; celula: CelulaGrid }

export function GradeAoVivoTabela({ cotacaoId, grade }: { cotacaoId: string; grade: GridAoVivo }) {
  const corrigir = useCorrigirLance(cotacaoId)
  const atualizarQuantidade = useAtualizarQuantidadeItem(cotacaoId)
  const [alvo, setAlvo] = useState<Alvo | null>(null)
  const [preco, setPreco] = useState('')
  const [naoCotado, setNaoCotado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [erroQuantidade, setErroQuantidade] = useState<string | null>(null)

  const quantidadeEditavel = grade.status === 'ABERTA' || grade.status === 'ENCERRADA'

  function aoAtualizarQuantidade(itemId: string, quantidade: number) {
    setErroQuantidade(null)
    atualizarQuantidade.mutate(
      { itemId, quantidade },
      {
        onError: (e) => {
          if (e instanceof SessaoExpiradaError) return
          setErroQuantidade(
            e instanceof ApiError ? e.message : 'Não foi possível alterar a quantidade.',
          )
        },
      },
    )
  }

  const colunas = colunasDe(grade)

  function abrirCorrecao(item: ItemGrid, celula: CelulaGrid) {
    setAlvo({ item, celula })
    setPreco(celula.preco != null ? String(celula.preco) : '')
    setNaoCotado(celula.status === 'NAO_COTADO')
    setErro(null)
  }

  async function salvar() {
    if (!alvo) return
    setErro(null)
    try {
      await corrigir.mutateAsync({
        participanteId: alvo.celula.participanteId,
        itemId: alvo.item.itemCotacaoId,
        ...(naoCotado ? { naoCotado: true } : { preco: Number(preco) }),
      })
      setAlvo(null)
    } catch (e) {
      if (e instanceof SessaoExpiradaError) return
      setErro(e instanceof ApiError ? e.message : 'Erro ao corrigir o lance.')
    }
  }

  if (!grade.itens.length) {
    return <p className="text-sm text-muted-foreground p-4 rounded-md border border-dashed text-center">Nenhum item na cotação.</p>
  }

  return (
    <>
      {erroQuantidade && (
        <p role="alert" className="mb-3 text-sm text-destructive font-medium">
          {erroQuantidade}
        </p>
      )}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="sticky top-0 left-0 z-30 bg-muted px-4 py-2 font-medium border-b border-r shadow-[1px_0_0_0_var(--border)]">
                  Item
                </th>
                {colunas.map((c) => (
                  <th
                    key={c.participanteId}
                    className="sticky top-0 z-20 bg-muted px-4 py-2 font-medium min-w-[140px] border-b text-right"
                  >
                    {c.empresa}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {grade.itens.map((item) => (
                <LinhaItem
                  key={item.itemCotacaoId}
                  item={item}
                  colunas={colunas}
                  aoCorrigir={abrirCorrecao}
                  quantidadeEditavel={quantidadeEditavel}
                  quantidadePendente={atualizarQuantidade.isPending}
                  aoAtualizarQuantidade={aoAtualizarQuantidade}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={alvo != null} onClose={() => setAlvo(null)} title="Corrigir lance">
        {alvo && (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">{alvo.celula.empresa}</p>
              <p className="text-sm text-muted-foreground">{alvo.item.nome}</p>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="corr-preco" className="text-sm font-medium">
                Preço da embalagem
              </label>
              <Input
                id="corr-preco"
                type="number"
                min={0}
                step="0.01"
                value={preco}
                disabled={naoCotado}
                onChange={(e) => setPreco(e.target.value)}
                className="text-lg h-12"
              />
            </div>
            
            <label className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={naoCotado}
                onChange={(e) => setNaoCotado(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary w-4 h-4"
              />
              Marcar como "Não cotado"
            </label>
            
            {erro && (
              <p role="alert" className="text-sm text-destructive font-medium">
                {erro}
              </p>
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setAlvo(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={salvar} disabled={corrigir.isPending}>
                {corrigir.isPending ? 'Salvando…' : 'Salvar correção'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}
