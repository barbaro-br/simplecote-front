import { memo, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { moeda } from '@/shared/format/formatters'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import type { CelulaGrid, GridAoVivo, ItemGrid } from './cotacoes.schema'
import { useCorrigirLance } from './cotacoes.api'
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
}

// `memo` por linha (spec.md §14): o poll não deve re-renderizar linhas iguais.
const LinhaItem = memo(function LinhaItem({ item, colunas, aoCorrigir }: LinhaProps) {
  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="px-4 py-2 whitespace-nowrap">
        <UltimaCompraPopover item={item} />
      </td>
      {colunas.map((col) => {
        const celula = item.precos.find((c) => c.participanteId === col.participanteId)
        if (!celula) {
          return (
            <td key={col.participanteId} className="px-4 py-2 text-muted-foreground">
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
          <td key={col.participanteId} className="px-1 py-1">
            <button
              type="button"
              onClick={() => aoCorrigir(item, celula)}
              aria-label={`Corrigir lance de ${col.empresa} para ${item.nome}`}
              className={`w-full rounded px-2 py-1 text-left transition-colors hover:bg-muted ${
                ehMenor ? 'bg-success/10 text-success font-medium' : ''
              }`}
            >
              <span className="block text-xs text-muted-foreground">{rotuloStatus(celula.status)}</span>
              {celula.status === 'COTADO' && celula.preco != null ? (
                <span className="block tabular-nums">
                  {moeda(celula.preco)}
                  {celula.precoUnitario != null && (
                    <span className="text-xs text-muted-foreground"> · {moeda(celula.precoUnitario)}/un</span>
                  )}
                </span>
              ) : (
                <span className="block text-muted-foreground">—</span>
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
  const [alvo, setAlvo] = useState<Alvo | null>(null)
  const [preco, setPreco] = useState('')
  const [naoCotado, setNaoCotado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

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
    return <p className="text-sm text-muted-foreground">Nenhum item na cotação.</p>
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Item</th>
              {colunas.map((c) => (
                <th key={c.participanteId} className="px-4 py-2 font-medium">
                  {c.empresa}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {grade.itens.map((item) => (
              <LinhaItem
                key={item.itemCotacaoId}
                item={item}
                colunas={colunas}
                aoCorrigir={abrirCorrecao}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={alvo != null} onClose={() => setAlvo(null)} title="Corrigir lance">
        {alvo && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {alvo.celula.empresa} — {alvo.item.nome}
            </p>
            <div>
              <label htmlFor="corr-preco" className="text-xs text-muted-foreground">
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
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={naoCotado}
                onChange={(e) => setNaoCotado(e.target.checked)}
              />
              Não cotado
            </label>
            {erro && (
              <p role="alert" className="text-sm text-destructive">
                {erro}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAlvo(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={salvar} disabled={corrigir.isPending}>
                {corrigir.isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}
