import { useState } from 'react'
import { Archive, BoxArrowUp, Pencil, MagnifyingGlass } from '@phosphor-icons/react'
import { Dialog } from '@/shared/components/ui/dialog'
import { IconButton } from '@/shared/components/ui/icon-button'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ChipsFiltro, Selo, type OpcaoChip } from '@/shared/ui'
import { useInsightProdutos } from '@/admin/analise/analise.api'
import { Icon } from '@/admin/cotacoes/v2/ui-v2'
import { HistoricoCompraProduto } from './HistoricoCompraProduto'
import { useProdutos, useInativarProduto, useAtivarProduto } from './produtos.api'
import { ProdutoForm } from './ProdutoForm'
import type { Produto } from './produtos.schema'

const FILTROS: OpcaoChip[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ativos', rotulo: 'Ativos' },
  { valor: 'inativos', rotulo: 'Inativos' },
]

function normalizar(termo: string): string {
  return termo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function ProdutosPage() {
  const { data: produtos, isLoading, error } = useProdutos({ incluirInativos: true })
  const inativar = useInativarProduto()
  const ativar = useAtivarProduto()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<Produto | undefined>(undefined)
  const [historicoDe, setHistoricoDe] = useState<Produto | null>(null)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')

  // Histórico de compra do produto (última compra, nº de compras, fornecedores…)
  const insights = useInsightProdutos(historicoDe ? [historicoDe.id] : [])

  const palavras = normalizar(busca.trim()).split(/\s+/).filter(Boolean)
  const listaFiltrada = (produtos ?? [])
    .filter((p) => {
      if (filtro === 'ativos' && !p.ativo) return false
      if (filtro === 'inativos' && p.ativo) return false
      if (palavras.length === 0) return true
      const alvo = `${normalizar(p.nome)} ${p.codigoBarras != null ? normalizar(p.codigoBarras) : ''}`
      return palavras.every((palavra) => alvo.includes(palavra))
    })
    .sort((a, b) => Number(b.ativo) - Number(a.ativo))

  if (isLoading) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-white/15 bg-[#0d1410] p-8 text-center text-on-surface-variant">
          <p className="text-sm">Carregando catálogo…</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="5xl" className="space-y-5">
        <div className="rounded-none border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300 text-center">
          <p className="text-sm font-semibold">Erro ao carregar produtos: {error.message}</p>
        </div>
      </PageContainer>
    )
  }

  function abrirNovo() {
    setProdutoEditando(undefined)
    setMostrarForm(true)
  }

  function abrirEditar(produto: Produto) {
    setProdutoEditando(produto)
    setMostrarForm(true)
  }

  function fecharForm() {
    setMostrarForm(false)
    setProdutoEditando(undefined)
  }

  const totalAtivos = (produtos ?? []).filter((p) => p.ativo).length
  const totalInativos = (produtos ?? []).filter((p) => !p.ativo).length

  return (
    <PageContainer maxWidth="5xl" className="space-y-5 text-on-surface">
      {/* 1. CABEÇALHO DA PÁGINA (ESTILO PLANILHA CONTÁBIL) */}
      <div className="rounded-none border border-white/15 bg-[#0d1410] p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(78,222,163,0.25)]">
              <Icon name="inventory_2" className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
                  Catálogo de produtos
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-on-surface-variant">
                  {produtos?.length ?? 0} itens
                </span>
              </div>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">
                Gerencie os produtos, códigos de barra e configurações de embalagem.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirNovo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none bg-primary hover:bg-primary/90 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(78,222,163,0.3)] transition-all cursor-pointer shrink-0"
          >
            <Icon name="add" className="text-lg" />
            Novo produto
          </button>
        </div>
      </div>

      {/* 2. BARRA DE BUSCA E FILTROS */}
      <div className="rounded-none border border-white/15 bg-[#0d1410] p-3.5 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant/50"
            aria-hidden
          />
          <input
            type="search"
            aria-label="Buscar produto"
            placeholder="Buscar por nome ou código de barras…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-[#131b15] border border-white/10 rounded-none pl-9 pr-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <ChipsFiltro
            opcoes={FILTROS}
            valor={filtro}
            aoTrocar={setFiltro}
            className="border-b-0 p-0"
          />
          <span className="text-[11px] font-mono text-on-surface-variant/60 ml-2 hidden sm:inline">
            ({totalAtivos} ativos · {totalInativos} inativos)
          </span>
        </div>
      </div>

      {/* 3. MODAL DE FORMULÁRIO (NOVO / EDITAR) */}
      <Dialog
        open={mostrarForm}
        onClose={fecharForm}
        size="lg"
        ariaLabel={produtoEditando ? 'Editar produto' : 'Novo produto'}
      >
        <ProdutoForm aoSalvar={fecharForm} produtoParaEditar={produtoEditando} />
      </Dialog>

      {/* 4. MODAL DE HISTÓRICO DE COMPRA */}
      <Dialog
        open={historicoDe !== null}
        onClose={() => setHistoricoDe(null)}
        title={historicoDe ? `Histórico — ${historicoDe.nome}` : 'Histórico'}
      >
        {historicoDe &&
          (insights.isLoading ? (
            <p className="text-sm text-on-surface-variant p-4">Carregando histórico…</p>
          ) : (
            <HistoricoCompraProduto
              insight={insights.isError ? 'erro' : (insights.data?.[historicoDe.id] ?? null)}
            />
          ))}
      </Dialog>

      {/* 5. PLANILHA DE PRODUTOS COM CABEÇALHO FIXO */}
      <div className="rounded-none border border-white/15 bg-[#0d1410] shadow-xl overflow-hidden">
        <div className="scrollbar-fina overflow-x-auto overflow-y-auto max-h-[calc(100vh-16rem)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-white/15 bg-[#16211a] text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                <th className="px-4 py-3 border-r border-white/10">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <Icon name="inventory_2" className="text-primary text-sm" />
                    <span>Nome</span>
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-white/10 w-44">
                  <div className="flex items-center gap-1.5">
                    <Icon name="barcode" className="text-sm" />
                    <span>Código de barras</span>
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-white/10 w-48">
                  <div className="flex items-center gap-1.5">
                    <Icon name="package_2" className="text-sm" />
                    <span>Embalagem</span>
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-white/10 w-24 text-right">
                  <span>Qtd.</span>
                </th>
                <th className="px-4 py-3 text-right w-28">
                  <div className="flex items-center justify-end gap-1.5">
                    <Icon name="settings" className="text-sm" />
                    <span>Ações</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs">
              {!produtos?.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant/70">
                    <Icon name="inventory_2" className="text-3xl text-on-surface-variant/40 block mb-2 mx-auto" />
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant/70">
                    <Icon name="search_off" className="text-3xl text-on-surface-variant/40 block mb-2 mx-auto" />
                    Nenhum produto encontrado para a busca.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((produto) => (
                  <tr
                    key={produto.id}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      produto.ativo ? 'even:bg-white/[0.01]' : 'opacity-50 bg-black/20'
                    }`}
                  >
                    {/* 1. Nome do Produto + Histórico */}
                    <td className="px-4 py-3 font-medium border-r border-white/10">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHistoricoDe(produto)}
                          title="Ver histórico de compras"
                          className="text-left font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
                        >
                          {produto.nome}
                        </button>
                        {!produto.ativo && (
                          <Selo tom="neutro" className="text-[10px] uppercase font-bold py-0.5 px-1.5">
                            Inativo
                          </Selo>
                        )}
                      </div>
                    </td>

                    {/* 2. Código de barras (EAN) */}
                    <td className="px-4 py-3 text-on-surface-variant font-mono border-r border-white/10">
                      {produto.codigoBarras ? (
                        <span className="tracking-wider">{produto.codigoBarras}</span>
                      ) : (
                        <span className="text-on-surface-variant/40">—</span>
                      )}
                    </td>

                    {/* 3. Embalagem (Unidade + Qtd combinada) */}
                    <td className="px-4 py-3 text-on-surface-variant border-r border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-on-surface font-medium">{produto.unidade}</span>
                        {produto.quantidadePorEmbalagem > 1 && (
                          <span className="text-[11px] font-mono text-on-surface-variant/60">
                            (c/ {produto.quantidadePorEmbalagem} un)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Quantidade tabular */}
                    <td className="px-4 py-3 tabular-nums font-mono text-right text-on-surface-variant border-r border-white/10">
                      {produto.quantidadePorEmbalagem}
                    </td>

                    {/* 5. Ações (Editar, Inativar, Ativar) */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end items-center">
                        {produto.ativo ? (
                          <>
                            <IconButton
                              icon={Pencil}
                              label="Editar"
                              onClick={() => abrirEditar(produto)}
                            />
                            <IconButton
                              icon={Archive}
                              label="Inativar"
                              tone="destructive"
                              onClick={() => inativar.mutate(produto.id)}
                              disabled={inativar.isPending}
                            />
                          </>
                        ) : (
                          <IconButton
                            icon={BoxArrowUp}
                            label="Ativar"
                            onClick={() => ativar.mutate(produto.id)}
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
      </div>
    </PageContainer>
  )
}
