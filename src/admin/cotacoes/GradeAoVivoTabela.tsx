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
import { useHighlightOnUpdate } from '@/shared/hooks/useHighlightOnUpdate'

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

function CampoQuantidade({
  item,
  pendente,
  aoAtualizarQuantidade,
}: {
  item: ItemGrid
  pendente: boolean
  aoAtualizarQuantidade: (itemId: string, quantidade: number) => void
}) {
  const [valor, setValor] = useState(String(item.quantidadeSolicitada))
  const [focado, setFocado] = useState(false)

  // Sincroniza com fonte externa (SSE/query) apenas quando o campo não está
  // em edição, para não sobrescrever o que o Comprador está digitando.
  const [quantidadeAnterior, setQuantidadeAnterior] = useState(item.quantidadeSolicitada)
  if (item.quantidadeSolicitada !== quantidadeAnterior) {
    setQuantidadeAnterior(item.quantidadeSolicitada)
    if (!focado) {
      setValor(String(item.quantidadeSolicitada))
    }
  }

  function confirmar() {
    const v = parseInt(valor, 10)
    if (Number.isInteger(v) && v >= 1) {
      if (v !== item.quantidadeSolicitada) {
        aoAtualizarQuantidade(item.itemCotacaoId, v)
      } else {
        setValor(String(item.quantidadeSolicitada))
      }
    } else {
      setValor(String(item.quantidadeSolicitada))
    }
  }

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      value={valor}
      disabled={pendente}
      onChange={(e) => setValor(e.target.value)}
      onFocus={() => setFocado(true)}
      onBlur={() => {
        setFocado(false)
        confirmar()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur()
        }
      }}
      aria-label={`Quantidade de ${item.nome}`}
      className="h-7 w-11 rounded-r-none rounded-l border border-input bg-transparent px-1 text-center text-sm font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}

type CelulaPrecoProps = {
  item: ItemGrid
  celula: CelulaGrid
  ehMenor: boolean
  aoCorrigir: (item: ItemGrid, celula: CelulaGrid) => void
}

/**
 * Célula de preço isolada em `memo` (design da change melhoria-ux-performance-grid):
 * o pulso de destaque fica confinado aqui — o timer de ~800ms re-renderiza só a
 * célula, nunca a tabela inteira. O flash dispara quando o preço muda (novo
 * lance/correção, inclusive entrar ou sair de COTADO) e quando a célula assume
 * a liderança de menor preço.
 */
const CelulaPreco = memo(function CelulaPreco({ item, celula, ehMenor, aoCorrigir }: CelulaPrecoProps) {
  const pulsoPreco = useHighlightOnUpdate(celula.preco)
  const pulsoLideranca = useHighlightOnUpdate(ehMenor) && ehMenor
  const destacado = pulsoPreco || pulsoLideranca

  return (
    <td className="px-2 py-1 min-w-[140px] border-b border-l shadow-[0_1px_0_0_var(--border)] bg-card group-hover:bg-muted/40">
      <button
        type="button"
        onClick={() => aoCorrigir(item, celula)}
        aria-label={`Corrigir lance de ${celula.empresa} para ${item.nome}`}
        className={`w-full h-full min-h-[2rem] rounded-md px-2 py-1 text-right transition-colors duration-700 border hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
          destacado
            ? 'bg-green-100/50 dark:bg-green-900/40 border-green-200'
            : ehMenor
              ? 'bg-success/5 border-success/20 ring-1 ring-success/20'
              : 'bg-card border-border hover:bg-muted/50'
        }`}
      >
        {celula.status === 'COTADO' && celula.preco != null ? (
          <span className="tabular-nums flex flex-col items-end leading-tight">
            <span className={`font-semibold whitespace-nowrap ${ehMenor ? 'text-success' : 'text-foreground'}`}>
              {moeda(celula.preco)}
            </span>
            {celula.precoUnitario != null && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">{moeda(celula.precoUnitario)} / un</span>
            )}
          </span>
        ) : (
          <span className="rounded-full bg-muted text-muted-foreground text-[10px] font-medium uppercase tracking-wider px-2 py-0.5">
            {rotuloStatus(celula.status)}
          </span>
        )}
      </button>
    </td>
  )
})

