import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cotacoesApi, empresasApi, participantesApi, pedidosApi, produtosApi, representantesApi } from './api-v2/endpoints'
import { getToken, baixarArquivo } from './api-v2/client'
import type { Celula, CotacaoResponse, GridAoVivoDTO, ItemGrid, ParticipanteDaCotacaoResponse, PedidoDTO, ResultadoDTO } from './api-v2/types'
import { aplicarMascaraTelefone } from '@/shared/utils/telefone'
import { Tooltip } from '@/shared/components/ui/tooltip'
import { HoverCard } from '@/shared/components/ui/HoverCard'
import { dataBr } from '@/shared/format/formatters'
import { sanitizarEntradaValor, valorParaNumero } from '@/shared/utils/preco'
import { useInsightProdutos } from '../../analise/analise.api'
import type { InsightProduto } from '../../analise/analise.schema'
import { montarMensagemConvite, urlWhatsApp } from '../compartilhar-link'
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
  SearchSelect,
} from './ui-v2'
import { useToast, mensagemErro } from './Toast-v2'
import { PrazoPickerModal } from './PrazoPickerModal'

export function IconeAoVivoTransmissao({ className = '' }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center w-[22px] h-[22px] shrink-0 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full text-primary drop-shadow-[0_0_8px_rgba(78,222,163,0.8)]"
      >
        {/* Ponto central que pulsa */}
        <motion.circle
          cx="12"
          cy="12"
          r="2.5"
          className="fill-primary"
          animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Antena / Onda interna */}
        <motion.path
          d="M8.5 8.5a5 5 0 0 0 0 7m7-7a5 5 0 0 1 0 7"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        {/* Antena / Onda externa */}
        <motion.path
          d="M5.5 5.5a9.5 9.5 0 0 0 0 13m13-13a9.5 9.5 0 0 1 0 13"
          animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
      </svg>
    </span>
  )
}

type Aba = 'itens' | 'participantes' | 'ao-vivo' | 'resultado'

const ABAS: { id: Aba; label: string; icon: string }[] = [
  { id: 'itens', label: 'Itens', icon: 'format_list_bulleted' },
  { id: 'participantes', label: 'Participantes', icon: 'groups' },
  { id: 'ao-vivo', label: 'Ao vivo', icon: 'sensors' },
  { id: 'resultado', label: 'Resultado', icon: 'military_tech' },
]

