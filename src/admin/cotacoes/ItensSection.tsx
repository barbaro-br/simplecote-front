import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Dialog } from '@/shared/components/ui/dialog'
import { BotaoIcone } from '@/shared/ui'
import { AdicionarItemModal } from './AdicionarItemModal'
import { Package, Trash, Plus, Minus, PencilSimple } from '@phosphor-icons/react'
import { useProdutos } from '@/admin/produtos/produtos.api'
import { ProdutoForm } from '@/admin/produtos/ProdutoForm'
import { type Produto } from '@/admin/produtos/produtos.schema'
import { type ItemCotacao } from './cotacoes.schema'
import { useRemoverItem, useAtualizarQuantidadeItem } from './cotacoes.api'
import { useInsightProdutos } from '../analise/analise.api'
import { UltimaCompraPopover } from './UltimaCompraPopover'

type Props = {
  cotacaoId: string
  itens: ItemCotacao[]
  /** Só em RASCUNHO os controles de adicionar/remover aparecem. */
  editavel: boolean
}

function Stepper({
  value,
  onChange,
  disabled
}: {
  value: number;
  onChange: (val: number) => void;
  disabled: boolean
}) {
  const [localVal, setLocalVal] = useState<number | ''>(value)
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setLocalVal(value)
  }

  const dec = () => {
    if (typeof localVal === 'number' && localVal > 1) {
      const next = localVal - 1
      setLocalVal(next)
      onChange(next)
    }
  }

  const inc = () => {
    const curr = typeof localVal === 'number' ? localVal : 0
    const next = curr + 1
    setLocalVal(next)
    onChange(next)
  }

  const handleBlur = () => {
    if (localVal === '' || localVal < 1) {
      setLocalVal(value)
    } else if (localVal !== value) {
      onChange(localVal)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <BotaoIcone
        type="button"
        aria-label="Diminuir quantidade"
        className="size-7 rounded-full"
        onClick={dec}
        disabled={disabled || (typeof localVal === 'number' && localVal <= 1)}
      >
        <Minus className="size-3" />
      </BotaoIcone>
      <Input
        type="number"
        min={1}
        className="h-7 w-12 text-center text-sm px-1 hide-arrows font-medium tabular-nums"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
        onBlur={handleBlur}
        disabled={disabled}
      />
      <BotaoIcone
        type="button"
        aria-label="Aumentar quantidade"
        className="size-7 rounded-full"
        onClick={inc}
        disabled={disabled}
      >
        <Plus className="size-3" />
      </BotaoIcone>
    </div>
  )
}