type LinhaProps = {
  item: ItemGrid
  colunas: Coluna[]
  aoCorrigir: (item: ItemGrid, celula: CelulaGrid) => void
  quantidadeEditavel: boolean
  quantidadePendente: boolean
  aoAtualizarQuantidade: (itemId: string, quantidade: number) => void
  destacarMenorPreco: boolean
}

// `memo` por linha (spec.md §14): o poll não deve re-renderizar linhas iguais.
const LinhaItem = memo(function LinhaItem({
  item,
  colunas,
  aoCorrigir,
  quantidadeEditavel,
  quantidadePendente,
  aoAtualizarQuantidade,
  destacarMenorPreco,
}: LinhaProps) {
  return (
    <tr className="group transition-colors hover:bg-muted/40">
      <td className="sticky left-0 z-10 bg-background group-hover:bg-muted/40 px-4 py-2 border-b border-r shadow-[1px_1px_0_0_var(--border)] w-[340px] min-w-[340px] max-w-[340px]">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <UltimaCompraPopover item={item} />
            <div className="text-[11px] text-muted-foreground">
              {item.unidade} · {item.quantidadePorEmbalagem} un
            </div>
          </div>
          {quantidadeEditavel ? (
            <div className="flex shrink-0 items-center gap-0.5">
              <CampoQuantidade item={item} pendente={quantidadePendente} aoAtualizarQuantidade={aoAtualizarQuantidade} />
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Aumentar quantidade de ${item.nome}`}
                  className="h-3.5 w-5 min-w-0 rounded-b-none p-0"
                  onClick={() => aoAtualizarQuantidade(item.itemCotacaoId, item.quantidadeSolicitada + 1)}
                  disabled={quantidadePendente}
                >
                  <Plus className="size-2" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Diminuir quantidade de ${item.nome}`}
                  className="-mt-px h-3.5 w-5 min-w-0 rounded-t-none p-0"
                  onClick={() => aoAtualizarQuantidade(item.itemCotacaoId, item.quantidadeSolicitada - 1)}
                  disabled={quantidadePendente || item.quantidadeSolicitada <= 1}
                >
                  <Minus className="size-2" />
                </Button>
              </div>
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
            <td key={col.participanteId} className="px-4 py-3 text-muted-foreground text-center border-b border-l shadow-[0_1px_0_0_var(--border)] bg-card group-hover:bg-muted/40">
              —
            </td>
          )
        }
        const ehMenor =
          destacarMenorPreco &&
          celula.status === 'COTADO' &&
          celula.precoUnitario != null &&
          item.menorPrecoUnitario != null &&
          celula.precoUnitario === item.menorPrecoUnitario
        return (
          <CelulaPreco
            key={col.participanteId}
            item={item}
            celula={celula}
            ehMenor={ehMenor}
            aoCorrigir={aoCorrigir}
          />
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

  // Destaque do menor preço é sempre ligado por padrão
  const destacarMenorPreco = true

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
      <div className="rounded-md border bg-card text-card-foreground shadow-sm flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="sticky top-0 left-0 z-30 bg-muted px-4 py-2 font-medium border-b border-r shadow-[1px_0_0_0_var(--border)] whitespace-nowrap w-[340px] min-w-[340px] max-w-[340px]">
                  Item
                </th>
                {colunas.map((c) => (
                  <th
                    key={c.participanteId}
                    className="sticky top-0 z-20 bg-muted px-2 py-2 font-medium min-w-[140px] border-b border-l shadow-[0_1px_0_0_var(--border)] text-right whitespace-nowrap"
                  >
                    {c.empresa}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grade.itens.map((item) => (
                <LinhaItem
                  key={item.itemCotacaoId}
                  item={item}
                  colunas={colunas}
                  aoCorrigir={abrirCorrecao}
                  quantidadeEditavel={quantidadeEditavel}
                  quantidadePendente={atualizarQuantidade.isPending}
                  aoAtualizarQuantidade={aoAtualizarQuantidade}
                  destacarMenorPreco={destacarMenorPreco}
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