export function CotacaoDetalhePageV2() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { mostrar } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const abaParam = searchParams.get('aba') as Aba | null
  const aba: Aba =
    abaParam && ['itens', 'participantes', 'ao-vivo', 'resultado'].includes(abaParam)
      ? abaParam
      : 'itens'

  const setAba = (novaAba: Aba) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        p.set('aba', novaAba)
        return p
      },
      { replace: true }
    )
  }
  const [abrindoPrazo, setAbrindoPrazo] = useState(false)
  const [prorrogandoPrazo, setProrrogandoPrazo] = useState(false)

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
    mutationFn: (prazoIso: string) => cotacoesApi.abrir(id, { prazo: prazoIso }),
    onSuccess: () => {
      mostrar('Cotação aberta para recebimento de lances!')
      setAbrindoPrazo(false)
      invalidarCotacao()
      qc.invalidateQueries({ queryKey: ['cotacoes'] })
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const prorrogar = useMutation({
    mutationFn: (prazoIso: string) => cotacoesApi.alterarPrazo(id, { prazo: prazoIso }),
    onSuccess: () => {
      mostrar('Prazo da cotação prorrogado com sucesso!')
      setProrrogandoPrazo(false)
      invalidarCotacao()
      qc.invalidateQueries({ queryKey: ['cotacoes'] })
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const [encerrando, setEncerrando] = useState(false)

  async function handleEncerrar() {
    try {
      setEncerrando(true)
      mostrar('Encerrando cotação e finalizando participantes…')
      await cotacoesApi.encerrar(id)
      await invalidarCotacao()
      await qc.invalidateQueries({ queryKey: ['cotacoes'] })
      mostrar('Cotação encerrada com sucesso!')
      setAba('resultado')
    } catch (e) {
      mostrar(mensagemErro(e), 'erro')
    } finally {
      setEncerrando(false)
    }
  }

  const [executandoApuracao, setExecutandoApuracao] = useState(false)

  async function handleExecutarApuracao() {
    try {
      setExecutandoApuracao(true)
      mostrar('Verificando respostas e preparando apuração…')

      // 1. Busca os participantes da cotação e a grade ao vivo
      const [parts, grid] = await Promise.all([
        cotacoesApi.participantes(id).catch(() => []),
        cotacoesApi.aoVivo(id).catch(() => null),
      ])

      // 2. Identifica participantes que preencheram preço mas não finalizaram a resposta
      const pendentesComLance = (parts ?? []).filter(
        (p): p is typeof p & { participanteId: string } => {
          if (!p.participanteId) return false
          if (p.participanteStatus === 'RESPONDIDO') return false
          const temLanceCotado = (grid?.itens ?? []).some((item) =>
            (item.precos ?? []).some(
              (c) =>
                c.status === 'COTADO' &&
                ((c.participanteId && c.participanteId === p.participanteId) ||
                  (c.empresa && p.empresaNome && c.empresa === p.empresaNome))
            )
          )
          return temLanceCotado
        }
      )

      // 3. Finaliza todos em massa antes de apurar
      if (pendentesComLance.length > 0) {
        await Promise.allSettled(
          pendentesComLance
            .filter((p) => Boolean(p.participanteId))
            .map((p) => participantesApi.finalizar(p.participanteId!))
        )
      }

      // 4. Executa a apuração no backend
      await cotacoesApi.apurar(id)
      await qc.invalidateQueries({ queryKey: ['cotacao', id] })
      mostrar('Cotação apurada e pedidos gerados com sucesso!')
    } catch (e) {
      mostrar(mensagemErro(e), 'erro')
    } finally {
      setExecutandoApuracao(false)
    }
  }

  if (isLoading) return <Spinner />
  if (!cotacao) return <EmptyState icon="error" title="Cotação não encontrada" />

  const status = cotacao.status

  return (
    <div className="flex flex-col min-h-0 flex-1 max-w-7xl mx-auto w-full h-full min-w-0 overflow-x-hidden">
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
              <>
                <Button variant="ghost" onClick={() => setProrrogandoPrazo(true)}>
                  <Icon name="schedule" className="text-[16px]" /> Prorrogar Prazo
                </Button>
                <Button onClick={handleEncerrar} disabled={encerrando}>
                  <Icon name="stop" className="text-[16px]" /> {encerrando ? 'Encerrando…' : 'Encerrar Cotação'}
                </Button>
              </>
            )}
            {status === 'ENCERRADA' && (
              <>
                <Button onClick={handleExecutarApuracao} disabled={executandoApuracao || acao.isPending}>
                  <Icon name="task_alt" className="text-[16px]" /> {executandoApuracao ? 'Apurando…' : 'Apurar'}
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

        <div className="flex items-center gap-1 sm:gap-2 pt-2 border-t border-white/5 relative">
          {ABAS.map((a) => {
            const ativa = aba === a.id
            return (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={`relative px-4 py-2.5 rounded-t-lg transition-colors duration-200 cursor-pointer flex items-center gap-2 text-sm sm:text-[15px] select-none ${
                  ativa
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant/70 font-medium hover:text-on-surface hover:bg-white/[0.04]'
                }`}
              >
                {/* Fundo ativo deslizante com layoutId */}
                {ativa && (
                  <motion.span
                    layoutId="aba-ativa-fundo"
                    className="absolute inset-0 bg-primary/10 rounded-t-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                {/* Ícone */}
                {a.id === 'ao-vivo' ? (
                  <IconeAoVivoTransmissao className="relative z-10" />
                ) : (
                  <Icon
                    name={a.icon}
                    className={`relative z-10 text-[19px] transition-transform duration-200 ${
                      ativa ? 'text-primary drop-shadow-[0_0_8px_rgba(78,222,163,0.6)] scale-105' : 'text-on-surface-variant/60'
                    }`}
                  />
                )}

                {/* Texto com brilho se ativa */}
                <span className={`relative z-10 transition-colors duration-200 ${ativa ? 'drop-shadow-[0_0_10px_rgba(78,222,163,0.5)]' : ''}`}>
                  {a.label}
                </span>

                {/* Barra inferior deslizante com gradiente, glow e animação suave */}
                {ativa && (
                  <motion.span
                    layoutId="aba-ativa-barra"
                    className="absolute -bottom-[2px] left-1 right-1 h-[3px] rounded-full bg-gradient-to-r from-emerald-400 via-primary to-teal-300 shadow-[0_0_12px_rgba(78,222,163,0.85),0_0_20px_rgba(78,222,163,0.4)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 📌 CONTEÚDO PRINCIPAL (COM SCROLL INTERNO CONTROLADO POR CADA ABA) */}
      <div className="flex-1 min-h-0 flex flex-col min-w-0 w-full overflow-hidden mt-2 pb-2">
        <motion.div
          key={aba}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 min-h-0 flex flex-col min-w-0 w-full overflow-hidden"
        >
          {aba === 'itens' && <AbaItens cotacaoId={id} itens={cotacao.itens ?? []} editavel={status !== 'PEDIDOS_GERADOS' && status !== 'CANCELADA'} />}
          {aba === 'participantes' && <AbaParticipantes cotacaoId={id} cotacao={cotacao} editavel={status === 'RASCUNHO' || status === 'ABERTA'} />}
          {aba === 'ao-vivo' && (
            <AbaAoVivo
              cotacaoId={id}
              cotacao={cotacao}
              editavel={status !== 'PEDIDOS_GERADOS' && status !== 'CANCELADA'}
              onEncerrar={handleEncerrar}
              encerrando={encerrando}
              onProrrogarPrazo={() => setProrrogandoPrazo(true)}
              onIrParaResultado={() => setAba('resultado')}
            />
          )}
          {aba === 'resultado' && (
            <AbaResultado
              cotacaoId={id}
              cotacao={cotacao}
              onApurar={handleExecutarApuracao}
              apurando={executandoApuracao || acao.isPending}
              onEncerrar={handleEncerrar}
              encerrando={encerrando}
              onReabrir={() => acao.mutate(() => cotacoesApi.reabrir(id))}
              reabrindo={acao.isPending}
              onIrParaAoVivo={() => setAba('ao-vivo')}
            />
          )}
        </motion.div>
      </div>

      <PrazoPickerModal
        open={abrindoPrazo}
        onClose={() => setAbrindoPrazo(false)}
        onConfirmar={(prazoIso) => abrir.mutate(prazoIso)}
        submitting={abrir.isPending}
        titulo="Abrir Cotação para Lances"
        descricao="Defina a data e hora limite para os representantes convidados enviarem suas cotações."
        submitLabel="Abrir Cotação"
        totalItens={cotacao.itens?.length}
      />

      <PrazoPickerModal
        open={prorrogandoPrazo}
        onClose={() => setProrrogandoPrazo(false)}
        onConfirmar={(prazoIso) => prorrogar.mutate(prazoIso)}
        submitting={prorrogar.isPending}
        titulo="Prorrogar Prazo da Cotação"
        descricao="Estenda o período de recebimento de lances para permitir que mais fornecedores participem."
        submitLabel="Confirmar Novo Prazo"
        prazoInicialIso={cotacao.prazo}
        totalItens={cotacao.itens?.length}
      />
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
                <div className="flex items-center gap-1.5">
                  <Icon name="inventory_2" className="text-base text-primary shrink-0" />
                  <span>Produto</span>
                </div>
              </Th>
              <Th
                onResize={(e) => iniciarRedimensionamento('codigoBarras', e)}
                onDoubleClickResize={() => resetarColuna('codigoBarras')}
              >
                <div className="flex items-center gap-1.5">
                  <Icon name="qr_code" className="text-base text-primary shrink-0" />
                  <span>Código de barras</span>
                </div>
              </Th>
              <Th
                onResize={(e) => iniciarRedimensionamento('embalagem', e)}
                onDoubleClickResize={() => resetarColuna('embalagem')}
              >
                <div className="flex items-center gap-1.5">
                  <Icon name="package_2" className="text-base text-primary shrink-0" />
                  <span>Embalagem</span>
                </div>
              </Th>
              <Th
                right
                onResize={(e) => iniciarRedimensionamento('quantidade', e)}
                onDoubleClickResize={() => resetarColuna('quantidade')}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <Icon name="pin" className="text-base text-primary shrink-0" />
                  <span>Qtd. Solicitada</span>
                </div>
              </Th>
              {editavel && (
                <Th right>
                  <div className="flex items-center justify-end gap-1.5">
                    <Icon name="tune" className="text-base text-primary shrink-0" />
                    <span>Ações</span>
                  </div>
                </Th>
              )}
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
function getLinkCorrigido(link?: string): string {
  if (!link) return ''
  try {
    const url = new URL(link)
    return window.location.origin + url.pathname + url.search + url.hash
  } catch {
    return link.startsWith('/') ? window.location.origin + link : link
  }
}

function IconeWhatsApp({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 inline-block ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
      aria-hidden="true"
    >
      <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1.01 2.55.12.17 1.74 2.66 4.21 3.73.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31z" />
    </svg>
  )
}

function AbaParticipantes({
  cotacaoId,
  cotacao,
  editavel,
}: {
  cotacaoId: string
  cotacao?: CotacaoResponse
  editavel: boolean
}) {
  const qc = useQueryClient()
  const { mostrar } = useToast()
  const { data, isLoading } = useQuery({
    queryKey: ['cotacao', cotacaoId, 'participantes'],
    queryFn: () => cotacoesApi.participantes(cotacaoId),
  })

  // Modal de Confirmação para Desconvidar
  const [alvoDesconvidar, setAlvoDesconvidar] = useState<{ participanteId: string; nome: string } | null>(null)

  // Filtro na tela de participantes
  const [busca, setBusca] = useState('')

  // Carrega empresas e representantes cadastrados para o seletor inline
  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: empresasApi.listar,
    enabled: editavel,
  })
  const { data: representantes } = useQuery({
    queryKey: ['representantes'],
    queryFn: representantesApi.listar,
    enabled: editavel,
  })

  // Mapa de empresaId -> Representante principal
  const repsPorEmpresa = useMemo(() => {
    const map = new Map<string, any>()
    for (const r of representantes ?? []) {
      if (r.empresaId && (!map.has(r.empresaId) || r.ativo)) {
        map.set(r.empresaId, r)
      }
    }
    return map
  }, [representantes])

  // IDs de empresas já participantes
  const jaParticipantesIds = useMemo(() => {
    return new Set((data ?? []).map((p) => p.empresaId).filter(Boolean))
  }, [data])

  const invalidar = () => qc.invalidateQueries({ queryKey: ['cotacao', cotacaoId, 'participantes'] })

  const convidar = useMutation({
    mutationFn: (empresaId: string) => cotacoesApi.convidarParticipantes(cotacaoId, { empresaIds: [empresaId] }),
    onSuccess: () => {
      mostrar('Fornecedor adicionado à cotação!')
      invalidar()
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const cotacaoAberta = cotacao?.status === 'ABERTA'

  const desconvidar = useMutation({
    mutationFn: (participanteId: string) => participantesApi.desconvidar(participanteId),
    onSuccess: () => {
      mostrar(cotacaoAberta ? 'Participante desconvidado e link revogado.' : 'Fornecedor removido da cotação.')
      setAlvoDesconvidar(null)
      invalidar()
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const reenviar = useMutation({
    mutationFn: (participanteId: string) => participantesApi.reenviarConvite(participanteId),
    onSuccess: () => mostrar('Convite reenviado por e-mail com sucesso!'),
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const reabrirParticipante = useMutation({
    mutationFn: (participanteId: string) => participantesApi.reabrir(participanteId),
    onSuccess: () => {
      mostrar('Cotação reaberta para o participante.')
      invalidar()
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  const finalizarParticipante = useMutation({
    mutationFn: (participanteId: string) => participantesApi.finalizar(participanteId),
    onSuccess: () => {
      mostrar('Cotação finalizada em nome do participante.')
      invalidar()
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  // Estatísticas
  const participantesLista = useMemo(() => data ?? [], [data])
  const total = participantesLista.length
  const respondidos = participantesLista.filter((p) => p.participanteStatus === 'RESPONDIDO').length
  const visualizados = participantesLista.filter((p) => p.participanteStatus === 'VISUALIZOU').length
  const pendentes = participantesLista.filter((p) => p.participanteStatus === 'CONVIDADO' || !p.participanteStatus).length

  // Filtro dos participantes exibidos
  const participantesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return participantesLista
    return participantesLista.filter(
      (p) =>
        p.empresaNome?.toLowerCase().includes(termo) ||
        p.representanteNome?.toLowerCase().includes(termo) ||
        p.emailRepresentante?.toLowerCase().includes(termo) ||
        p.whatsappRepresentante?.includes(termo)
    )
  }, [participantesLista, busca])

  // Empresas disponíveis para adição inline
  const empresasDisponiveis = useMemo(() => {
    if (!empresas) return []
    return empresas.filter((e) => e.ativo !== false && !jaParticipantesIds.has(e.id))
  }, [empresas, jaParticipantesIds])

  if (isLoading) return <Spinner />

  return (
    <div className="max-w-5xl w-full mx-auto flex flex-col gap-5 pb-10">
      {/* 📊 MINI-INDICADORES DE STATUS */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#1a211d] border border-white/5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">Total convidados</span>
              <span className="text-xl font-bold text-[#dde4dd]">{total}</span>
            </div>
            <Icon name="send" className="text-xl text-on-surface-variant/40" />
          </div>

          <div className="p-3.5 bg-[#1a211d] border border-white/5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#4edea3] uppercase tracking-wider block">Responderam</span>
              <span className="text-xl font-bold text-[#4edea3]">{respondidos}</span>
            </div>
            <Icon name="check_circle" className="text-xl text-[#4edea3]/40" />
          </div>

          <div className="p-3.5 bg-[#1a211d] border border-white/5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#f59e0b] uppercase tracking-wider block">Visualizaram</span>
              <span className="text-xl font-bold text-[#f59e0b]">{visualizados}</span>
            </div>
            <Icon name="visibility" className="text-xl text-[#f59e0b]/40" />
          </div>

          <div className="p-3.5 bg-[#1a211d] border border-white/5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#86948a] uppercase tracking-wider block">Aguardando</span>
              <span className="text-xl font-bold text-[#86948a]">{pendentes}</span>
            </div>
            <Icon name="schedule" className="text-xl text-[#86948a]/40" />
          </div>
        </div>
      )}

      {/* 🛠️ BARRA DE FERRAMENTAS: ADICIONAR FORNECEDOR INLINE + BUSCA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {editavel ? (
          <div className="flex-1 max-w-md">
            <SearchSelect
              value=""
              onChange={(empresaId) => {
                if (empresaId) convidar.mutate(empresaId)
              }}
              options={empresasDisponiveis.map((e) => {
                const rep = repsPorEmpresa.get(e.id || '')
                return {
                  value: e.id!,
                  label: e.nome || 'Fornecedor',
                  sublabel: rep?.nome
                    ? `${rep.nome}${rep.whatsapp ? ` • ${aplicarMascaraTelefone(rep.whatsapp)}` : ''}`
                    : undefined,
                }
              })}
              placeholder="➕ Digite para buscar e adicionar fornecedor…"
              emptyMessage="Nenhum fornecedor disponível encontrado."
              itemPlural="fornecedores"
            />
          </div>
        ) : (
          <div />
        )}

        {/* Busca rápida se houver participantes */}
        {total > 2 && (
          <div className="relative w-full sm:w-72">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Filtrar fornecedor…"
              className="w-full bg-[#1e2520] text-sm text-[#dde4dd] placeholder:text-on-surface-variant/70 rounded-xl pl-9 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-primary"
            />
          </div>
        )}
      </div>

      {/* 📋 LISTA/TABELA DE PARTICIPANTES */}
      {total === 0 ? (
        <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl bg-[#161d19]">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant mx-auto mb-3">
            <Icon name="groups" className="text-2xl opacity-60" />
          </div>
          <h4 className="text-base font-bold text-[#dde4dd] font-headline-sm">Nenhum fornecedor adicionado à cotação</h4>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1">
            {editavel
              ? 'Use o campo de busca acima para selecionar e adicionar os fornecedores participantes.'
              : 'Esta cotação não possui fornecedores participantes.'}
          </p>
        </div>
      ) : (
        <Table containerClassName="shadow-md border border-white/15 rounded-none max-h-[560px] flex flex-col" tableClassName="w-full">
          <thead>
            <tr className="bg-[#1a231d] sticky top-0 z-10">
              <Th className="w-[46%]">
                <div className="flex items-center gap-1.5">
                  <Icon name="storefront" className="text-base text-primary shrink-0" />
                  <span>Empresa / Representante</span>
                </div>
              </Th>
              <Th center className="w-[16%]">
                <div className="flex items-center justify-center gap-1.5">
                  <Icon name="flag" className="text-base text-primary shrink-0" />
                  <span>Status</span>
                </div>
              </Th>
              <Th className="w-[16%]">
                <div className="flex items-center gap-1.5">
                  <Icon name="event" className="text-base text-primary shrink-0" />
                  <span>Data</span>
                </div>
              </Th>
              <Th right className="w-[22%]">
                <div className="flex items-center justify-end gap-1.5">
                  <Icon name="tune" className="text-base text-primary shrink-0" />
                  <span>Ações</span>
                </div>
              </Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm">
            {participantesFiltrados.map((p: ParticipanteDaCotacaoResponse) => {
              const linkCompleto = getLinkCorrigido(p.linkMagico)
              const msgCompartilhar = montarMensagemConvite({
                representanteNome: p.representanteNome || 'Representante',
                titulo: cotacao?.titulo ?? 'Cotação',
                empresaNome: p.empresaNome ?? 'Fornecedor',
                prazo: cotacao?.prazo ?? null,
                link: linkCompleto,
              })

              return (
                <tr
                  key={p.participanteId}
                  className="even:bg-white/[0.02] odd:bg-transparent hover:bg-white/[0.05] transition-colors"
                >
                  {/* Empresa / Representante unificados */}
                  <Td className="py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded bg-[#242c27] text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-white/10">
                        {p.empresaNome?.slice(0, 2) || 'FO'}
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-[#dde4dd] block truncate">
                          {p.empresaNome}
                        </span>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1.5 truncate mt-0.5">
                          <Icon name="person" className="text-xs opacity-70" />
                          {p.representanteNome || 'Sem representante vinculado'}
                          {p.whatsappRepresentante && (
                            <span className="text-on-surface-variant/70">
                              • {aplicarMascaraTelefone(p.whatsappRepresentante)}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </Td>

                  {/* Status */}
                  <Td center>
                    <div className="inline-flex items-center gap-1">
                      {p.participanteStatus === 'RESPONDIDO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30">
                          <Icon name="check_circle" className="text-xs" />
                          Respondeu
                        </span>
                      ) : p.participanteStatus === 'VISUALIZOU' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                          <Icon name="visibility" className="text-xs" />
                          Visualizou
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-on-surface-variant border border-white/10">
                          <Icon name="schedule" className="text-xs" />
                          Aguardando
                        </span>
                      )}
                      {p.conviteStatus === 'FALHOU' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-error/15 text-error border border-error/30" title="Falha no disparo do e-mail automático">
                          !
                        </span>
                      )}
                    </div>
                  </Td>

                  {/* Data */}
                  <Td muted className="text-xs whitespace-nowrap">
                    {p.respondidoEm
                      ? formatarData(p.respondidoEm)
                      : p.visualizadoEm
                        ? formatarData(p.visualizadoEm)
                        : p.conviteEnviadoEm
                          ? formatarData(p.conviteEnviadoEm)
                          : '—'}
                  </Td>

                  {/* Ações (WhatsApp, E-mail, Copiar Link, Reabrir/Finalizar, Desconvidar) */}
                  <Td right>
                    <div className="flex items-center justify-end gap-1">
                      {/* WhatsApp com Tooltip customizado */}
                      <Tooltip
                        content={
                          p.whatsappRepresentante
                            ? `Enviar WhatsApp para ${aplicarMascaraTelefone(p.whatsappRepresentante)}`
                            : 'Abrir WhatsApp com link da cotação'
                        }
                        delay={80}
                        side="top"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const url = urlWhatsApp(msgCompartilhar, p.whatsappRepresentante)
                            window.open(url, '_blank')
                          }}
                          className="p-1.5 rounded-lg text-[#25D366] hover:bg-[#25D366]/15 transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <IconeWhatsApp size={16} />
                        </button>
                      </Tooltip>

                      {/* Reenviar E-mail oficial pelo sistema */}
                      <IconButton
                        icon="mail"
                        title={
                          p.emailRepresentante
                            ? `Reenviar convite por e-mail para ${p.emailRepresentante}`
                            : 'Reenviar convite por e-mail pelo sistema'
                        }
                        disabled={reenviar.isPending}
                        onClick={() => reenviar.mutate(p.participanteId!)}
                      />

                      {/* Copiar Link */}
                      <IconButton
                        icon="content_copy"
                        title="Copiar link mágico da cotação"
                        onClick={() => {
                          if (linkCompleto) {
                            navigator.clipboard.writeText(linkCompleto)
                            mostrar('Link copiado para a área de transferência!')
                          } else {
                            mostrar('Link ainda não disponível.', 'erro')
                          }
                        }}
                      />

                      {/* Reabrir ou Finalizar resposta */}
                      {p.participanteStatus === 'RESPONDIDO' ? (
                        <IconButton
                          icon="restart_alt"
                          title="Reabrir cotação para o participante"
                          disabled={reabrirParticipante.isPending}
                          onClick={() => reabrirParticipante.mutate(p.participanteId!)}
                        />
                      ) : (
                        <IconButton
                          icon="task_alt"
                          title="Finalizar cotação em nome do participante"
                          disabled={finalizarParticipante.isPending}
                          onClick={() => finalizarParticipante.mutate(p.participanteId!)}
                        />
                      )}

                      {/* Desconvidar */}
                      {editavel && (
                        <IconButton
                          icon="person_remove"
                          danger
                          title={cotacaoAberta ? 'Desconvidar participante (revoga link mágico)' : 'Remover fornecedor da cotação'}
                          disabled={desconvidar.isPending}
                          onClick={() => {
                            if (cotacaoAberta) {
                              setAlvoDesconvidar({
                                participanteId: p.participanteId!,
                                nome: p.empresaNome || 'Fornecedor',
                              })
                            } else {
                              desconvidar.mutate(p.participanteId!)
                            }
                          }}
                        />
                      )}
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}

      {/* ⚠️ DIÁLOGO DE CONFIRMAÇÃO PARA DESCONVIDAR */}
      <Modal
        open={alvoDesconvidar !== null}
        onClose={() => setAlvoDesconvidar(null)}
        title="Desconvidar Fornecedor"
        width="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface">
            Tem certeza que deseja desconvidar <strong>{alvoDesconvidar?.nome}</strong> desta cotação?
          </p>
          <p className="text-xs text-error/90 bg-error/10 p-3 rounded-xl border border-error/20">
            O link mágico de acesso do representante será revogado imediatamente e eventuais preços preenchidos serão desconsiderados na apuração.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAlvoDesconvidar(null)}>
              Cancelar
            </Button>
            <Button
              disabled={desconvidar.isPending}
              onClick={() => alvoDesconvidar && desconvidar.mutate(alvoDesconvidar.participanteId)}
              className="bg-error text-on-error hover:brightness-110 font-bold"
            >
              {desconvidar.isPending ? 'Removendo…' : 'Sim, desconvidar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function formatarEmbalagemDesc(qtdPorEmbalagem?: number | null, unidade?: string | null): string {
  const uTexto = (unidade || '').trim()
  if (uTexto) {
    let limpo = uTexto
      .replace(/\s*[cC]\/\s*/g, '/')
      .replace(/^caixa\//i, 'cx/')
      .replace(/^fardo\//i, 'fardo/')
      .replace(/^pacote\//i, 'pct/')
    if (limpo.includes('/')) {
      if (!limpo.toLowerCase().includes('un')) {
        limpo += ' un'
      }
      return limpo.toLowerCase()
    }
  }

  if (!qtdPorEmbalagem || qtdPorEmbalagem <= 1) {
    return 'unidade individual'
  }
  const u = (unidade || '').toUpperCase()
  if (u.includes('FD') || u.includes('FARDO')) {
    return `fardo/${qtdPorEmbalagem} un`
  }
  if (u.includes('PCT') || u.includes('PACOTE')) {
    return `pct/${qtdPorEmbalagem} un`
  }
  return `cx/${qtdPorEmbalagem} un`
}

function rotuloUnidade(qtd: number, qtdPorEmbalagem?: number | null, unidade?: string | null): string {
  const u = (unidade || '').toUpperCase()
  if (u.includes('FD') || u.includes('FARDO')) {
    return qtd === 1 ? 'fardo' : 'fardos'
  }
  if (u.includes('PCT') || u.includes('PACOTE')) {
    return qtd === 1 ? 'pct' : 'pcts'
  }
  if ((qtdPorEmbalagem && qtdPorEmbalagem > 1) || u.includes('CX') || u.includes('CAIXA')) {
    return qtd === 1 ? 'caixa' : 'caixas'
  }
  return 'un'
}

interface ItemComQuantidadeEditavel {
  itemCotacaoId?: string
  nome?: string
  quantidadeSolicitada?: number
  quantidadePorEmbalagem?: number
  unidade?: string
}

function CampoQuantidadeInline({
  item,
  editavel,
  aoAtualizar,
  atualizando,
  alinhamento = 'end',
}: {
  item: ItemComQuantidadeEditavel
  editavel: boolean
  aoAtualizar: (itemId: string, qtd: number) => void
  atualizando: boolean
  alinhamento?: 'center' | 'end'
}) {
  const qtdAtual = item.quantidadeSolicitada ?? 1
  const [qtdAnterior, setQtdAnterior] = useState(qtdAtual)
  const [valor, setValor] = useState(String(qtdAtual))
  const [focado, setFocado] = useState(false)

  if (qtdAtual !== qtdAnterior) {
    setQtdAnterior(qtdAtual)
    if (!focado) {
      setValor(String(qtdAtual))
    }
  }

  function confirmar(novo?: number) {
    const num = novo !== undefined ? novo : parseInt(valor, 10)
    if (Number.isInteger(num) && num >= 1) {
      if (num !== qtdAtual) {
        aoAtualizar(item.itemCotacaoId!, num)
      } else {
        setValor(String(qtdAtual))
      }
    } else {
      setValor(String(qtdAtual))
    }
  }

  const rotulo = rotuloUnidade(qtdAtual, item.quantidadePorEmbalagem, item.unidade)

  if (!editavel) {
    return (
      <span
        className={`text-xs font-semibold text-on-surface tabular-nums inline-flex items-center gap-1.5 ${
          alinhamento === 'center' ? 'justify-center' : 'justify-end'
        }`}
      >
        <span>{qtdAtual}</span>
        <span className="min-w-[38px] shrink-0 text-left text-[11px] text-on-surface-variant/80 font-medium">
          {rotulo}
        </span>
      </span>
    )
  }

  return (
    <div
      className={`shrink-0 flex items-center gap-1.5 ${
        alinhamento === 'center' ? 'justify-center w-full' : 'w-[160px] justify-end'
      }`}
    >
      {alinhamento !== 'center' && (
        <span className="text-[11px] text-on-surface-variant/70 font-medium">Qtd:</span>
      )}
      <div className="inline-flex items-center rounded-lg border border-white/15 bg-black/40 overflow-hidden shadow-inner shrink-0">
        <button
          type="button"
          disabled={atualizando || qtdAtual <= 1}
          onClick={() => {
            const prox = Math.max(1, qtdAtual - 1)
            setValor(String(prox))
            confirmar(prox)
          }}
          className="h-6 w-6 bg-white/5 hover:bg-white/15 text-on-surface-variant hover:text-on-surface flex items-center justify-center text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
          title="Diminuir 1"
        >
          -
        </button>
        <input
          type="number"
          min={1}
          value={valor}
          disabled={atualizando}
          onFocus={() => setFocado(true)}
          onChange={(e) => setValor(e.target.value)}
          onBlur={() => {
            setFocado(false)
            confirmar()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          className="h-6 w-12 sm:w-14 bg-transparent text-center text-xs font-bold text-primary tabular-nums focus:outline-none focus:bg-white/5 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          disabled={atualizando}
          onClick={() => {
            const prox = qtdAtual + 1
            setValor(String(prox))
            confirmar(prox)
          }}
          className="h-6 w-6 bg-white/5 hover:bg-white/15 text-on-surface-variant hover:text-on-surface flex items-center justify-center text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
          title="Aumentar 1"
        >
          +
        </button>
      </div>
      <span className="min-w-[38px] shrink-0 text-left text-[11px] text-primary/80 font-medium truncate">
        {rotulo}
      </span>
    </div>
  )
}

// ============================================================
// Balão de Informações e Histórico do Produto (Insight)
// ============================================================
function BalaoInsightProduto({
  nome,
  embalagemDesc,
  quantidadePorEmbalagem,
  menorPrecoUnitarioAtual,
  item,
  insight,
}: {
  nome: string
  embalagemDesc: string
  quantidadePorEmbalagem: number
  menorPrecoUnitarioAtual: number | null
  item: ItemGrid
  insight?: InsightProduto | null
}) {
  const precoUnitarioAnterior = insight?.ultimaCompra?.precoUnitario ?? item.ultimoPrecoUnitario ?? null
  const fornecedorAnterior = insight?.ultimaCompra?.empresa ?? item.ultimaCompraEmpresa ?? null
  const dataAnterior = insight?.ultimaCompra?.data ?? item.ultimaCompraEm ?? null
  const qtdAnterior = insight?.ultimaCompra?.quantidade ?? null
  const representanteAnterior = insight?.ultimaCompra?.representante ?? null

  const temHistorico = precoUnitarioAnterior != null && precoUnitarioAnterior > 0

  // Comparação com o menor preço da cotação atual
  let variacaoCotacaoAtual: number | null = null
  if (temHistorico && menorPrecoUnitarioAtual != null && menorPrecoUnitarioAtual > 0) {
    variacaoCotacaoAtual = ((menorPrecoUnitarioAtual - precoUnitarioAnterior) / precoUnitarioAnterior) * 100
  }

  const menorHistorico = insight?.menorPrecoUnitario ?? null
  const media90d = insight?.precoMedioUnitario90d ?? null

  return (
    <div className="w-80 rounded-xl bg-[#121c16] border border-white/20 p-3.5 shadow-2xl text-on-surface backdrop-blur-xl pointer-events-auto select-none">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold text-on-surface truncate" title={nome}>
            {nome}
          </div>
          <div className="text-[11px] text-on-surface-variant/70 mt-0.5">
            {embalagemDesc}
          </div>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/25 text-primary">
          Histórico
        </span>
      </div>

      {/* Dados da Compra Anterior */}
      {temHistorico ? (
        <div className="space-y-3">
          {/* Preço e Comparativo */}
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider font-semibold">
                Último preço pago
              </div>
              <div className="text-lg font-bold text-on-surface tabular-nums">
                {formatarMoeda(precoUnitarioAnterior)}
                <span className="text-xs font-normal text-on-surface-variant/60 ml-1">/ un</span>
              </div>
              {quantidadePorEmbalagem > 1 && (
                <div className="text-[10.5px] text-on-surface-variant/60">
                  {formatarMoeda(precoUnitarioAnterior * quantidadePorEmbalagem)} / emb
                </div>
              )}
            </div>

            {variacaoCotacaoAtual != null && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold ${
                  variacaoCotacaoAtual < 0
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : variacaoCotacaoAtual > 0
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-white/10 text-on-surface-variant'
                }`}
              >
                <Icon
                  name={variacaoCotacaoAtual < 0 ? 'trending_down' : variacaoCotacaoAtual > 0 ? 'trending_up' : 'remove'}
                  className="text-[14px]"
                />
                <span>
                  {variacaoCotacaoAtual < 0
                    ? `Economia de ${Math.abs(variacaoCotacaoAtual).toFixed(1)}%`
                    : `+${variacaoCotacaoAtual.toFixed(1)}%`}
                </span>
              </div>
            )}
          </div>

          {/* Cartão com Fornecedor, Quantidade e Data */}
          <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-on-surface-variant/80 gap-2">
              <span className="shrink-0">Fornecedor:</span>
              <span className="font-semibold text-on-surface truncate max-w-[170px]" title={fornecedorAnterior ?? '—'}>
                {fornecedorAnterior || 'Não informado'}
                {representanteAnterior ? ` (${representanteAnterior})` : ''}
              </span>
            </div>
            {qtdAnterior != null && qtdAnterior > 0 && (
              <div className="flex items-center justify-between text-on-surface-variant/80">
                <span>Última quantidade:</span>
                <span className="font-semibold text-on-surface tabular-nums">{qtdAnterior} un</span>
              </div>
            )}
            {dataAnterior && (
              <div className="flex items-center justify-between text-on-surface-variant/80">
                <span>Data da compra:</span>
                <span className="font-semibold text-on-surface tabular-nums">{dataBr(dataAnterior)}</span>
              </div>
            )}
          </div>

          {/* Menor Histórico e Média 90d */}
          {(menorHistorico != null || media90d != null) && (
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {menorHistorico != null && (
                <div className="rounded-md bg-white/[0.02] border border-white/5 p-2">
                  <div className="text-[10px] text-on-surface-variant/60 uppercase font-semibold">Menor já pago</div>
                  <div className="text-xs font-bold text-on-surface mt-0.5 tabular-nums">
                    {formatarMoeda(menorHistorico)}
                  </div>
                </div>
              )}
              {media90d != null && (
                <div className="rounded-md bg-white/[0.02] border border-white/5 p-2">
                  <div className="text-[10px] text-on-surface-variant/60 uppercase font-semibold">Média 90 dias</div>
                  <div className="text-xs font-bold text-on-surface mt-0.5 tabular-nums">
                    {formatarMoeda(media90d)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 text-center">
          <Icon name="history_toggle_off" className="text-3xl text-on-surface-variant/30 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-on-surface">Sem compra anterior</p>
          <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
            Este item ainda não possui histórico registrado no sistema.
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Aba Ao vivo — polling + SSE real (fetch + ReadableStream)
// Grid dinâmico com colunas por empresa, células de preço
// embalagem/unitário, destaque do líder e fixação sticky
// ============================================================
function AbaAoVivo({
  cotacaoId,
  cotacao,
  editavel = false,
  onEncerrar,
  encerrando,
  onProrrogarPrazo,
  onIrParaResultado,
}: {
  cotacaoId: string
  cotacao?: CotacaoResponse
  editavel?: boolean
  onEncerrar?: () => void
  encerrando?: boolean
  onProrrogarPrazo?: () => void
  onIrParaResultado?: () => void
}) {
  const qc = useQueryClient()
  const { mostrar } = useToast()
  const [live, setLive] = useState<GridAoVivoDTO | null>(null)
  const [conectado, setConectado] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Mapeamento de itemCotacaoId -> produtoId para carregar insights históricos
  const produtoIdPorItemCotacao = useMemo(() => {
    const map = new Map<string, string>()
    for (const it of cotacao?.itens ?? []) {
      if (it.id && it.produtoId) {
        map.set(it.id, it.produtoId)
      }
    }
    return map
  }, [cotacao?.itens])

  const produtoIds = useMemo(() => {
    return Array.from(
      new Set((cotacao?.itens?.map((it) => it.produtoId).filter(Boolean) as string[]) ?? [])
    )
  }, [cotacao?.itens])

  const { data: insightsMap } = useInsightProdutos(produtoIds)

  // Estado e mutação de correção de lances pelo comprador
  const [lanceParaCorrigir, setLanceParaCorrigir] = useState<{
    item: ItemGrid
    celula?: Celula
    participanteId: string
    empresa: string
  } | null>(null)

  const [precoCorrecao, setPrecoCorrecao] = useState('')
  const [naoCotadoCorrecao, setNaoCotadoCorrecao] = useState(false)
  const [erroCorrecao, setErroCorrecao] = useState<string | null>(null)

  function abrirCorrecao(item: ItemGrid, cel?: Celula, colParticipanteId?: string, colEmpresa?: string) {
    if (!editavel) return
    const partId = cel?.participanteId || colParticipanteId
    if (!partId || !item.itemCotacaoId) return
    const empresaNome = cel?.empresa || colEmpresa || 'Fornecedor'
    const precoStr = cel?.preco != null && cel.status === 'COTADO' ? cel.preco.toFixed(2).replace('.', ',') : ''
    setPrecoCorrecao(precoStr)
    setNaoCotadoCorrecao(cel?.status === 'NAO_COTADO')
    setErroCorrecao(null)
    setLanceParaCorrigir({
      item,
      celula: cel,
      participanteId: partId,
      empresa: empresaNome,
    })
  }

  const mutCorrigirLance = useMutation({
    mutationFn: async () => {
      if (!lanceParaCorrigir?.item?.itemCotacaoId) return
      const valor = valorParaNumero(precoCorrecao)
      if (!naoCotadoCorrecao && (isNaN(valor) || valor <= 0)) {
        throw new Error('Informe um valor de preço válido (maior que zero) ou marque como não cotado.')
      }
      await participantesApi.corrigirLance(
        lanceParaCorrigir.participanteId,
        lanceParaCorrigir.item.itemCotacaoId,
        {
          preco: naoCotadoCorrecao ? undefined : valor,
          naoCotado: naoCotadoCorrecao,
        }
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cotacao', cotacaoId, 'ao-vivo'] })
      mostrar('Lance corrigido com sucesso!')
      setLanceParaCorrigir(null)
    },
    onError: (e) => setErroCorrecao(mensagemErro(e)),
  })

  const mutAtualizarQtd = useMutation({
    mutationFn: ({ itemId, quantidade }: { itemId: string; quantidade: number }) =>
      cotacoesApi.atualizarQuantidadeItem(cotacaoId, itemId, { quantidade }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cotacao', cotacaoId] })
      mostrar('Quantidade atualizada com sucesso.')
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

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
              /* ignora frames que não são JSON */
            }
          }
        }
      } catch {
        /* stream encerrado ou indisponível — fallback no polling */
      } finally {
        setConectado(false)
      }
    }
    conectar()
    return () => controller.abort()
  }, [cotacaoId, qc])

  const grid = live ?? data

  // Extrai lista de empresas participantes para virarem colunas
  const colunas = useMemo(() => {
    const mapa = new Map<string, { participanteId?: string; empresa: string }>()
    for (const item of grid?.itens ?? []) {
      for (const p of item.precos ?? []) {
        const chave = p.empresa || p.participanteId || ''
        if (chave && !mapa.has(chave)) {
          mapa.set(chave, { participanteId: p.participanteId, empresa: p.empresa || 'Fornecedor' })
        }
      }
    }
    return [...mapa.values()]
  }, [grid?.itens])

  // Redimensionamento interativo de colunas com persistência em localStorage
  const [larguraProduto, setLarguraProduto] = useState<number>(() => {
    try {
      const s = localStorage.getItem('grade-largura-coluna-produto')
      return s ? Math.max(220, Math.min(600, Number(s))) : 320
    } catch {
      return 320
    }
  })

  const [largurasEmpresas, setLargurasEmpresas] = useState<Record<string, number>>(() => {
    try {
      const s = localStorage.getItem('grade-larguras-empresas')
      return s ? JSON.parse(s) : {}
    } catch {
      return {}
    }
  })

  function getLarguraEmpresa(id: string) {
    return largurasEmpresas[id] || 170
  }

  const arrasteProdutoRef = useRef<{ inicioX: number; inicioLargura: number } | null>(null)

  function aoDownProduto(e: React.PointerEvent<HTMLSpanElement>) {
    e.preventDefault()
    e.stopPropagation()
    arrasteProdutoRef.current = { inicioX: e.clientX, inicioLargura: larguraProduto }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function aoMoveProduto(e: React.PointerEvent<HTMLSpanElement>) {
    if (!arrasteProdutoRef.current) return
    const delta = e.clientX - arrasteProdutoRef.current.inicioX
    const nova = Math.max(220, Math.min(600, arrasteProdutoRef.current.inicioLargura + delta))
    setLarguraProduto(nova)
  }

  function aoUpProduto(e: React.PointerEvent<HTMLSpanElement>) {
    if (!arrasteProdutoRef.current) return
    const delta = e.clientX - arrasteProdutoRef.current.inicioX
    const final = Math.max(220, Math.min(600, arrasteProdutoRef.current.inicioLargura + delta))
    arrasteProdutoRef.current = null
    setLarguraProduto(final)
    try {
      localStorage.setItem('grade-largura-coluna-produto', String(final))
    } catch {}
  }

  const arrasteEmpresaRef = useRef<{ id: string; inicioX: number; inicioLargura: number } | null>(null)

  function aoDownEmpresa(id: string, e: React.PointerEvent<HTMLSpanElement>) {
    e.preventDefault()
    e.stopPropagation()
    arrasteEmpresaRef.current = { id, inicioX: e.clientX, inicioLargura: getLarguraEmpresa(id) }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function aoMoveEmpresa(e: React.PointerEvent<HTMLSpanElement>) {
    if (!arrasteEmpresaRef.current) return
    const { id, inicioX, inicioLargura } = arrasteEmpresaRef.current
    const delta = e.clientX - inicioX
    const nova = Math.max(130, Math.min(450, inicioLargura + delta))
    setLargurasEmpresas((prev) => ({ ...prev, [id]: nova }))
  }

  function aoUpEmpresa(e: React.PointerEvent<HTMLSpanElement>) {
    if (!arrasteEmpresaRef.current) return
    const { id, inicioX, inicioLargura } = arrasteEmpresaRef.current
    const delta = e.clientX - inicioX
    const final = Math.max(130, Math.min(450, inicioLargura + delta))
    arrasteEmpresaRef.current = null
    setLargurasEmpresas((prev) => {
      const atualizado = { ...prev, [id]: final }
      try {
        localStorage.setItem('grade-larguras-empresas', JSON.stringify(atualizado))
      } catch {}
      return atualizado
    })
  }

  const tabelaContainerRef = useRef<HTMLDivElement>(null)

  function rolarTabela(direcao: 'esq' | 'dir') {
    if (!tabelaContainerRef.current) return
    tabelaContainerRef.current.scrollBy({
      left: direcao === 'dir' ? 340 : -340,
      behavior: 'smooth',
    })
  }

  if (isLoading && !grid) return <Spinner />
  if (!grid) return <EmptyState icon="bolt" title="Sem dados ao vivo" />

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4 w-full min-w-0 overflow-hidden">
      {/* Barra superior de status ao vivo */}
      <Card className="shrink-0 p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111914] border-white/10 w-full min-w-0">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider">
              Respostas Recebidas
            </p>
            <p className="text-headline-md font-headline-md text-on-surface">
              {grid.respondidos ?? 0} / {grid.totalParticipantes ?? 0}
            </p>
          </div>

          {conectado && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <IconeAoVivoTransmissao />
              <span>Transmissão em tempo real ativa</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Navegação horizontal rápida para deslizar empresas sem barra de rolagem */}
          {colunas.length > 0 && (
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => rolarTabela('esq')}
                className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-white/10 transition-colors cursor-pointer"
                title="Rolar empresas para a esquerda"
                aria-label="Rolar empresas para a esquerda"
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <span className="text-[11px] text-on-surface-variant/70 font-medium px-1 select-none">
                Empresas
              </span>
              <button
                type="button"
                onClick={() => rolarTabela('dir')}
                className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-white/10 transition-colors cursor-pointer"
                title="Rolar empresas para a direita"
                aria-label="Rolar empresas para a direita"
              >
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          )}

          <StatusBadge status={grid.status} />

          {grid.status === 'ABERTA' && onProrrogarPrazo && (
            <Button
              variant="ghost"
              onClick={onProrrogarPrazo}
              className="!py-1.5 !px-3 !text-xs border border-white/10"
              title="Prorrogar prazo para lances"
            >
              <Icon name="schedule" className="text-[15px]" />
              Prorrogar Prazo
            </Button>
          )}

          {grid.status === 'ABERTA' && onEncerrar && (
            <Button
              onClick={onEncerrar}
              disabled={encerrando}
              className="!py-1.5 !px-3 !text-xs bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              title="Finalizar participantes pendentes e ir para a apuração"
            >
              <Icon name="stop" className="text-[15px]" />
              {encerrando ? 'Encerrando…' : 'Encerrar Cotação'}
            </Button>
          )}

          {(grid.status === 'ENCERRADA' || grid.status === 'PEDIDOS_GERADOS') && onIrParaResultado && (
            <Button
              onClick={onIrParaResultado}
              className="!py-1.5 !px-3 !text-xs shadow-[0_0_12px_rgba(78,222,163,0.3)]"
            >
              <Icon name="analytics" className="text-[15px]" />
              Ver Resultado
            </Button>
          )}
        </div>
      </Card>

      {/* Tabela estilo planilha contábil com coluna de produto congelada e barra de rolagem oculta */}
      <div
        ref={tabelaContainerRef}
        className="flex-1 min-h-[420px] w-full min-w-0 overflow-x-auto overflow-y-auto rounded-none border border-white/15 bg-[#0d1410] shadow-2xl relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <table className="min-w-full w-max text-left border-separate border-spacing-0 table-fixed">
          <thead>
            <tr className="bg-[#16211a] text-on-surface-variant font-label-md uppercase tracking-wider text-xs">
              {/* Th Produto com handle de arraste e fixo (sticky left + top z-30) */}
              <th
                className="sticky left-0 top-0 z-30 bg-[#16211a] px-3.5 py-3 border-b-2 border-primary/40 border-r-2 border-white/20 text-on-surface font-bold text-xs uppercase tracking-wider shadow-[4px_0_12px_rgba(0,0,0,0.6)] relative group/th select-none"
                style={{ width: `${larguraProduto}px`, minWidth: `${larguraProduto}px`, maxWidth: `${larguraProduto}px` }}
              >
                <div className="flex items-center gap-2">
                  <Icon name="inventory_2" className="text-[17px] text-primary" />
                  <span>Produto / Quantidade</span>
                </div>
                {/* Handle de redimensionamento */}
                <span
                  aria-hidden
                  onPointerDown={aoDownProduto}
                  onPointerMove={aoMoveProduto}
                  onPointerUp={aoUpProduto}
                  onPointerCancel={() => { arrasteProdutoRef.current = null }}
                  onDoubleClick={() => {
                    setLarguraProduto(320)
                    try { localStorage.removeItem('grade-largura-coluna-produto') } catch {}
                  }}
                  title="Arraste para redimensionar (duplo clique para resetar)"
                  className="absolute inset-y-0 -right-1 w-2.5 cursor-col-resize touch-none select-none z-40 hover:bg-primary/70 transition-colors group-hover/th:bg-white/20"
                />
              </th>

              {/* Th Empresas com handle de arraste (sticky top z-10, passa por baixo do th produto) */}
              {colunas.map((col, idx) => {
                const colId = col.participanteId || col.empresa || String(idx)
                const larg = getLarguraEmpresa(colId)
                return (
                  <th
                    key={colId}
                    className="sticky top-0 z-10 bg-[#16211a] px-3 py-3 border-b-2 border-primary/40 border-r border-white/10 text-center font-bold text-xs uppercase tracking-wider text-on-surface relative group/th select-none"
                    style={{ width: `${larg}px`, minWidth: `${larg}px`, maxWidth: `${larg}px` }}
                  >
                    <div className="flex items-center justify-center gap-1.5 px-1">
                      <Icon name="store" className="text-[15px] text-primary/80 shrink-0" />
                      <span className="truncate block text-xs font-bold text-on-surface" title={col.empresa}>
                        {col.empresa}
                      </span>
                    </div>
                    {/* Handle de redimensionamento */}
                    <span
                      aria-hidden
                      onPointerDown={(e) => aoDownEmpresa(colId, e)}
                      onPointerMove={aoMoveEmpresa}
                      onPointerUp={aoUpEmpresa}
                      onPointerCancel={() => { arrasteEmpresaRef.current = null }}
                      onDoubleClick={() => {
                        setLargurasEmpresas((prev) => {
                          const copia = { ...prev }
                          delete copia[colId]
                          try { localStorage.setItem('grade-larguras-empresas', JSON.stringify(copia)) } catch {}
                          return copia
                        })
                      }}
                      title="Arraste para redimensionar (duplo clique para resetar)"
                      className="absolute inset-y-0 -right-1 w-2.5 cursor-col-resize touch-none select-none z-30 hover:bg-primary/70 transition-colors group-hover/th:bg-white/20"
                    />
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="text-body-md text-on-surface">
            {(grid.itens ?? []).map((item: ItemGrid) => {
              const countMenores = (item.precos ?? []).filter(
                (p) =>
                  p.status === 'COTADO' &&
                  p.precoUnitario != null &&
                  item.menorPrecoUnitario != null &&
                  p.precoUnitario === item.menorPrecoUnitario
              ).length
              const temEmpateNoMenor = countMenores > 1

              // Resolução de dados de insight para este item
              const prodId = item.itemCotacaoId ? produtoIdPorItemCotacao.get(item.itemCotacaoId) : undefined
              const insightDoItem = prodId && insightsMap ? insightsMap[prodId] : null

              return (
                <tr
                  key={item.itemCotacaoId}
                  className="even:bg-white/[0.015] odd:bg-transparent hover:bg-white/[0.04] transition-colors group"
                >
                  {/* Coluna 1 Fixa (Produto + Balãozinho de Insight + Qtd inline + Embalagem abaixo) - z-20 sólida */}
                  <td
                    className="sticky left-0 z-20 bg-[#131b15] group-hover:bg-[#18231c] transition-colors px-3 py-1.5 border-r-2 border-white/20 border-b border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]"
                    style={{ width: `${larguraProduto}px`, minWidth: `${larguraProduto}px`, maxWidth: `${larguraProduto}px` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="font-medium text-on-surface text-[13px] truncate" title={item.nome}>
                          {item.nome}
                        </span>

                        {/* Ícone discreto (i) de informação com o balão estilizado de insight */}
                        <HoverCard
                          trigger={
                            <button
                              type="button"
                              className="shrink-0 p-0.5 rounded text-on-surface-variant/50 hover:text-primary hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer"
                              aria-label={`Ver histórico e insights de ${item.nome}`}
                            >
                              <Icon name="info" className="text-[14px]" />
                            </button>
                          }
                        >
                          <BalaoInsightProduto
                            nome={item.nome ?? 'Produto'}
                            embalagemDesc={formatarEmbalagemDesc(item.quantidadePorEmbalagem, item.unidade)}
                            quantidadePorEmbalagem={item.quantidadePorEmbalagem ?? 1}
                            menorPrecoUnitarioAtual={item.menorPrecoUnitario ?? null}
                            item={item}
                            insight={insightDoItem}
                          />
                        </HoverCard>
                      </div>

                      {/* Stepper / Input editável inline sem modal */}
                      <CampoQuantidadeInline
                        item={item}
                        editavel={editavel}
                        aoAtualizar={(itemId, qtd) => mutAtualizarQtd.mutate({ itemId, quantidade: qtd })}
                        atualizando={mutAtualizarQtd.isPending}
                      />
                    </div>

                    {/* Embalagem logo abaixo limpa (ex: cx/12 un, fardo/10 un ou unidade individual) */}
                    <div className="text-[11px] text-on-surface-variant/60 leading-tight mt-0.5 truncate">
                      {formatarEmbalagemDesc(item.quantidadePorEmbalagem, item.unidade)}
                    </div>
                  </td>

                  {/* Colunas das Empresas Concorrentes (com borda vertical, correção de lance e visual contábil) */}
                  {colunas.map((col, idx) => {
                    const colId = col.participanteId || col.empresa || String(idx)
                    const larg = getLarguraEmpresa(colId)
                    const cel = (item.precos ?? []).find(
                      (p) =>
                        (p.participanteId && col.participanteId && p.participanteId === col.participanteId) ||
                        p.empresa === col.empresa
                    )

                    if (!cel || cel.status === 'PENDENTE') {
                      return (
                        <td
                          key={colId}
                          className="px-2 py-1.5 border-r border-b border-white/10 text-center"
                          style={{ width: `${larg}px`, minWidth: `${larg}px`, maxWidth: `${larg}px` }}
                        >
                          <button
                            type="button"
                            onClick={() => editavel && abrirCorrecao(item, cel, col.participanteId, col.empresa)}
                            disabled={!editavel}
                            title={editavel ? `Clique para lançar ou corrigir lance de ${col.empresa}` : undefined}
                            className={`w-full py-1 rounded transition-colors ${
                              editavel ? 'hover:bg-white/[0.05] cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            <span className="text-[11px] text-on-surface-variant/40 font-medium">—</span>
                          </button>
                        </td>
                      )
                    }

                    if (cel.status === 'NAO_COTADO') {
                      return (
                        <td
                          key={colId}
                          className="px-2 py-1.5 border-r border-b border-white/10 text-center"
                          style={{ width: `${larg}px`, minWidth: `${larg}px`, maxWidth: `${larg}px` }}
                        >
                          <button
                            type="button"
                            onClick={() => editavel && abrirCorrecao(item, cel, col.participanteId, col.empresa)}
                            disabled={!editavel}
                            title={editavel ? `Clique para corrigir lance de ${col.empresa}` : undefined}
                            className={`w-full py-1 rounded transition-colors ${
                              editavel ? 'hover:bg-white/[0.05] cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            <span className="text-[11px] text-error/70 font-medium">Não cotou</span>
                          </button>
                        </td>
                      )
                    }

                    // Fornecedor COTADO
                    const ehLider =
                      cel.precoUnitario != null &&
                      item.menorPrecoUnitario != null &&
                      cel.precoUnitario === item.menorPrecoUnitario &&
                      item.menorPrecoUnitario > 0
                    const empatado = ehLider && temEmpateNoMenor
                    const vencedorUnico = ehLider && !temEmpateNoMenor

                    return (
                      <td
                        key={colId}
                        className="px-2 py-1 border-r border-b border-white/10 text-center"
                        style={{ width: `${larg}px`, minWidth: `${larg}px`, maxWidth: `${larg}px` }}
                      >
                        <button
                          type="button"
                          onClick={() => editavel && abrirCorrecao(item, cel, col.participanteId, col.empresa)}
                          disabled={!editavel}
                          title={editavel ? `Clique para corrigir o lance de ${col.empresa}` : undefined}
                          className={`w-full rounded px-2 py-1 transition-all flex flex-col items-center justify-center relative group/cel ${
                            editavel ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            vencedorUnico
                              ? 'bg-primary/[0.12] border border-primary/40 shadow-[0_0_8px_rgba(78,222,163,0.15)] hover:border-primary/70'
                              : empatado
                                ? 'bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60'
                                : 'hover:bg-white/[0.06] border border-transparent hover:border-white/10'
                          }`}
                        >
                          {/* Mini lápis discreto que aparece no hover quando a cotação é editável */}
                          {editavel && (
                            <span className="absolute top-1 right-1 opacity-0 group-hover/cel:opacity-100 transition-opacity text-on-surface-variant hover:text-primary">
                              <Icon name="edit" className="text-[11px]" />
                            </span>
                          )}

                          {/* Mini indicador de liderança */}
                          {vencedorUnico && (
                            <div className="text-[9.5px] font-bold uppercase tracking-wider text-primary leading-none mb-0.5">
                              ★ Menor preço
                            </div>
                          )}
                          {empatado && (
                            <div className="text-[9.5px] font-bold uppercase tracking-wider text-amber-400 leading-none mb-0.5">
                              Empate
                            </div>
                          )}

                          {/* Preço da Embalagem / Caixa */}
                          <div
                            className={`text-[13.5px] font-bold tabular-nums leading-tight ${
                              vencedorUnico ? 'text-primary' : empatado ? 'text-amber-300' : 'text-on-surface'
                            }`}
                          >
                            {formatarMoeda(cel.preco)}
                          </div>

                          {/* Preço Unitário */}
                          {cel.precoUnitario != null && (
                            <div
                              className={`text-[10.5px] tabular-nums leading-tight mt-0.5 ${
                                vencedorUnico
                                  ? 'text-primary/80 font-medium'
                                  : empatado
                                    ? 'text-amber-400/80 font-medium'
                                    : 'text-on-surface-variant/60'
                              }`}
                            >
                              {formatarMoeda(cel.precoUnitario)} / un
                            </div>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>

        {colunas.length === 0 && (
          <div className="p-8 text-center text-on-surface-variant">
            <Icon name="groups" className="text-3xl mx-auto mb-2 opacity-50" />
            <p className="font-medium text-sm">Nenhum participante com lances registrados ainda.</p>
            <p className="text-xs text-on-surface-variant/70 mt-1">
              Os preços aparecerão aqui lado a lado conforme os fornecedores forem respondendo.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Correção de Lance pelo Comprador */}
      <Modal
        open={lanceParaCorrigir != null}
        onClose={() => setLanceParaCorrigir(null)}
        title={`Corrigir lance — ${lanceParaCorrigir?.empresa ?? ''}`}
        onSubmit={(e) => {
          e.preventDefault()
          mutCorrigirLance.mutate()
        }}
        submitting={mutCorrigirLance.isPending}
        submitLabel="Salvar correção"
      >
        {lanceParaCorrigir && (
          <div className="space-y-4">
            {/* Resumo do Produto */}
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 flex items-start gap-3">
              <Icon name="inventory_2" className="text-xl text-primary mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-on-surface truncate">
                  {lanceParaCorrigir.item.nome}
                </div>
                <div className="text-xs text-on-surface-variant/70 mt-0.5">
                  {formatarEmbalagemDesc(lanceParaCorrigir.item.quantidadePorEmbalagem, lanceParaCorrigir.item.unidade)} · Solicitado: {lanceParaCorrigir.item.quantidadeSolicitada} emb
                </div>
              </div>
            </div>

            {/* Campo Preço da Embalagem */}
            <Field label="Preço da embalagem (R$)">
              <Input
                type="text"
                inputMode="decimal"
                value={precoCorrecao}
                disabled={naoCotadoCorrecao}
                placeholder="0,00"
                autoFocus
                onChange={(e) => {
                  const limpo = sanitizarEntradaValor(e.target.value)
                  if (limpo !== null) setPrecoCorrecao(limpo)
                }}
                className="text-lg font-bold tabular-nums"
              />
              {!naoCotadoCorrecao && valorParaNumero(precoCorrecao) > 0 && (
                <span className="block text-[11px] text-primary font-medium mt-1">
                  Equivale a {formatarMoeda(valorParaNumero(precoCorrecao) / (lanceParaCorrigir.item.quantidadePorEmbalagem ?? 1))} por unidade
                </span>
              )}
            </Field>

            {/* Checkbox Não Cotado */}
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={naoCotadoCorrecao}
                onChange={(e) => setNaoCotadoCorrecao(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-0 bg-white/10"
              />
              <div className="text-xs font-medium text-on-surface">
                Marcar como <span className="text-error font-semibold">"Não cotado"</span> (fornecedor não tem o item em estoque)
              </div>
            </label>

            {/* Alerta de erro caso ocorra */}
            {erroCorrecao && (
              <div className="text-xs text-error bg-error/10 border border-error/20 p-2.5 rounded-lg flex items-center gap-2">
                <Icon name="error" className="text-sm shrink-0" />
                <span>{erroCorrecao}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

// ============================================================
// Aba Resultado
// ============================================================
// ============================================================
// Aba Resultado
// ============================================================
interface AbaResultadoProps {
  cotacaoId: string
  cotacao?: CotacaoResponse
  onApurar?: () => void
  apurando?: boolean
  onEncerrar?: () => void
  encerrando?: boolean
  onReabrir?: () => void
  reabrindo?: boolean
  onIrParaAoVivo?: () => void
}

function AbaResultado({
  cotacaoId,
  cotacao,
  onApurar,
  apurando,
  onEncerrar,
  encerrando,
  onReabrir,
  reabrindo,
  onIrParaAoVivo,
}: AbaResultadoProps) {
  const queryClient = useQueryClient()
  const { mostrar } = useToast()
  const navigate = useNavigate()

  const status = cotacao?.status
  const ehApurada = status === 'PEDIDOS_GERADOS'

  // Busca do resultado oficial (se apurada) ou da prévia em tempo real
  const { data: resultadoData, isLoading: loadingResultado } = useQuery<ResultadoDTO>({
    queryKey: ['cotacao', cotacaoId, ehApurada ? 'resultado' : 'previa-apuracao'],
    queryFn: () => (ehApurada ? cotacoesApi.resultado(cotacaoId) : cotacoesApi.previaApuracao(cotacaoId)),
    refetchInterval: status === 'ABERTA' ? 10000 : false,
  })

  // Grade ao vivo para capturar lances e servir de fallback caso a cotação tenha sido apurada sem pedidos no back
  const { data: gridAoVivo, isLoading: loadingGrid } = useQuery<GridAoVivoDTO>({
    queryKey: ['cotacao', cotacaoId, 'ao-vivo'],
    queryFn: () => cotacoesApi.aoVivo(cotacaoId),
    refetchInterval: status === 'ABERTA' ? 10000 : false,
    enabled: true,
  })

  // Participantes da cotação para puxar WhatsApp e nome do representante
  const { data: participantes } = useQuery<ParticipanteDaCotacaoResponse[]>({
    queryKey: ['cotacao', cotacaoId, 'participantes'],
    queryFn: () => cotacoesApi.participantes(cotacaoId),
  })

  // Exportar XLSX geral
  const exportar = useMutation({
    mutationFn: () => baixarArquivo(cotacoesApi.resultadoXlsxUrl(cotacaoId), `resultado-${cotacaoId}.xlsx`),
    onSuccess: (r) => mostrar(r === 'assincrono' ? 'Exportação grande — você receberá por e-mail.' : 'Download do Excel iniciado!'),
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  // Enviar pedido individual
  const [enviandoPedidoId, setEnviandoPedidoId] = useState<string | null>(null)
  const enviarPedido = useMutation({
    mutationFn: (pedidoId: string) => pedidosApi.enviar(pedidoId),
    onMutate: (pedidoId) => setEnviandoPedidoId(pedidoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotacao', cotacaoId] })
      mostrar('Pedido marcado como enviado com sucesso!')
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
    onSettled: () => setEnviandoPedidoId(null),
  })

  // Atualização direta de quantidade do item (recalcula instantaneamente totais e prévia)
  const [itemAtualizandoId, setItemAtualizandoId] = useState<string | null>(null)
  const mutAtualizarQtd = useMutation({
    mutationFn: ({ itemId, quantidade }: { itemId: string; quantidade: number }) =>
      cotacoesApi.atualizarQuantidadeItem(cotacaoId, itemId, { quantidade }),
    onMutate: ({ itemId }) => setItemAtualizandoId(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotacao', cotacaoId] })
      mostrar('Quantidade atualizada com sucesso.')
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
    onSettled: () => setItemAtualizandoId(null),
  })

  // Recotar itens sem vencedor
  const [modalRecotarAberto, setModalRecotarAberto] = useState(false)
  const recotar = useMutation({
    mutationFn: () => cotacoesApi.recotarSemVencedor(cotacaoId),
    onSuccess: (novaCotacao) => {
      setModalRecotarAberto(false)
      mostrar('Nova cotação gerada com os itens sem vencedor!')
      if (novaCotacao?.id) {
        navigate(`/admin/cotacoes/${novaCotacao.id}`)
      }
    },
    onError: (e) => mostrar(mensagemErro(e), 'erro'),
  })

  // Modal de confirmação de apuração
  const [modalApurarAberto, setModalApurarAberto] = useState(false)

  // Download individual do PDF do pedido
  const [baixandoPdfId, setBaixandoPdfId] = useState<string | null>(null)
  const handleBaixarPdf = async (pedidoId?: string, empresaNome?: string) => {
    if (!pedidoId) return
    try {
      setBaixandoPdfId(pedidoId)
      const nomeLimpo = (empresaNome ?? 'pedido').toLowerCase().replace(/[^a-z0-9]/g, '-')
      await baixarArquivo(pedidosApi.pdfUrl(pedidoId), `pedido-${nomeLimpo}-${pedidoId.slice(0, 6)}.pdf`)
      mostrar('Download do espelho em PDF concluído!')
    } catch (e) {
      mostrar(mensagemErro(e), 'erro')
    } finally {
      setBaixandoPdfId(null)
    }
  }

  // Montagem da mensagem de WhatsApp e envio
  const handleEnviarWhatsApp = (pedido: PedidoDTO) => {
    const part = participantes?.find(
      (p) =>
        (pedido.participanteId && p.participanteId === pedido.participanteId) ||
        (p.empresaNome && pedido.empresaNome && p.empresaNome.trim().toLowerCase() === pedido.empresaNome.trim().toLowerCase())
    )
    const tel = part?.whatsappRepresentante || null
    const itensMsg = (pedido.itens ?? [])
      .map(
        (it) =>
          `• ${it.quantidade ?? 1} ${rotuloUnidade(it.quantidade ?? 1, it.quantidadePorEmbalagemSnapshot, it.unidadeSnapshot)} de ${it.nomeSnapshot} (${formatarEmbalagemDesc(it.quantidadePorEmbalagemSnapshot, it.unidadeSnapshot)}) - ${formatarMoeda(it.subtotal ?? 0)}`
      )
      .join('\n')

    const texto =
      `Olá! Segue o pedido de compra gerado a partir da cotação *${cotacao?.titulo ?? 'SimpleCote'}*:\n\n` +
      `*Fornecedor:* ${pedido.empresaNome}\n` +
      `*Total do Pedido:* ${formatarMoeda(pedido.total ?? 0)}\n` +
      (pedido.condicaoPagamento ? `*Condição de Pagamento:* ${pedido.condicaoPagamento}\n` : '') +
      (pedido.prazoEntregaEstimado ? `*Prazo de Entrega Estimado:* ${pedido.prazoEntregaEstimado}\n` : '') +
      `\n*Itens Solicitados:*\n${itensMsg}\n\n` +
      `Favor confirmar o recebimento e prazo de entrega. Obrigado!`

    window.open(urlWhatsApp(texto, tel), '_blank')
  }

  // Copiar resumo do pedido para área de transferência
  const handleCopiarResumo = (pedido: PedidoDTO) => {
    const itensMsg = (pedido.itens ?? [])
      .map(
        (it) =>
          `• ${it.quantidade ?? 1} ${rotuloUnidade(it.quantidade ?? 1, it.quantidadePorEmbalagemSnapshot, it.unidadeSnapshot)} de ${it.nomeSnapshot} - ${formatarMoeda(it.subtotal ?? 0)}`
      )
      .join('\n')

    const texto =
      `Pedido de Compra - ${cotacao?.titulo ?? 'Cotação'}\n` +
      `Fornecedor: ${pedido.empresaNome}\n` +
      `Total: ${formatarMoeda(pedido.total ?? 0)}\n` +
      `Itens:\n${itensMsg}`

    navigator.clipboard.writeText(texto)
    mostrar('Resumo do pedido copiado para a área de transferência!')
  }

  // ============================================================
  // Unificação Inteligente de Dados (Prévia Ao Vivo + Apuração Oficial)
  // ============================================================
  const itensComVencedor = useMemo(() => {
    if (ehApurada && (resultadoData?.pedidos?.length ?? 0) > 0) {
      const list: Array<{
        id: string
        itemCotacaoId: string
        nome: string
        unidade?: string
        quantidadePorEmbalagem?: number
        quantidadeSolicitada: number
        precoUnitario: number
        precoEmbalagem?: number
        subtotal: number
        empresaVencedora: string
        participanteId?: string
        decididoPorDesempate?: boolean
      }> = []
      for (const ped of resultadoData?.pedidos ?? []) {
        for (const it of ped.itens ?? []) {
          list.push({
            id: it.id || it.itemCotacaoId || '',
            itemCotacaoId: it.itemCotacaoId || it.id || '',
            nome: it.nomeSnapshot || 'Produto',
            unidade: it.unidadeSnapshot,
            quantidadePorEmbalagem: it.quantidadePorEmbalagemSnapshot,
            quantidadeSolicitada: it.quantidade ?? 1,
            precoUnitario: it.precoUnitario ?? 0,
            precoEmbalagem: it.precoEmbalagem,
            subtotal: it.subtotal ?? 0,
            empresaVencedora: ped.empresaNome || 'Fornecedor',
            participanteId: ped.participanteId,
            decididoPorDesempate: it.decididoPorDesempate,
          })
        }
      }
      return list
    }

    // Se a cotação não foi apurada OU se foi apurada sem pedidos gravados no back,
    // computa os vencedores a partir dos menores lances da grade
    const list: Array<{
      id: string
      itemCotacaoId: string
      nome: string
      unidade?: string
      quantidadePorEmbalagem?: number
      quantidadeSolicitada: number
      precoUnitario: number
      precoEmbalagem?: number
      subtotal: number
      empresaVencedora: string
      participanteId?: string
      decididoPorDesempate?: boolean
    }> = []

    for (const it of gridAoVivo?.itens ?? []) {
      const cotados = (it.precos ?? []).filter((p) => p.status === 'COTADO' && p.precoUnitario != null && p.precoUnitario > 0)
      if (cotados.length === 0) continue

      const menorPreco = it.menorPrecoUnitario ?? Math.min(...cotados.map((c) => c.precoUnitario!))
      const vencedora = cotados.find((c) => c.precoUnitario === menorPreco) || cotados[0]

      const qtdSol = it.quantidadeSolicitada ?? 1
      const precoEmb = vencedora.preco ?? (vencedora.precoUnitario! * (it.quantidadePorEmbalagem ?? 1))
      const subtotal = qtdSol * precoEmb

      list.push({
        id: it.itemCotacaoId || '',
        itemCotacaoId: it.itemCotacaoId || '',
        nome: it.nome || 'Produto',
        unidade: it.unidade,
        quantidadePorEmbalagem: it.quantidadePorEmbalagem,
        quantidadeSolicitada: qtdSol,
        precoUnitario: vencedora.precoUnitario!,
        precoEmbalagem: precoEmb,
        subtotal,
        empresaVencedora: vencedora.empresa || 'Fornecedor',
        participanteId: vencedora.participanteId,
        decididoPorDesempate: cotados.filter((c) => c.precoUnitario === menorPreco).length > 1,
      })
    }

    return list
  }, [ehApurada, resultadoData?.pedidos, gridAoVivo?.itens])

  const itensSemVencedor = useMemo(() => {
    if (ehApurada && (resultadoData?.pedidos?.length ?? 0) > 0) {
      return (resultadoData?.itensSemVencedor ?? []).map((it) => ({
        id: it.id || '',
        nome: it.nomeSnapshot || 'Produto',
        unidade: it.unidadeSnapshot,
        quantidadePorEmbalagem: it.quantidadePorEmbalagemSnapshot,
        quantidadeSolicitada: it.quantidadeSolicitada ?? 1,
      }))
    }

    // Na prévia ou fallback, itens que não possuem nenhuma cotação válida no grid
    const list: Array<{
      id: string
      nome: string
      unidade?: string
      quantidadePorEmbalagem?: number
      quantidadeSolicitada: number
    }> = []

    for (const it of gridAoVivo?.itens ?? []) {
      const temCotado = (it.precos ?? []).some((p) => p.status === 'COTADO' && p.precoUnitario != null && p.precoUnitario > 0)
      if (!temCotado) {
        list.push({
          id: it.itemCotacaoId || '',
          nome: it.nome || 'Produto',
          unidade: it.unidade,
          quantidadePorEmbalagem: it.quantidadePorEmbalagem,
          quantidadeSolicitada: it.quantidadeSolicitada ?? 1,
        })
      }
    }

    return list
  }, [ehApurada, resultadoData?.pedidos, resultadoData?.itensSemVencedor, gridAoVivo?.itens])

  // Pedidos consolidados agrupados por fornecedor
  const pedidosAgrupados = useMemo<PedidoDTO[]>(() => {
    if (ehApurada && resultadoData?.pedidos && resultadoData.pedidos.length > 0) {
      return resultadoData.pedidos
    }

    // Na prévia, monta os pedidos simulados a partir de itensComVencedor
    const mapa = new Map<string, PedidoDTO>()

    for (const item of itensComVencedor) {
      const chave = item.empresaVencedora
      if (!mapa.has(chave)) {
        const partInfo = participantes?.find(
          (p) => (item.participanteId && p.participanteId === item.participanteId) || p.empresaNome === chave
        )
        mapa.set(chave, {
          id: `simulacao-${chave}`,
          empresaNome: chave,
          participanteId: item.participanteId,
          total: 0,
          itens: [],
          status: 'SIMULADO',
          pedidoMinimo: partInfo?.pedidoMinimo ?? null,
        })
      }
      const ped = mapa.get(chave)!
      ped.total = (ped.total ?? 0) + item.subtotal
      ped.itens?.push({
        id: item.id,
        itemCotacaoId: item.itemCotacaoId,
        nomeSnapshot: item.nome,
        unidadeSnapshot: item.unidade,
        quantidadePorEmbalagemSnapshot: item.quantidadePorEmbalagem,
        quantidade: item.quantidadeSolicitada,
        precoUnitario: item.precoUnitario,
        precoEmbalagem: item.precoEmbalagem,
        subtotal: item.subtotal,
        decididoPorDesempate: item.decididoPorDesempate,
      })
    }

    return Array.from(mapa.values())
  }, [ehApurada, resultadoData?.pedidos, itensComVencedor, participantes])

  // Sub-abas de visualização (Por Produto / Por Fornecedor / Sem Vencedor)
  const [visualizacao, setVisualizacao] = useState<'produtos' | 'fornecedores' | 'sem_vencedor'>('produtos')

  // Sanfona (Accordion) na visualização por fornecedor
  const [pedidosRecolhidos, setPedidosRecolhidos] = useState<Set<string>>(new Set())

  const alternarPedido = (chave: string) => {
    setPedidosRecolhidos((prev) => {
      const next = new Set(prev)
      if (next.has(chave)) next.delete(chave)
      else next.add(chave)
      return next
    })
  }

  const expandirTodos = () => setPedidosRecolhidos(new Set())
  const recolherTodos = () =>
    setPedidosRecolhidos(new Set(pedidosAgrupados.map((p, idx) => p.id || p.empresaNome || String(idx))))

  // Métricas gerais
  const totalGeral = itensComVencedor.reduce((acc, p) => acc + p.subtotal, 0)
  const totalItensGanhos = itensComVencedor.length
  const totalItensSemVencedor = itensSemVencedor.length
  const totalGeralItens = totalItensGanhos + totalItensSemVencedor
  const taxaAtendimento = totalGeralItens > 0 ? Math.round((totalItensGanhos / totalGeralItens) * 100) : 0

  if (loadingResultado && loadingGrid) return <Spinner />

  // Empty state se não houver lances nem itens
  if (itensComVencedor.length === 0 && itensSemVencedor.length === 0) {
    if (status === 'RASCUNHO') {
      return (
        <EmptyState
          icon="draft"
          title="Cotação em rascunho"
          description="Abra a cotação e convide fornecedores para começar a receber lances e visualizar a apuração."
        />
      )
    }
    if (status === 'ABERTA') {
      return (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Icon name="hourglass_empty" className="text-3xl animate-pulse" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-semibold text-on-surface">Aguardando propostas</h3>
            <p className="text-sm text-on-surface-variant">
              Nenhum fornecedor enviou lances até o momento. Conforme as empresas responderem, a prévia dos menores preços aparecerá aqui automaticamente.
            </p>
          </div>
          {onIrParaAoVivo && (
            <Button variant="ghost" onClick={onIrParaAoVivo}>
              <Icon name="visibility" className="text-[16px]" />
              Ver Cotação ao Vivo
            </Button>
          )}
        </div>
      )
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2.5 w-full min-w-0 overflow-hidden pr-1 pb-1">
      {/* ============================================================ */}
      {/* 1. Header Compacto (Banner Fino + Ações Imediatas)           */}
      {/* ============================================================ */}
      <div className="shrink-0 space-y-2">
        {!ehApurada ? (
          <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-[0_0_10px_rgba(78,222,163,0.3)]">
                <Icon name="visibility" className="text-base" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-on-surface tracking-tight">
                    Prévia da Apuração em Tempo Real
                  </span>
                  {status === 'ABERTA' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-primary/15 text-primary border border-primary/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Ao Vivo
                    </span>
                  )}
                  {status === 'ENCERRADA' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Encerrada • Pronta para Apurar
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant truncate">
                  Exibindo os menores preços ofertados pelos fornecedores. Nenhuma ordem de compra foi disparada ainda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onIrParaAoVivo && (
                <Button variant="ghost" onClick={onIrParaAoVivo} className="!py-1.5 !px-3 !text-xs border border-white/10">
                  <Icon name="grid_on" className="text-[15px]" />
                  Planilha Geral ao Vivo
                </Button>
              )}

              {status === 'ABERTA' && onEncerrar && (
                <Button variant="ghost" onClick={onEncerrar} disabled={encerrando} className="!py-1.5 !px-3 !text-xs border border-white/10">
                  <Icon name="timer_off" className="text-[15px]" />
                  {encerrando ? 'Encerrando…' : 'Encerrar Cotação'}
                </Button>
              )}

              {status === 'ENCERRADA' && onApurar && (
                <Button
                  onClick={() => setModalApurarAberto(true)}
                  disabled={apurando}
                  className="!py-1.5 !px-3 !text-xs shadow-[0_0_15px_rgba(78,222,163,0.35)]"
                >
                  <Icon name="task_alt" className="text-[15px]" />
                  {apurando ? 'Apurando…' : 'Apurar e Gerar Pedidos'}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`rounded-xl border px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
              (resultadoData?.pedidos?.length ?? 0) === 0
                ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent'
                : 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                  (resultadoData?.pedidos?.length ?? 0) === 0
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                }`}
              >
                <Icon name={(resultadoData?.pedidos?.length ?? 0) === 0 ? 'warning' : 'verified'} className="text-base" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-on-surface tracking-tight">
                    {(resultadoData?.pedidos?.length ?? 0) === 0
                      ? 'Apuração Concluída Sem Pedidos Gravados'
                      : 'Apuração Oficial Concluída — Pedidos Gerados'}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold border ${
                      (resultadoData?.pedidos?.length ?? 0) === 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {(resultadoData?.pedidos?.length ?? 0) === 0 ? 'Ação Recomendada' : 'Definitivo'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {(resultadoData?.pedidos?.length ?? 0) === 0
                    ? 'Os fornecedores cotaram preços, mas a cotação foi apurada sem finalizar as respostas. Reabra para salvar os pedidos oficiais com um clique.'
                    : 'Pedidos consolidados. Baixe romaneios em PDF, envie no WhatsApp ou exporte a planilha.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {(resultadoData?.pedidos?.length ?? 0) === 0 && onReabrir && (
                <Button
                  onClick={onReabrir}
                  disabled={reabrindo}
                  className="!py-1.5 !px-3 !text-xs bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                >
                  <Icon name="lock_open" className="text-[15px]" />
                  {reabrindo ? 'Reabrindo…' : 'Reabrir para Salvar Pedidos'}
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => exportar.mutate()}
                disabled={exportar.isPending}
                className="!py-1.5 !px-3 !text-xs border border-white/10"
              >
                <Icon name="download" className="text-[15px]" />
                {exportar.isPending ? 'Exportando…' : 'Exportar XLSX'}
              </Button>

              {itensSemVencedor.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setModalRecotarAberto(true)}
                  disabled={recotar.isPending}
                  className="!py-1.5 !px-3 !text-xs border border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                >
                  <Icon name="restart_alt" className="text-[15px]" />
                  Recotar Sem Vencedor
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. Barra de Métricas Super Compacta (1 Linha Fina)           */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-[#121a14] border border-white/10 rounded-xl p-2.5">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon name="attach_money" className="text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">
                {ehApurada ? 'Total Aprovado' : 'Total Previsto'}
              </div>
              <div className="text-sm sm:text-base font-bold font-mono text-primary truncate">
                {formatarMoeda(totalGeral)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 border-l border-white/5">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant shrink-0">
              <Icon name="storefront" className="text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">
                Fornecedores
              </div>
              <div className="text-sm sm:text-base font-bold text-on-surface truncate">
                {pedidosAgrupados.length} <span className="text-[11px] font-normal text-on-surface-variant">ganhando itens</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 border-l border-white/5">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant shrink-0">
              <Icon name="pie_chart" className="text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">
                Cobertura
              </div>
              <div className="text-sm sm:text-base font-bold text-on-surface truncate">
                {totalItensGanhos} / {totalGeralItens} <span className="text-[11px] font-normal text-primary">({taxaAtendimento}%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 border-l border-white/5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                totalItensSemVencedor > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-primary'
              }`}
            >
              <Icon name={totalItensSemVencedor > 0 ? 'warning' : 'check_circle'} className="text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-semibold text-on-surface-variant/70">
                Sem Vencedor
              </div>
              <div
                className={`text-sm sm:text-base font-bold truncate ${
                  totalItensSemVencedor > 0 ? 'text-amber-300' : 'text-on-surface'
                }`}
              >
                {totalItensSemVencedor} <span className="text-[11px] font-normal text-on-surface-variant">produtos</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. Seletor de Sub-Abas da Planilha de Resultado              */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between gap-3 pt-0.5 px-0.5">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 select-none">
            <button
              type="button"
              onClick={() => setVisualizacao('produtos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                visualizacao === 'produtos'
                  ? 'bg-primary text-black shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
            >
              <Icon name="inventory_2" className="text-[14px]" />
              Vencedores por Produto ({itensComVencedor.length})
            </button>

            <button
              type="button"
              onClick={() => setVisualizacao('fornecedores')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                visualizacao === 'fornecedores'
                  ? 'bg-primary text-black shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
            >
              <Icon name="storefront" className="text-[14px]" />
              Agrupado por Fornecedor ({pedidosAgrupados.length})
            </button>

            <button
              type="button"
              onClick={() => setVisualizacao('sem_vencedor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                visualizacao === 'sem_vencedor'
                  ? 'bg-amber-400 text-black shadow-sm font-bold'
                  : totalItensSemVencedor > 0
                  ? 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
            >
              <Icon name="warning" className="text-[14px]" />
              Sem Vencedor ({itensSemVencedor.length})
            </button>
          </div>

          {visualizacao === 'fornecedores' && pedidosAgrupados.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={expandirTodos}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              >
                Expandir todos
              </button>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={recolherTodos}
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              >
                Recolher todos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. Área Principal da Planilha (Fixa com Scroll Interno)      */}
      {/* ============================================================ */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-none border border-white/15 bg-[#111813]/60 shadow-lg">
        {/* ============================================================ */}
        {/* ABA 1: VENCEDORES POR PRODUTO (Tabela Contábil Item a Item)   */}
        {/* ============================================================ */}
        {visualizacao === 'produtos' && (
          <div className="w-full">
            {itensComVencedor.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Icon name="inventory_2" className="text-3xl text-on-surface-variant/40 mx-auto" />
                <p className="text-sm text-on-surface font-medium">Nenhum produto com preço vencedor ainda</p>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Assim que os fornecedores informarem os preços na cotação, os produtos vencedores aparecerão listados aqui automaticamente.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0">
                <thead className="sticky top-0 z-10 bg-[#17221b] text-on-surface-variant text-[11px] uppercase tracking-wider select-none shadow-sm">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold border-b border-white/10">Produto</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-white/10">Embalagem</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-white/10 text-center min-w-[170px]">Qtd Solicitada</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-white/10">Fornecedor Vencedor</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-white/10 text-right">Menor Preço Unit.</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-white/10 text-right">Preço Embalagem</th>
                    <th className="py-2.5 px-3 font-semibold border-b border-white/10 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {itensComVencedor.map((it) => (
                    <tr key={it.id} className="hover:bg-white/[0.025] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-medium text-on-surface flex items-center gap-1.5">
                          <span>{it.nome}</span>
                          {it.decididoPorDesempate && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">
                              Desempate
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-on-surface-variant font-mono">
                        {formatarEmbalagemDesc(it.quantidadePorEmbalagem, it.unidade)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <CampoQuantidadeInline
                          item={{
                            itemCotacaoId: it.itemCotacaoId || it.id,
                            nome: it.nome,
                            quantidadeSolicitada: it.quantidadeSolicitada,
                            quantidadePorEmbalagem: it.quantidadePorEmbalagem,
                            unidade: it.unidade,
                          }}
                          editavel={!ehApurada}
                          aoAtualizar={(itemId, qtd) => mutAtualizarQtd.mutate({ itemId, quantidade: qtd })}
                          atualizando={mutAtualizarQtd.isPending && itemAtualizandoId === (it.itemCotacaoId || it.id)}
                          alinhamento="center"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <Icon name="storefront" className="text-[13px]" />
                          {it.empresaVencedora}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-on-surface-variant">
                        {formatarMoeda(it.precoUnitario)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-on-surface-variant">
                        {it.precoEmbalagem ? formatarMoeda(it.precoEmbalagem) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-primary">
                        {formatarMoeda(it.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 z-10 bg-[#141d17] border-t-2 border-white/10 text-on-surface">
                  <tr>
                    <td colSpan={6} className="py-3 px-3 text-right text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                      Total Geral Previsto:
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-primary text-base sm:text-lg">
                      {formatarMoeda(totalGeral)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* ABA 2: AGRUPADO POR FORNECEDOR (Pedidos em Sanfona)          */}
        {/* ============================================================ */}
        {visualizacao === 'fornecedores' && (
          <div className="p-3 space-y-3">
            {pedidosAgrupados.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Icon name="storefront" className="text-3xl text-on-surface-variant/40 mx-auto" />
                <p className="text-sm text-on-surface font-medium">Nenhum pedido de fornecedor gerado ainda</p>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Assim que houver preços cotados, os itens serão agrupados automaticamente por fornecedor vencedor.
                </p>
              </div>
            ) : (
              pedidosAgrupados.map((pedido, idx) => {
                const chave = pedido.id || pedido.empresaNome || String(idx)
                const aberto = !pedidosRecolhidos.has(chave)
                const itens = pedido.itens ?? []

                return (
                  <Card
                    key={chave}
                    className={`transition-all duration-200 overflow-hidden border ${
                      aberto ? 'border-primary/30 bg-surface-container-low' : 'border-white/5 bg-surface-container/50 hover:border-white/15'
                    }`}
                  >
                    {/* Cabeçalho do Card (Sanfona Trigger) */}
                    <button
                      type="button"
                      onClick={() => alternarPedido(chave)}
                      className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Icon name="storefront" className="text-lg" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-semibold text-on-surface tracking-tight truncate">
                              {pedido.empresaNome}
                            </h4>

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-on-surface-variant border border-white/5">
                              <Icon name="inventory_2" className="text-[12px]" />
                              {itens.length} {itens.length === 1 ? 'item ganho' : 'itens ganhos'}
                            </span>

                            {ehApurada ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                  pedido.status === 'CONFIRMADO'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : pedido.status === 'ENVIADO'
                                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                    : 'bg-white/10 text-on-surface border-white/15'
                                }`}
                              >
                                <Icon
                                  name={pedido.status === 'CONFIRMADO' ? 'done_all' : pedido.status === 'ENVIADO' ? 'send' : 'schedule'}
                                  className="text-[12px]"
                                />
                                {pedido.status === 'CONFIRMADO' ? 'Confirmado' : pedido.status === 'ENVIADO' ? 'Enviado' : 'Gerado'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/15 text-primary border border-primary/25">
                                <Icon name="star" className="text-[12px]" />
                                Menor Preço
                              </span>
                            )}

                            {pedido.pedidoMinimo != null && pedido.pedidoMinimo > 0 && (
                              (pedido.total ?? 0) >= pedido.pedidoMinimo ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  <Icon name="check_circle" className="text-[12px]" />
                                  Mínimo atingido ({formatarMoeda(pedido.pedidoMinimo)})
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  title={`Pedido mínimo exigido: ${formatarMoeda(pedido.pedidoMinimo)}. Ajuste as quantidades dos itens para atingir o valor.`}
                                >
                                  <Icon name="warning" className="text-[12px]" />
                                  Abaixo do mín.: faltam {formatarMoeda(pedido.pedidoMinimo - (pedido.total ?? 0))} (mín: {formatarMoeda(pedido.pedidoMinimo)})
                                </span>
                              )
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-on-surface-variant/70 mt-0.5 flex-wrap">
                            {pedido.condicaoPagamento && (
                              <span className="flex items-center gap-1">
                                <Icon name="payments" className="text-[13px] text-on-surface-variant/90" />
                                {pedido.condicaoPagamento}
                              </span>
                            )}
                            {pedido.prazoEntregaEstimado && (
                              <span className="flex items-center gap-1">
                                <Icon name="local_shipping" className="text-[13px] text-on-surface-variant/90" />
                                Entrega: {pedido.prazoEntregaEstimado}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-on-surface-variant/70 font-medium">
                            Subtotal
                          </div>
                          <div className="text-base sm:text-lg font-bold font-mono text-primary drop-shadow-[0_0_8px_rgba(78,222,163,0.35)]">
                            {formatarMoeda(pedido.total ?? 0)}
                          </div>
                        </div>

                        <div
                          className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant transition-transform duration-200 ${
                            aberto ? 'rotate-180 text-primary bg-primary/10' : ''
                          }`}
                        >
                          <Icon name="expand_more" className="text-lg" />
                        </div>
                      </div>
                    </button>

                    {/* Corpo do Pedido em Sanfona */}
                    {aberto && (
                      <div className="border-t border-white/10 p-3 sm:p-4 space-y-3 bg-[#111813]/60">
                        <div className="overflow-x-auto rounded-none border border-white/10">
                          <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0">
                            <thead>
                              <tr className="bg-[#18231c] text-on-surface-variant text-[11px] uppercase tracking-wider">
                                <th className="py-2 px-3 font-semibold border-b border-white/10">Produto</th>
                                <th className="py-2 px-3 font-semibold border-b border-white/10">Embalagem</th>
                                <th className="py-2 px-3 font-semibold border-b border-white/10 text-center min-w-[170px]">Qtd Solicitada</th>
                                <th className="py-2 px-3 font-semibold border-b border-white/10 text-right">Preço Unit.</th>
                                <th className="py-2 px-3 font-semibold border-b border-white/10 text-right">Preço Emb.</th>
                                <th className="py-2 px-3 font-semibold border-b border-white/10 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {itens.map((it) => (
                                <tr key={it.id || it.itemCotacaoId} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-2.5 px-3">
                                    <div className="font-medium text-on-surface flex items-center gap-1.5">
                                      <span>{it.nomeSnapshot}</span>
                                      {it.decididoPorDesempate && (
                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">
                                          Desempate
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-on-surface-variant font-mono">
                                    {formatarEmbalagemDesc(it.quantidadePorEmbalagemSnapshot, it.unidadeSnapshot)}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <CampoQuantidadeInline
                                      item={{
                                        itemCotacaoId: it.itemCotacaoId || it.id,
                                        nome: it.nomeSnapshot,
                                        quantidadeSolicitada: it.quantidade,
                                        quantidadePorEmbalagem: it.quantidadePorEmbalagemSnapshot,
                                        unidade: it.unidadeSnapshot,
                                      }}
                                      editavel={!ehApurada}
                                      aoAtualizar={(itemId, qtd) => mutAtualizarQtd.mutate({ itemId, quantidade: qtd })}
                                      atualizando={mutAtualizarQtd.isPending && itemAtualizandoId === (it.itemCotacaoId || it.id)}
                                      alinhamento="center"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant">
                                    {formatarMoeda(it.precoUnitario ?? 0)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant">
                                    {it.precoEmbalagem ? formatarMoeda(it.precoEmbalagem) : '—'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-primary">
                                    {formatarMoeda(it.subtotal ?? 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-[#141d17] font-semibold text-on-surface">
                                <td colSpan={5} className="py-2 px-3 text-right text-xs uppercase tracking-wider text-on-surface-variant">
                                  Total do Fornecedor:
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-primary text-sm sm:text-base">
                                  {formatarMoeda(pedido.total ?? 0)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        {/* Ações do Pedido Oficial */}
                        {ehApurada ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                              {pedido.enviadoEm && (
                                <span className="inline-flex items-center gap-1 text-sky-400">
                                  <Icon name="check" className="text-xs" />
                                  Enviado em {formatarData(pedido.enviadoEm)}
                                </span>
                              )}
                              {pedido.confirmadoEm && (
                                <span className="inline-flex items-center gap-1 text-emerald-400 ml-2">
                                  <Icon name="done_all" className="text-xs" />
                                  Confirmado em {formatarData(pedido.confirmadoEm)}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => handleBaixarPdf(pedido.id, pedido.empresaNome)}
                                disabled={baixandoPdfId === pedido.id}
                                className="!py-1 !px-2.5 !text-xs"
                              >
                                <Icon name="picture_as_pdf" className="text-[15px] text-red-400" />
                                {baixandoPdfId === pedido.id ? 'Baixando…' : 'Baixar PDF'}
                              </Button>

                              <Button
                                variant="ghost"
                                onClick={() => handleCopiarResumo(pedido)}
                                className="!py-1 !px-2.5 !text-xs"
                              >
                                <Icon name="content_copy" className="text-[15px]" />
                                Copiar Texto
                              </Button>

                              <Button
                                variant="ghost"
                                onClick={() => handleEnviarWhatsApp(pedido)}
                                className="!py-1 !px-2.5 !text-xs border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                              >
                                <Icon name="chat" className="text-[15px] text-emerald-400" />
                                Enviar WhatsApp
                              </Button>

                              {pedido.status === 'GERADO' && pedido.id && (
                                <Button
                                  variant="primary"
                                  onClick={() => enviarPedido.mutate(pedido.id!)}
                                  disabled={enviandoPedidoId === pedido.id}
                                  className="!py-1 !px-2.5 !text-xs"
                                >
                                  <Icon name="mark_email_read" className="text-[15px]" />
                                  {enviandoPedidoId === pedido.id ? 'Marcando…' : 'Marcar como Enviado'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1.5 text-xs text-on-surface-variant/80 border-t border-white/5">
                            <span className="flex items-center gap-1">
                              <Icon name="info" className="text-xs text-primary shrink-0" />
                              Você pode ajustar as quantidades dos itens acima livremente antes de apurar.
                            </span>
                            {onIrParaAoVivo && (
                              <button
                                onClick={onIrParaAoVivo}
                                className="text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer shrink-0"
                              >
                                Ver todos na Grade Geral
                                <Icon name="arrow_forward" className="text-xs" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* ABA 3: ITENS SEM VENCEDOR OU SEM PROPOSTA                    */}
        {/* ============================================================ */}
        {visualizacao === 'sem_vencedor' && (
          <div className="w-full">
            {itensSemVencedor.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Icon name="check_circle" className="text-3xl text-primary mx-auto" />
                <p className="text-sm text-on-surface font-medium">100% dos produtos têm vencedor!</p>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Todos os itens desta cotação receberam ao menos uma proposta válida dos fornecedores.
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10">
                  <div className="flex items-center gap-2">
                    <Icon name="warning" className="text-lg text-amber-300 shrink-0" />
                    <p className="text-xs text-amber-200">
                      Estes <strong>{itensSemVencedor.length} produtos</strong> não receberam propostas ou foram desclassificados.
                    </p>
                  </div>
                  {ehApurada && (
                    <Button
                      variant="ghost"
                      onClick={() => setModalRecotarAberto(true)}
                      disabled={recotar.isPending}
                      className="border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 !py-1 !px-2.5 !text-xs shrink-0"
                    >
                      <Icon name="restart_alt" className="text-sm" />
                      Recotar estes itens
                    </Button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-none border border-white/10">
                  <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-[#18231c] text-on-surface-variant text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 font-semibold border-b border-white/10">Produto</th>
                        <th className="py-2.5 px-3 font-semibold border-b border-white/10">Embalagem Solicitada</th>
                        <th className="py-2.5 px-3 font-semibold border-b border-white/10 text-center min-w-[170px]">Qtd Solicitada</th>
                        <th className="py-2.5 px-3 font-semibold border-b border-white/10 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {itensSemVencedor.map((it) => (
                        <tr key={it.id} className="text-on-surface-variant hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-3 font-medium text-on-surface">{it.nome}</td>
                          <td className="py-2.5 px-3 font-mono">
                            {formatarEmbalagemDesc(it.quantidadePorEmbalagem, it.unidade)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <CampoQuantidadeInline
                              item={{
                                itemCotacaoId: it.id,
                                nome: it.nome,
                                quantidadeSolicitada: it.quantidadeSolicitada,
                                quantidadePorEmbalagem: it.quantidadePorEmbalagem,
                                unidade: it.unidade,
                              }}
                              editavel={!ehApurada}
                              aoAtualizar={(itemId, qtd) => mutAtualizarQtd.mutate({ itemId, quantidade: qtd })}
                              atualizando={mutAtualizarQtd.isPending && itemAtualizandoId === it.id}
                              alinhamento="center"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25">
                              Sem lances
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* Modais de Confirmação                                        */}
      {/* ============================================================ */}
      <Modal
        open={modalApurarAberto}
        onClose={() => setModalApurarAberto(false)}
        title="Confirmar Apuração da Cotação"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <Icon name="task_alt" className="text-2xl shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-on-surface leading-relaxed">
              Você está prestes a apurar a cotação <strong>{cotacao?.titulo ?? 'atual'}</strong>.
              Esta operação consolidará os menores preços em{' '}
              <strong>{pedidosAgrupados.length} pedidos de compra definitivos</strong>, totalizando{' '}
              <strong className="text-primary">{formatarMoeda(totalGeral)}</strong>.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            ⚠️ <strong>Atenção:</strong> Após a apuração, os lances e fornecedores vencedores não poderão mais ser alterados.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setModalApurarAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setModalApurarAberto(false)
                onApurar?.()
              }}
              disabled={apurando}
            >
              <Icon name="check" className="text-[16px]" />
              {apurando ? 'Apurando…' : 'Confirmar e Gerar Pedidos'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={modalRecotarAberto}
        onClose={() => setModalRecotarAberto(false)}
        title="Recotar Itens Sem Vencedor"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Uma nova cotação será criada contendo os <strong>{itensSemVencedor.length} itens</strong> que não tiveram vencedor. Você poderá convidar novos fornecedores para cotá-los.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setModalRecotarAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => recotar.mutate()}
              disabled={recotar.isPending}
            >
              <Icon name="restart_alt" className="text-[16px]" />
              {recotar.isPending ? 'Criando…' : 'Criar Nova Cotação'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