export function ItensSection({ cotacaoId, itens, editavel }: Props) {
  const { data: produtos } = useProdutos()
  
  
  const remover = useRemoverItem(cotacaoId)
  const atualizar = useAtualizarQuantidadeItem(cotacaoId)

  const [formAberto, setFormAberto] = useState(false)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [produtoParaEditar, setProdutoParaEditar] = useState<Produto | undefined>(undefined)
  
  const ids = itens.map(i => i.produtoId)
  const query = useInsightProdutos(ids)

  function fecharForm() {
    setFormAberto(false)
  }

  // O modal de cadastro/edição de produto abre EMPILHADO sobre o de itens — sem
  // fechar `formAberto`. Fechar e reabrir faria o AdicionarItemModal zerar os
  // `drafts` (seleção ainda não salva) na transição de `open`, e o usuário
  // perderia todos os produtos que tinha marcado.
  function abrirCadastro() {
    setCadastroAberto(true)
  }

  function abrirEdicao(produto: Produto) {
    setProdutoParaEditar(produto)
    setCadastroAberto(true)
  }

  function aoCadastrarProduto() {
    setCadastroAberto(false)
    setProdutoParaEditar(undefined)
  }

  return (
    <div className="border-t border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
      {editavel && (
        <div className="flex items-center justify-between border-b border-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))] px-4 py-2.5 sm:px-5">
          <span className="text-[11px] uppercase tracking-wide text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
            Itens
          </span>
          <Button type="button" onClick={() => setFormAberto(true)} size="sm">
            Adicionar item
          </Button>
        </div>
      )}

      <AdicionarItemModal
        cotacaoId={cotacaoId}
        itens={itens}
        open={editavel && formAberto}
        onClose={fecharForm}
        aoCadastrarProduto={abrirCadastro}
        aoEditarProduto={abrirEdicao}
      />

      {/* 2º modal: cadastro/edição de Produto sem sair da montagem da Cotação. */}
      <Dialog
        open={editavel && cadastroAberto}
        onClose={() => setCadastroAberto(false)}
        size="lg"
        ariaLabel="Cadastrar novo produto"
      >
        <ProdutoForm aoSalvar={aoCadastrarProduto} produtoParaEditar={produtoParaEditar} />
      </Dialog>

      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--pnl-txt-3,rgba(255,255,255,0.45))] [&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:bg-[var(--pnl-superficie,#12263f)]">
              <th className="px-4 py-2 font-medium ui-uppercase">Produto</th>
              <th className="px-4 py-2 font-medium ui-uppercase">Embalagem</th>
              <th className="px-4 py-2 font-medium ui-uppercase">Qtd. solicitada</th>
              {editavel && <th className="px-4 py-2 font-medium ui-uppercase text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--pnl-borda-fraca,rgba(255,255,255,0.07))]">
            {!itens.length ? (
              <tr>
                <td colSpan={editavel ? 4 : 3} className="px-4 py-8 text-center text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="size-8 text-[var(--pnl-txt-4,rgba(255,255,255,0.3))]" />
                    <p>Nenhum item adicionado.</p>
                  </div>
                </td>
              </tr>
            ) : (
              itens.map((item) => {
                const insight = query.data?.[item.produtoId] ?? null
                
                const liveProd = (produtos || []).find(p => p.id === item.produtoId);
                const uRaw = (editavel && liveProd) ? liveProd.unidade : item.unidadeSnapshot;
                const qt = (editavel && liveProd) ? liveProd.quantidadePorEmbalagem : item.quantidadePorEmbalagemSnapshot;
                const tipoUnidade = uRaw.toUpperCase() === 'UNIDADE' ? 'UNITÁRIO' : uRaw.toUpperCase();
                
                const temCom = tipoUnidade.includes("COM"); 
                const formatoEmbalagem = qt === 1 ? `${tipoUnidade} ${qt}` : `${tipoUnidade}${temCom ? "" : " COM"} ${qt}`;

                return (
                  <tr key={item.id} className="transition-colors hover:bg-white/[0.03] group">
                    <td className="px-4 py-2 font-medium text-[var(--pnl-txt,#fff)]">
                      <UltimaCompraPopover item={{ nome: item.nomeSnapshot } as any} insight={insight} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-white/[0.06] px-2 py-1 text-[11px] font-semibold tracking-wide text-[var(--pnl-txt-2,rgba(255,255,255,0.7))] ring-1 ring-inset ring-[var(--pnl-borda,rgba(255,255,255,0.1))]">
                        {formatoEmbalagem}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editavel ? (
                        <Stepper
                          value={item.quantidadeSolicitada}
                          onChange={(v) => atualizar.mutate({ itemId: item.id, quantidade: v })}
                          disabled={atualizar.isPending}
                        />
                      ) : (
                        item.quantidadeSolicitada
                      )}
                    </td>
                    {editavel && (
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Lápis: abre o cadastro do produto (embalagem +
                              qtd. por embalagem). Em RASCUNHO a coluna já mostra
                              o valor vivo do catálogo, então corrigir o produto
                              conserta a cotação. Sem `liveProd` (produto sumiu
                              do catálogo) não há o que editar. */}
                          {liveProd && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirEdicao(liveProd)}
                              aria-label={`Editar embalagem de ${item.nomeSnapshot}`}
                              title="Editar embalagem no cadastro do produto"
                            >
                              <PencilSimple className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => remover.mutate(item.id)}
                            disabled={remover.isPending}
                            aria-label="Remover"
                          >
                            <Trash className="size-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

