import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cotacoesApi, empresasApi, participantesApi, produtosApi } from './api-v2/endpoints'
import { getToken, baixarArquivo } from './api-v2/client'
import type { Celula, GridAoVivoDTO, ItemGrid, ParticipanteDaCotacaoResponse } from './api-v2/types'
import {
  Card,
  StatusBadge,
  Spinner,
  Table,
  Th,
  Td,
  Icon,
  Button,
  IconButton,
  formatarMoeda,
  formatarData,
  EmptyState,
  Modal,
  Field,
  Input,
} from './ui-v2'
import { useToast, mensagemErro } from './Toast-v2'

type Aba = 'itens' | 'participantes' | 'ao-vivo' | 'resultado'

const ABAS: { id: Aba; label: string }[] = [
  { id: 'itens', label: 'Itens' },
  { id: 'participantes', label: 'Participantes' },
  { id: 'ao-vivo', label: 'Ao vivo' },
  { id: 'resultado', label: 'Resultado' },
]

export function CotacaoDetalhePageV2() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { mostrar } = useToast()
  const [aba, setAba] = useState<Aba>('itens')
  const [abrindoPrazo, setAbrindoPrazo] = useState(false)
  const [prazo, setPrazo] = useState('')

  const { data: cotacao, isLoading } = useQuery({ queryKey: ['cotacao', id], queryFn: () => cotacoesApi.buscar(id) })

  const invalidarCotacao = () => qc.invalidateQueries({ queryKey: ['cotacao', id] })

  const acao = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      mostrar('Ação realizada.')
      invalidarCotacao()
      qc.invalidateQueries({ queryKey: ['cotacoes'] })
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const excluir = useMutation({
    mutationFn: () => cotacoesApi.excluir(id),
    onSuccess: () => {
      mostrar('Cotação excluída.')
      navigate('/cotacoes')
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const duplicar = useMutation({
    mutationFn: () => cotacoesApi.duplicar(id),
    onSuccess: (res) => {
      mostrar('Cotação duplicada.')
      if (res?.cotacao?.id) navigate(`/cotacoes/${res.cotacao.id}`)
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const abrir = useMutation({
    mutationFn: () => cotacoesApi.abrir(id, { prazo: new Date(prazo).toISOString() }),
    onSuccess: () => {
      mostrar('Cotação aberta.')
      setAbrindoPrazo(false)
      invalidarCotacao()
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  if (isLoading) return <Spinner />
  if (!cotacao) return <EmptyState icon="error" title="Cotação não encontrada" />

  const status = cotacao.status

  return (
    <div className="flex flex-col min-h-0 flex-1 max-w-7xl mx-auto w-full h-full">
      {/* 📌 CABEÇALHO E ABAS FIXOS NO TOPO (com o mesmo fundo do painel) */}
      <div
        className="shrink-0 z-20 pb-2 border-b border-white/10 sticky top-0 bg-[var(--brand-navy-deep,#12263f)]"
        style={{ background: 'linear-gradient(160deg, var(--brand-navy-deep, #12263f), var(--brand-navy, #1e3a5f)) fixed' }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-3">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">{cotacao.titulo}</h1>
            <div className="flex items-center gap-space-sm mt-space-xs">
              <StatusBadge status={status} />
              <span className="text-body-sm text-on-surface-variant">Prazo: {formatarData(cotacao.prazo)}</span>
              {cotacao.prazoVencido && <span className="text-body-sm text-error">Prazo vencido</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-space-xs">
            {status === 'RASCUNHO' && (
              <Button onClick={() => setAbrindoPrazo(true)}>
                <Icon name="play_arrow" className="text-[16px]" /> Abrir
              </Button>
            )}
            {status === 'ABERTA' && (
              <Button onClick={() => acao.mutate(() => cotacoesApi.encerrar(id))}>
                <Icon name="stop" className="text-[16px]" /> Encerrar
              </Button>
            )}
            {status === 'ENCERRADA' && (
              <>
                <Button onClick={() => acao.mutate(() => cotacoesApi.apurar(id))}>
                  <Icon name="task_alt" className="text-[16px]" /> Apurar
                </Button>
                <Button variant="ghost" onClick={() => acao.mutate(() => cotacoesApi.reabrir(id))}>
                  <Icon name="lock_open" className="text-[16px]" /> Reabrir
                </Button>
              </>
            )}
            {status === 'PEDIDOS_GERADOS' && (
              <Button variant="ghost" onClick={() => acao.mutate(() => cotacoesApi.recotarSemVencedor(id))}>
                <Icon name="restart_alt" className="text-[16px]" /> Recotar sem vencedor
              </Button>
            )}
            <Button variant="ghost" onClick={() => duplicar.mutate()}>
              <Icon name="content_copy" className="text-[16px]" /> Duplicar
            </Button>
            {status !== 'CANCELADA' && status !== 'PEDIDOS_GERADOS' && (
              <Button variant="ghost" onClick={() => acao.mutate(() => cotacoesApi.cancelar(id))}>
                <Icon name="cancel" className="text-[16px]" /> Cancelar
              </Button>
            )}
            {status === 'RASCUNHO' && (
              <Button variant="ghost" onClick={() => excluir.mutate()}>
                <Icon name="delete" className="text-[16px]" /> Excluir
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-space-xs pt-1">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`px-space-md py-space-sm text-label-md font-label-md border-b-2 transition-all cursor-pointer ${
                aba === a.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col pt-4">
        {aba === 'itens' && <AbaItens cotacaoId={id} itens={cotacao.itens ?? []} editavel={status === 'RASCUNHO' || status === 'ABERTA'} />}
        {aba === 'participantes' && <AbaParticipantes cotacaoId={id} editavel={status === 'RASCUNHO' || status === 'ABERTA'} />}
        {aba === 'ao-vivo' && <AbaAoVivo cotacaoId={id} />}
        {aba === 'resultado' && <AbaResultado cotacaoId={id} />}
      </div>

      <Modal
        open={abrindoPrazo}
        onClose={() => setAbrindoPrazo(false)}
        title="Abrir cotação"
        onSubmit={(e) => {
          e.preventDefault()
          abrir.mutate()
        }}
        submitting={abrir.isPending}
        submitLabel="Abrir"
      >
        <Field label="Prazo final para lances">
          <Input type="datetime-local" value={prazo} onChange={(e) => setPrazo(e.target.value)} required autoFocus />
        </Field>
      </Modal>
    </div>
  )
}

// Configurações de larguras padrão e mínimas para a tabela de itens
const LARGURAS_PADRAO_ITENS = {
  produto: 360,
  codigoBarras: 160,
  embalagem: 140,
  quantidade: 130,
  acoes: 75,
}

const LARGURAS_MINIMAS_ITENS: Record<keyof typeof LARGURAS_PADRAO_ITENS, number> = {
  produto: 40,
  codigoBarras: 30,
  embalagem: 30,
  quantidade: 30,
  acoes: 30,
}

const STORAGE_KEY_LARGURAS = 'simplecote:cotacao-tabela-colunas-v2'

function lerLargurasSalvas(): typeof LARGURAS_PADRAO_ITENS {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LARGURAS)
    if (raw) return { ...LARGURAS_PADRAO_ITENS, ...JSON.parse(raw) }
  } catch {}
  return LARGURAS_PADRAO_ITENS
}

// ============================================================
// Aba Itens (Buscador Global + Catálogo Amplo + Confirmação)
// ============================================================
function AbaItens({ cotacaoId, itens, editavel }: { cotacaoId: string; itens: any[]; editavel: boolean }) {
  const qc = useQueryClient()
  const { mostrar } = useToast()
  const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: produtosApi.listar, enabled: editavel })

  // Estado das larguras redimensionáveis das colunas
  const [larguras, setLarguras] = useState(lerLargurasSalvas)

  const iniciarRedimensionamento = useCallback(
    (coluna: keyof typeof LARGURAS_PADRAO_ITENS, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const startX = e.clientX
      const startWidth = larguras[coluna]

      function onMouseMove(moveEvent: MouseEvent) {
        const delta = moveEvent.clientX - startX
        const novaLargura = Math.max(LARGURAS_MINIMAS_ITENS[coluna], startWidth + delta)
        setLarguras((prev) => ({ ...prev, [coluna]: novaLargura }))
      }

      function onMouseUp(upEvent: MouseEvent) {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        const delta = upEvent.clientX - startX
        const finalWidth = Math.max(LARGURAS_MINIMAS_ITENS[coluna], startWidth + delta)
        setLarguras((prev) => {
          const final = { ...prev, [coluna]: finalWidth }
          try {
            localStorage.setItem(STORAGE_KEY_LARGURAS, JSON.stringify(final))
          } catch {}
          return final
        })
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    },
    [larguras],
  )

  const resetarColuna = useCallback((coluna: keyof typeof LARGURAS_PADRAO_ITENS) => {
    setLarguras((prev) => {
      const final = { ...prev, [coluna]: LARGURAS_PADRAO_ITENS[coluna] }
      try {
        localStorage.setItem(STORAGE_KEY_LARGURAS, JSON.stringify(final))
      } catch {}
      return final
    })
  }, [])

  const larguraTotalTabela = useMemo(() => {
    return (
      larguras.produto +
      larguras.codigoBarras +
      larguras.embalagem +
      larguras.quantidade +
      (editavel ? larguras.acoes : 0)
    )
  }, [larguras, editavel])

  // Estado do Buscador Universal no Topo
  const [termo, setTermo] = useState('')
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const buscaRef = useRef<HTMLDivElement>(null)
  const inputBuscaRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Rolar suavemente para o item ativo no dropdown quando mudar com setas
  useEffect(() => {
    if (dropdownAberto && itemRefs.current[indiceAtivo]) {
      itemRefs.current[indiceAtivo]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [indiceAtivo, dropdownAberto])

  // Estado de modais
  const [modalCatalogoAberto, setModalCatalogoAberto] = useState(false)
  const [buscaCatalogo, setBuscaCatalogo] = useState('')

  // Item selecionado para inclusão (com quantidade e embalagem)
  const [itemSelecionado, setItemSelecionado] = useState<{
    id?: string
    itemId?: string
    nome: string
    codigoBarras?: string
    unidade: string
    quantidadePorEmbalagem: number
    isGlobal?: boolean
  } | null>(null)
  const [qtdSolicitada, setQtdSolicitada] = useState('1')
  const [unidadeEditada, setUnidadeEditada] = useState('')
  const [fatorEmbalagemEditado, setFatorEmbalagemEditado] = useState('1')

  const qtdNumero = Math.floor(Number(qtdSolicitada))
  const fatorNumero = Math.floor(Number(fatorEmbalagemEditado))
  const formValido = !isNaN(qtdNumero) && qtdNumero > 0 && !isNaN(fatorNumero) && fatorNumero > 0 && unidadeEditada.trim().length > 0

  // Mapa rápido de produtoId -> item já na cotação
  const itensNaCotacaoMap = useMemo(() => {
    const map = new Map<string, any>()
    for (const it of itens) {
      if (it.produtoId) map.set(it.produtoId, it)
    }
    return map
  }, [itens])

  // Busca debounced para o Catálogo Global
  const [termoDebounced, setTermoDebounced] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setTermoDebounced(termo), 250)
    return () => clearTimeout(timer)
  }, [termo])

  // Consulta ao Catálogo Global quando termo tem 2+ caracteres
  const { data: sugestoesGlobais } = useQuery({
    queryKey: ['sugestoes-produtos', termoDebounced],
    queryFn: () => produtosApi.sugestoes(termoDebounced),
    enabled: editavel && termoDebounced.trim().length >= 2,
    staleTime: 30_000,
  })

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (buscaRef.current && !buscaRef.current.contains(e.target as Node)) {
        setDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  // Filtragem dos produtos locais
  const produtosLocaisFiltrados = useMemo(() => {
    if (!produtos) return []
    const s = termo.trim().toLowerCase()
    if (!s) return produtos.filter((p) => p.ativo !== false)
    return produtos.filter(
      (p) =>
        p.ativo !== false &&
        (p.nome?.toLowerCase().includes(s) || (p.codigoBarras && p.codigoBarras.includes(s)))
    )
  }, [produtos, termo])

  // Sugestões do catálogo global que ainda não existem no catálogo local
  const sugestoesGlobaisFiltradas = useMemo(() => {
    if (!sugestoesGlobais?.doCatalogoGlobal) return []
    const codigosLocais = new Set((produtos ?? []).map((p) => p.codigoBarras).filter(Boolean))
    const nomesLocais = new Set((produtos ?? []).map((p) => p.nome?.trim().toLowerCase()).filter(Boolean))
    return sugestoesGlobais.doCatalogoGlobal.filter((g) => {
      if (g.codigoBarras && codigosLocais.has(g.codigoBarras)) return false
      if (g.nome && nomesLocais.has(g.nome.trim().toLowerCase())) return false
      return true
    })
  }, [sugestoesGlobais, produtos])

  // Lista unificada para o dropdown do buscador
  const listaSugestoes = useMemo(() => {
    const locais = produtosLocaisFiltrados.slice(0, 15).map((p: any) => ({
      id: p.id,
      nome: p.nome || 'Produto sem nome',
      codigoBarras: p.codigoBarras,
      unidade: p.unidade || 'Unidade',
      quantidadePorEmbalagem: p.quantidadePorEmbalagem || 1,
      isGlobal: false,
    }))

    const globais = sugestoesGlobaisFiltradas.slice(0, 10).map((g: any) => ({
      id: undefined,
      nome: g.nome || 'Produto global',
      codigoBarras: g.codigoBarras,
      unidade: 'Unidade',
      quantidadePorEmbalagem: 1,
      isGlobal: true,
    }))

    return [...locais, ...globais]
  }, [produtosLocaisFiltrados, sugestoesGlobaisFiltradas])

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['cotacao', cotacaoId] })
    qc.invalidateQueries({ queryKey: ['produtos'] })
  }

  // Abertura do modal de confirmação para um produto selecionado
  const abrirConfirmacao = (p: {
    id?: string
    itemId?: string
    nome?: string
    codigoBarras?: string
    unidade?: string
    quantidadePorEmbalagem?: number
    quantidadeSolicitada?: number
    isGlobal?: boolean
  }) => {
    const existente = p.id ? itensNaCotacaoMap.get(p.id) : null
    const finalItemId = p.itemId || existente?.id

    setItemSelecionado({
      id: p.id,
      itemId: finalItemId,
      nome: p.nome || 'Produto sem nome',
      codigoBarras: p.codigoBarras,
      unidade: p.unidade || 'Unidade',
      quantidadePorEmbalagem: p.quantidadePorEmbalagem || 1,
      isGlobal: p.isGlobal,
    })
    setUnidadeEditada(p.unidade || 'Unidade')
    setFatorEmbalagemEditado(String(p.quantidadePorEmbalagem || 1))
    
    // Se já estiver na cotação, usa a quantidade solicitada dele; senão, 1
    const qtdInicial = p.quantidadeSolicitada ?? existente?.quantidadeSolicitada ?? 1
    setQtdSolicitada(String(qtdInicial))
    
    setDropdownAberto(false)
  }

  // Mutação para adicionar ou atualizar item existente (incluindo alteração de embalagem/fator)
  const salvarItem = useMutation({
    mutationFn: async () => {
      if (!itemSelecionado) return

      let produtoIdFinal = itemSelecionado.id

      // 1. Se for produto novo do catálogo global, cria primeiro
      if (itemSelecionado.isGlobal || !produtoIdFinal) {
        const novoProduto = await produtosApi.criar({
          nome: itemSelecionado.nome,
          codigoBarras: itemSelecionado.codigoBarras,
          unidade: unidadeEditada || 'Unidade',
          quantidadePorEmbalagem: fatorNumero || 1,
        })
        produtoIdFinal = novoProduto.id
      } else {
        // Se mudou a embalagem ou fator do produto existente, atualiza o produto
        if (
          unidadeEditada !== itemSelecionado.unidade ||
          fatorNumero !== itemSelecionado.quantidadePorEmbalagem
        ) {
          await produtosApi.atualizar(produtoIdFinal, {
            nome: itemSelecionado.nome,
            unidade: unidadeEditada,
            quantidadePorEmbalagem: fatorNumero,
          })
        }
      }

      if (!produtoIdFinal) throw new Error('Não foi possível identificar o produto')

      const existente = itensNaCotacaoMap.get(produtoIdFinal)
      const itemIdParaAtualizar = itemSelecionado.itemId || existente?.id

      if (itemIdParaAtualizar) {
        // Se for edição e mudou embalagem ou fator, remove e readiciona para atualizar o snapshot na cotação
        const mudouEmbalagem =
          unidadeEditada !== itemSelecionado.unidade ||
          fatorNumero !== itemSelecionado.quantidadePorEmbalagem

        if (mudouEmbalagem) {
          await cotacoesApi.removerItem(cotacaoId, itemIdParaAtualizar)
          await cotacoesApi.adicionarItem(cotacaoId, {
            produtoId: produtoIdFinal,
            quantidade: qtdNumero,
          })
        } else {
          // Se só mudou a quantidade, usa a rota dedicada de patch de quantidade
          await cotacoesApi.atualizarQuantidadeItem(cotacaoId, itemIdParaAtualizar, {
            quantidade: qtdNumero,
          })
        }
      } else {
        // Item novo na cotação
        await cotacoesApi.adicionarItem(cotacaoId, {
          produtoId: produtoIdFinal,
          quantidade: qtdNumero,
        })
      }
    },
    onSuccess: () => {
      const eraEdicao = Boolean(itemSelecionado?.itemId || (itemSelecionado?.id && itensNaCotacaoMap.has(itemSelecionado.id)))
      mostrar(eraEdicao ? 'Item atualizado com sucesso!' : 'Item adicionado à cotação!')
      setItemSelecionado(null)
      setTermo('')
      invalidar()
      inputBuscaRef.current?.focus()
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  // Navegação pelo teclado na busca rápida
  const tratarTeclasBusca = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownAberto || listaSugestoes.length === 0) {
      if (e.key === 'Enter' && termo.trim()) {
        // Se bipou com leitor (GTIN completo de 8 a 14 dígitos)
        const gtinLimpo = termo.trim()
        const achouExato = produtos?.find((p) => p.codigoBarras === gtinLimpo)
        if (achouExato) {
          e.preventDefault()
          abrirConfirmacao(achouExato)
          return
        }
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndiceAtivo((prev) => (prev + 1) % listaSugestoes.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndiceAtivo((prev) => (prev - 1 + listaSugestoes.length) % listaSugestoes.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selecionado = listaSugestoes[indiceAtivo]
      if (selecionado) {
        abrirConfirmacao(selecionado)
      }
    } else if (e.key === 'Escape') {
      setDropdownAberto(false)
    }
  }

  const remover = useMutation({
    mutationFn: (itemId: string) => cotacoesApi.removerItem(cotacaoId, itemId),
    onSuccess: () => {
      mostrar('Item removido da cotação.')
      invalidar()
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const atualizarQtd = useMutation({
    mutationFn: ({ itemId, quantidade }: { itemId: string; quantidade: number }) =>
      cotacoesApi.atualizarQuantidadeItem(cotacaoId, itemId, { quantidade }),
    onSuccess: () => {
      mostrar('Quantidade atualizada.')
      invalidar()
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      {/* 🔍 BARRA DE MULTI-BUSCA INTELIGENTE (Spotlight + Bipagem) - Fixa no topo */}
      {editavel && (
        <div className="shrink-0 bg-[#161d19] bg-surface-container-low border border-white/10 rounded-2xl p-3.5 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center relative z-20">
          <div className="relative flex-1" ref={buscaRef}>
            <div className="relative flex items-center">
              <Icon name="search" className="absolute left-3.5 text-on-surface-variant text-xl pointer-events-none" />
              <input
                ref={inputBuscaRef}
                value={termo}
                onChange={(e) => {
                  setTermo(e.target.value)
                  setDropdownAberto(true)
                  setIndiceAtivo(0)
                }}
                onFocus={() => {
                  if (termo.trim()) setDropdownAberto(true)
                }}
                onKeyDown={tratarTeclasBusca}
                placeholder="🔍 Digite o nome (ex: água de coco, arroz), código de barras ou bipe com o leitor..."
                className="w-full bg-[#242c27] text-[#dde4dd] placeholder:text-[#86948a] text-sm rounded-xl pl-11 pr-28 py-3.5 border border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner transition-all"
              />
              {termo && (
                <button
                  type="button"
                  onClick={() => {
                    setTermo('')
                    setDropdownAberto(false)
                    inputBuscaRef.current?.focus()
                  }}
                  className="absolute right-14 text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors cursor-pointer"
                >
                  <Icon name="close" className="text-base" />
                </button>
              )}
              <div className="absolute right-3 flex items-center gap-1 text-[11px] font-mono text-on-surface-variant/80 bg-surface-container-highest px-2 py-1 rounded-md border border-white/5 pointer-events-none">
                <Icon name="qr_code_scanner" className="text-[14px]" />
                <span>Bip / Enter</span>
              </div>
            </div>

            {/* 📋 MENU FLUTUANTE COM SCROLL AMPLO DE SUGESTÕES */}
            {dropdownAberto && termo.trim().length > 0 && (
              <div className="absolute left-0 right-0 z-[150] mt-2 max-h-96 overflow-y-auto rounded-2xl bg-[#1a211d] border border-white/20 shadow-2xl divide-y divide-white/5 backdrop-blur-lg animate-in fade-in slide-in-from-top-2 duration-150">
                {listaSugestoes.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant">
                    <Icon name="inventory_2" className="text-3xl mb-2 opacity-50 block mx-auto" />
                    <p className="text-sm font-medium">Nenhum produto encontrado com "{termo}"</p>
                    <p className="text-xs opacity-70 mt-1">Verifique o código ou nome digitado.</p>
                  </div>
                ) : (
                  listaSugestoes.map((item: any, idx: number) => {
                    const ativo = idx === indiceAtivo
                    const jaNaCotacao = item.id ? itensNaCotacaoMap.get(item.id) : null
                    return (
                      <div
                        key={item.id || item.codigoBarras || idx}
                        ref={(el) => { itemRefs.current[idx] = el }}
                        onMouseEnter={() => setIndiceAtivo(idx)}
                        onClick={() => abrirConfirmacao(item)}
                        className={`p-3.5 px-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          ativo ? 'bg-[#242c27] border-l-4 border-primary pl-3' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-[#dde4dd] truncate">{item.nome}</span>
                            {item.isGlobal && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-tertiary/20 text-tertiary border border-tertiary/30">
                                🌐 Catálogo Global
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1 font-mono">
                            {item.codigoBarras && (
                              <span className="bg-surface-container-highest px-1.5 py-0.5 rounded text-[11px]">
                                {item.codigoBarras}
                              </span>
                            )}
                            <span className="text-[#4edea3] font-semibold">Embalagem: {item.unidade}{item.quantidadePorEmbalagem > 1 ? `/${item.quantidadePorEmbalagem}` : ''}</span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {jaNaCotacao ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                              <Icon name="check_circle" className="text-sm" />
                              Na cotação ({jaNaCotacao.quantidadeSolicitada} {item.unidade})
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-primary/90 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 flex items-center gap-1">
                              <Icon name="add" className="text-sm" />
                              Selecionar
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Botão para abrir o Modal Amplo do Catálogo Completo */}
          <Button
            onClick={() => setModalCatalogoAberto(true)}
            className="whitespace-nowrap py-3.5 px-5 shrink-0 bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-white/10"
          >
            <Icon name="apps" className="text-lg" />
            Catálogo completo ({produtos?.length ?? 0})
          </Button>
        </div>
      )}

      {/* 📊 TABELA PRINCIPAL DE ITENS DA COTAÇÃO COM SCROLL INTERNO */}
      {itens.length === 0 ? (
        <EmptyState
          icon="shopping_basket"
          title="Nenhum item na cotação ainda"
          description="Use a barra inteligente acima para digitar o nome, bipar o código de barras ou abrir o catálogo completo."
        />
      ) : (
        <Table
          containerClassName="flex-1 min-h-[350px] shadow-lg rounded-none border border-white/15"
          tableClassName="table-fixed"
          tableStyle={{ width: `max(100%, ${larguraTotalTabela}px)` }}
        >
          <colgroup>
            <col style={{ width: `${larguras.produto}px` }} />
            <col style={{ width: `${larguras.codigoBarras}px` }} />
            <col style={{ width: `${larguras.embalagem}px` }} />
            <col style={{ width: `${larguras.quantidade}px` }} />
            {editavel && <col style={{ width: `${larguras.acoes}px` }} />}
          </colgroup>
          <thead>
            <tr className="bg-[#1a231d] border-b border-white/15">
              <Th
                onResize={(e) => iniciarRedimensionamento('produto', e)}
                onDoubleClickResize={() => resetarColuna('produto')}
              >
                Produto
              </Th>
              <Th
                onResize={(e) => iniciarRedimensionamento('codigoBarras', e)}
                onDoubleClickResize={() => resetarColuna('codigoBarras')}
              >
                Código de barras
              </Th>
              <Th
                onResize={(e) => iniciarRedimensionamento('embalagem', e)}
                onDoubleClickResize={() => resetarColuna('embalagem')}
              >
                Embalagem
              </Th>
              <Th
                right
                onResize={(e) => iniciarRedimensionamento('quantidade', e)}
                onDoubleClickResize={() => resetarColuna('quantidade')}
              >
                Qtd. Solicitada
              </Th>
              {editavel && <Th right>Ações</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-sm text-on-surface">
            {itens.map((it: any) => {
              const fator = it.quantidadePorEmbalagemSnapshot || 1
              const embalagemRotulo = fator > 1 ? `${it.unidadeSnapshot || 'Embalagem'}/${fator}` : (it.unidadeSnapshot || 'Unidade')
              return (
                <tr key={it.id} className="even:bg-white/[0.025] odd:bg-transparent hover:bg-white/[0.05] transition-colors group">
                  <Td className="font-medium text-[#dde4dd] overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        abrirConfirmacao({
                          id: it.produtoId,
                          itemId: it.id,
                          nome: it.nomeSnapshot,
                          codigoBarras: it.codigoBarrasSnapshot || undefined,
                          unidade: it.unidadeSnapshot,
                          quantidadePorEmbalagem: it.quantidadePorEmbalagemSnapshot,
                          quantidadeSolicitada: it.quantidadeSolicitada,
                        })
                      }
                      className="hover:text-primary hover:underline transition-colors text-left font-medium cursor-pointer py-0.5 truncate block w-full"
                      title={it.nomeSnapshot}
                    >
                      {it.nomeSnapshot}
                    </button>
                  </Td>
                  <Td muted className="font-mono text-xs overflow-hidden">
                    {it.codigoBarrasSnapshot ? (
                      <span className="bg-surface-container-highest px-1.5 py-0.5 rounded text-[11px] border border-white/5 truncate inline-block max-w-full" title={it.codigoBarrasSnapshot}>
                        {it.codigoBarrasSnapshot}
                      </span>
                    ) : (
                      '—'
                    )}
                  </Td>
                  <Td className="overflow-hidden">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface-container-highest text-[#4edea3] border border-white/5 truncate max-w-full" title={embalagemRotulo}>
                      {embalagemRotulo}
                    </span>
                  </Td>
                  <Td right>
                    {editavel ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          min={1}
                          defaultValue={it.quantidadeSolicitada}
                          className="w-16 bg-[#242c27] text-right font-bold text-primary rounded-md px-2 py-0.5 text-xs border border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
                          onBlur={(e) => {
                            const v = Number(e.target.value)
                            if (v > 0 && v !== it.quantidadeSolicitada) {
                              atualizarQtd.mutate({ itemId: it.id, quantidade: v })
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur()
                            }
                          }}
                        />
                        <span className="text-[11px] text-on-surface-variant font-medium">{it.unidadeSnapshot || 'un'}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-primary text-xs">{it.quantidadeSolicitada} {it.unidadeSnapshot || 'un'}</span>
                    )}
                  </Td>
                  {editavel && (
                    <Td right>
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon="edit"
                          title="Editar embalagem ou quantidade"
                          onClick={() =>
                            abrirConfirmacao({
                              id: it.produtoId,
                              itemId: it.id,
                              nome: it.nomeSnapshot,
                              codigoBarras: it.codigoBarrasSnapshot || undefined,
                              unidade: it.unidadeSnapshot,
                              quantidadePorEmbalagem: it.quantidadePorEmbalagemSnapshot,
                              quantidadeSolicitada: it.quantidadeSolicitada,
                            })
                          }
                        />
                        <IconButton
                          icon="delete"
                          title="Remover da cotação"
                          danger
                          onClick={() => remover.mutate(it.id)}
                        />
                      </div>
                    </Td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}

      {/* 📦 MODAL RÁPIDO DE CONFIRMAÇÃO (QUANTIDADE + EMBALAGEM) */}
      <Modal
        open={Boolean(itemSelecionado)}
        onClose={() => setItemSelecionado(null)}
        title={
          itemSelecionado?.itemId || (itemSelecionado?.id && itensNaCotacaoMap.has(itemSelecionado.id))
            ? 'Editar item da cotação'
            : 'Adicionar item à cotação'
        }
        onSubmit={(e) => {
          e.preventDefault()
          salvarItem.mutate()
        }}
        submitting={salvarItem.isPending || !formValido}
        submitLabel={
          itemSelecionado?.itemId || (itemSelecionado?.id && itensNaCotacaoMap.has(itemSelecionado.id))
            ? 'Salvar alterações'
            : 'Adicionar à cotação'
        }
      >
        {itemSelecionado && (
          <div className="space-y-4">
            {/* Header do produto selecionado */}
            <div className="bg-[#1a211d] p-4 rounded-xl border border-white/10 flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Produto selecionado</span>
              <h3 className="text-base font-bold text-[#dde4dd]">{itemSelecionado.nome}</h3>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono mt-1">
                <span>GTIN: {itemSelecionado.codigoBarras || 'Sem código'}</span>
                {itemSelecionado.isGlobal && (
                  <span className="bg-tertiary/20 text-tertiary px-1.5 py-0.5 rounded text-[10px]">🌐 Do Catálogo Global</span>
                )}
              </div>
            </div>

            {/* Configuração de Embalagem para o Representante */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Embalagem (para o representante)">
                <input
                  value={unidadeEditada}
                  onChange={(e) => setUnidadeEditada(e.target.value)}
                  placeholder="Ex: Caixa, Fardo, Unidade"
                  className="w-full bg-[#242c27] text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </Field>
              <Field label="Qtd. por Embalagem (Fator)">
                <input
                  type="number"
                  min={1}
                  value={fatorEmbalagemEditado}
                  onChange={(e) => setFatorEmbalagemEditado(e.target.value)}
                  placeholder="Ex: 12"
                  className={`w-full bg-[#242c27] text-on-surface text-sm rounded-xl px-3.5 py-2.5 border transition-all ${
                    fatorNumero > 0 ? 'border-white/10 focus:border-primary focus:ring-1 focus:ring-primary' : 'border-error text-error focus:border-error focus:ring-1 focus:ring-error'
                  } focus:outline-none`}
                  required
                />
              </Field>
            </div>

            {/* Quantidade Solicitada */}
            <Field label="Quantidade Solicitada de Embalagens">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    autoFocus
                    value={qtdSolicitada}
                    onChange={(e) => setQtdSolicitada(e.target.value)}
                    placeholder="Qtd"
                    className={`flex-1 bg-[#242c27] text-2xl font-bold rounded-xl px-4 py-2 border transition-all text-center ${
                      qtdNumero > 0 ? 'text-primary border-white/10 focus:border-primary focus:ring-1 focus:ring-primary' : 'text-error border-error focus:border-error focus:ring-1 focus:ring-error'
                    } focus:outline-none`}
                    required
                  />
                  <span className="text-sm font-semibold text-on-surface-variant">{unidadeEditada || 'embalagens'}</span>
                </div>

                {/* Botões de incremento rápido */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[1, 5, 10, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQtdSolicitada((prev) => String((Number(prev) || 0) + num))}
                      className="px-2.5 py-1 text-xs font-mono bg-[#242c27] hover:bg-[#2f3632] text-on-surface-variant hover:text-white rounded-lg border border-white/5 transition-colors cursor-pointer"
                    >
                      +{num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQtdSolicitada('1')}
                    className="px-2.5 py-1 text-xs text-on-surface-variant hover:text-white rounded-lg transition-colors cursor-pointer ml-auto"
                  >
                    Resetar (1)
                  </button>
                </div>
              </div>
            </Field>

            {/* Preview do que o fornecedor verá */}
            <div className="text-xs text-on-surface-variant bg-[#1a211d]/60 p-3 rounded-xl border border-white/5 flex items-center gap-2">
              <Icon name="info" className="text-primary text-base shrink-0" />
              <span>
                O representante verá: <strong>{qtdNumero > 0 ? qtdNumero : '—'} {unidadeEditada || 'Embalagem'}{fatorNumero > 1 ? `/${fatorNumero}` : ''}</strong> {fatorNumero > 1 && qtdNumero > 0 ? `(${qtdNumero * fatorNumero} unidades totais)` : ''}.
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* 🗂️ MODAL AMPLO DE CATÁLOGO COMPLETO (max-w-4xl) */}
      <Modal
        open={modalCatalogoAberto}
        onClose={() => setModalCatalogoAberto(false)}
        title="Catálogo de Produtos da Loja"
        width="max-w-4xl"
      >
        <div className="space-y-4">
          {/* Busca interna do catálogo amplo */}
          <div className="relative">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg" />
            <input
              value={buscaCatalogo}
              onChange={(e) => setBuscaCatalogo(e.target.value)}
              placeholder="Filtrar por nome ou código de barras no catálogo..."
              className="w-full bg-[#242c27] text-on-surface text-sm rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Lista com scroll amplo */}
          <div className="max-h-[55vh] overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-xl bg-[#1a211d]">
            {((produtos ?? []).filter(
              (p) =>
                p.ativo !== false &&
                (!buscaCatalogo.trim() ||
                  p.nome?.toLowerCase().includes(buscaCatalogo.trim().toLowerCase()) ||
                  (p.codigoBarras && p.codigoBarras.includes(buscaCatalogo.trim())))
            )).length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                <Icon name="search_off" className="text-4xl opacity-50 block mx-auto mb-2" />
                Nenhum produto encontrado no catálogo próprio.
              </div>
            ) : (
              (produtos ?? [])
                .filter(
                  (p) =>
                    p.ativo !== false &&
                    (!buscaCatalogo.trim() ||
                      p.nome?.toLowerCase().includes(buscaCatalogo.trim().toLowerCase()) ||
                      (p.codigoBarras && p.codigoBarras.includes(buscaCatalogo.trim())))
                )
                .map((p) => {
                  const jaTem = itensNaCotacaoMap.get(p.id || '')
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 px-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#dde4dd] truncate">{p.nome}</h4>
                        <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono mt-0.5">
                          <span>GTIN: {p.codigoBarras || '—'}</span>
                          <span>Embalagem: {p.unidade || 'Unidade'} ({p.quantidadePorEmbalagem || 1} un)</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {jaTem && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                            <Icon name="check" className="text-xs" />
                            {jaTem.quantidadeSolicitada} {p.unidade} na cotação
                          </span>
                        )}
                        <Button
                          variant={jaTem ? 'ghost' : 'primary'}
                          onClick={() => {
                            setModalCatalogoAberto(false)
                            abrirConfirmacao(p)
                          }}
                          className="py-1.5 px-3 text-xs"
                        >
                          {jaTem ? 'Alterar qtd' : '+ Adicionar'}
                        </Button>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
// ============================================================
// Aba Participantes
// ============================================================
function AbaParticipantes({ cotacaoId, editavel }: { cotacaoId: string; editavel: boolean }) {
  const qc = useQueryClient()
  const { mostrar } = useToast()
  const { data, isLoading } = useQuery({ queryKey: ['cotacao', cotacaoId, 'participantes'], queryFn: () => cotacoesApi.participantes(cotacaoId) })
  const { data: empresas } = useQuery({ queryKey: ['empresas'], queryFn: empresasApi.listar, enabled: editavel })
  const [aberto, setAberto] = useState(false)
  const [selecionadas, setSelecionadas] = useState<string[]>([])

  const invalidar = () => qc.invalidateQueries({ queryKey: ['cotacao', cotacaoId, 'participantes'] })

  const convidar = useMutation({
    mutationFn: () => cotacoesApi.convidarParticipantes(cotacaoId, { empresaIds: selecionadas }),
    onSuccess: () => {
      mostrar('Participantes convidados.')
      setAberto(false)
      setSelecionadas([])
      invalidar()
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const desconvidar = useMutation({
    mutationFn: (participanteId: string) => participantesApi.desconvidar(participanteId),
    onSuccess: () => invalidar(),
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const reenviar = useMutation({
    mutationFn: (participanteId: string) => participantesApi.reenviarConvite(participanteId),
    onSuccess: () => mostrar('Convite reenviado.'),
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const reabrirParticipante = useMutation({
    mutationFn: (participanteId: string) => participantesApi.reabrir(participanteId),
    onSuccess: () => invalidar(),
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const finalizarParticipante = useMutation({
    mutationFn: (participanteId: string) => participantesApi.finalizar(participanteId),
    onSuccess: () => invalidar(),
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  if (isLoading) return <Spinner />

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      {editavel && (
        <div className="shrink-0 flex justify-end">
          <Button onClick={() => setAberto(true)}>
            <Icon name="group_add" className="text-[16px]" /> Convidar participantes
          </Button>
        </div>
      )}
      {!data || data.length === 0 ? (
        <EmptyState icon="groups" title="Nenhum participante convidado" />
      ) : (
        <Table containerClassName="flex-1 min-h-[350px] shadow-lg">
          <thead>
            <tr className="bg-[#1a231d] text-on-surface-variant font-label-md uppercase tracking-wider">
              <Th>Empresa</Th>
              <Th>Representante</Th>
              <Th>Convite</Th>
              <Th>Participação</Th>
              <Th>Respondido em</Th>
              <Th right>Ações</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-body-md text-on-surface">
            {data.map((p: ParticipanteDaCotacaoResponse) => (
              <tr key={p.participanteId} className="even:bg-white/[0.025] odd:bg-transparent hover:bg-white/[0.05] transition-colors">
                <Td>{p.empresaNome}</Td>
                <Td muted>{p.representanteNome}</Td>
                <Td><StatusBadge status={p.conviteStatus} /></Td>
                <Td><StatusBadge status={p.participanteStatus} /></Td>
                <Td muted>{formatarData(p.respondidoEm)}</Td>
                <Td right>
                  <div className="flex justify-end gap-space-xs">
                    <IconButton icon="send" title="Reenviar convite" onClick={() => reenviar.mutate(p.participanteId!)} />
                    {p.participanteStatus === 'RESPONDIDO' ? (
                      <IconButton icon="lock_open" title="Reabrir participação" onClick={() => reabrirParticipante.mutate(p.participanteId!)} />
                    ) : (
                      <IconButton icon="task_alt" title="Finalizar participação" onClick={() => finalizarParticipante.mutate(p.participanteId!)} />
                    )}
                    {editavel && (
                      <IconButton icon="person_remove" title="Desconvidar" danger onClick={() => desconvidar.mutate(p.participanteId!)} />
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={aberto}
        onClose={() => setAberto(false)}
        title="Convidar participantes"
        onSubmit={(e) => {
          e.preventDefault()
          convidar.mutate()
        }}
        submitting={convidar.isPending}
        submitLabel="Convidar"
      >
        <div className="max-h-72 overflow-y-auto space-y-space-xs">
          {empresas?.map((e) => (
            <label key={e.id} className="flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg hover:bg-surface-container-high cursor-pointer">
              <input
                type="checkbox"
                checked={selecionadas.includes(e.id!)}
                onChange={(ev) =>
                  setSelecionadas((prev) => (ev.target.checked ? [...prev, e.id!] : prev.filter((x) => x !== e.id)))
                }
              />
              <span className="text-body-sm text-on-surface">{e.nome}</span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  )
}

// ============================================================
// Aba Ao vivo — polling + SSE real (fetch + ReadableStream, já
// que EventSource nativo não permite header Authorization)
// ============================================================
function AbaAoVivo({ cotacaoId }: { cotacaoId: string }) {
  const qc = useQueryClient()
  const [live, setLive] = useState<GridAoVivoDTO | null>(null)
  const [conectado, setConectado] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['cotacao', cotacaoId, 'ao-vivo'],
    queryFn: () => cotacoesApi.aoVivo(cotacaoId),
    refetchInterval: conectado ? false : 10000,
  })

  useEffect(() => {
    const token = getToken()
    if (!token) return
    const controller = new AbortController()
    abortRef.current = controller

    async function conectar() {
      try {
        const resp = await fetch(cotacoesApi.aoVivoStreamUrl(cotacaoId), {
          headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
          signal: controller.signal,
        })
        if (!resp.ok || !resp.body) return
        setConectado(true)
        const reader = resp.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const partes = buffer.split('\n\n')
          buffer = partes.pop() ?? ''
          for (const parte of partes) {
            const linhaDados = parte.split('\n').find((l) => l.startsWith('data:'))
            if (!linhaDados) continue
            try {
              const json = JSON.parse(linhaDados.slice(5).trim()) as GridAoVivoDTO
              setLive(json)
              qc.setQueryData(['cotacao', cotacaoId, 'ao-vivo'], json)
            } catch {
              /* ignora frames que não são JSON (ex.: comentário de keep-alive) */
            }
          }
        }
      } catch {
        /* stream encerrado ou indisponível — mantém o polling como fallback */
      } finally {
        setConectado(false)
      }
    }
    conectar()
    return () => controller.abort()
  }, [cotacaoId, qc])

  const grid = live ?? data
  if (isLoading && !grid) return <Spinner />
  if (!grid) return <EmptyState icon="bolt" title="Sem dados ao vivo" />

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      <Card className="shrink-0 p-space-lg flex items-center justify-between">
        <div>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider">
            Respostas {conectado && <span className="text-primary">· ao vivo</span>}
          </p>
          <p className="text-headline-lg font-headline-lg text-on-surface">
            {grid.respondidos ?? 0} / {grid.totalParticipantes ?? 0}
          </p>
        </div>
        <StatusBadge status={grid.status} />
      </Card>
      <Table containerClassName="flex-1 min-h-[350px] shadow-lg">
        <thead>
          <tr className="bg-[#1a231d] text-on-surface-variant font-label-md uppercase tracking-wider">
            <Th>Item</Th>
            <Th right>Menor preço unit.</Th>
            <Th>Lances por participante</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-body-md text-on-surface">
          {(grid.itens ?? []).map((item: ItemGrid) => (
            <tr key={item.itemCotacaoId} className="even:bg-white/[0.025] odd:bg-transparent hover:bg-white/[0.05] transition-colors">
              <Td>{item.nome}</Td>
              <Td right>{formatarMoeda(item.menorPrecoUnitario)}</Td>
              <Td>
                <div className="flex flex-wrap gap-space-xs">
                  {(item.precos ?? []).map((cel: Celula, i: number) => (
                    <span
                      key={i}
                      title={cel.empresa}
                      className={`px-2 py-0.5 rounded text-label-sm font-label-md ${
                        cel.status === 'COTADO'
                          ? 'bg-primary/10 text-primary'
                          : cel.status === 'NAO_COTADO'
                            ? 'bg-error/10 text-error'
                            : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {cel.empresa}: {cel.status === 'COTADO' ? formatarMoeda(cel.precoUnitario) : cel.status}
                    </span>
                  ))}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// ============================================================
// Aba Resultado
// ============================================================
function AbaResultado({ cotacaoId }: { cotacaoId: string }) {
  const { mostrar } = useToast()
  const { data, isLoading } = useQuery({ queryKey: ['cotacao', cotacaoId, 'resultado'], queryFn: () => cotacoesApi.resultado(cotacaoId) })

  const exportar = useMutation({
    mutationFn: () => baixarArquivo(cotacoesApi.resultadoXlsxUrl(cotacaoId), `resultado-${cotacaoId}.xlsx`),
    onSuccess: (r) => mostrar(r === 'assincrono' ? 'Exportação grande — você receberá por e-mail.' : 'Download iniciado.'),
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  if (isLoading) return <Spinner />
  if (!data || !data.pedidos || data.pedidos.length === 0)
    return <EmptyState icon="task_alt" title="Ainda não apurado" description="Encerre a cotação e apure os lances para ver o resultado aqui." />

  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => exportar.mutate()} disabled={exportar.isPending}>
          <Icon name="download" className="text-[16px]" />
          {exportar.isPending ? 'Exportando…' : 'Exportar XLSX'}
        </Button>
      </div>
      {data.pedidos.map((pedido) => (
        <Card key={pedido.id} className="p-space-lg">
          <div className="flex items-center justify-between mb-space-md">
            <h4 className="text-headline-sm font-headline-sm text-on-surface">{pedido.empresaNome}</h4>
            <span className="text-body-sm font-label-md text-primary">{formatarMoeda(pedido.total)}</span>
          </div>
          <div className="space-y-space-xs">
            {(pedido.itens ?? []).map((it) => (
              <div key={it.id} className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface">{it.nomeSnapshot}</span>
                <span className="text-on-surface-variant">{formatarMoeda(it.subtotal)}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
      {data.itensSemVencedor && data.itensSemVencedor.length > 0 && (
        <Card className="p-space-lg">
          <h4 className="text-headline-sm font-headline-sm text-error mb-space-sm">Itens sem vencedor</h4>
          <div className="space-y-space-xs">
            {data.itensSemVencedor.map((it) => (
              <div key={it.id} className="text-body-sm text-on-surface-variant">
                {it.nomeSnapshot}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
