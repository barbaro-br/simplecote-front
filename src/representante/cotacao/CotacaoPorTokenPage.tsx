import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { dataHoraBr } from '@/shared/format/formatters'
import { ApiError } from '@/shared/api/api-client'
import { cn } from '@/shared/lib/utils'
import { Superficie, SecaoCabecalho, SubFaixa, Selo, BotaoPrimario } from '@/shared/ui'
import { usePullToRefresh } from '@/shared/hooks/usePullToRefresh'
import { LinhaPreco } from './LinhaPreco'
import { CondicoesResposta } from './CondicoesResposta'
import { ConfirmarEnvioDialog } from './ConfirmarEnvioDialog'
import { TelaDeSucesso } from './TelaDeSucesso'
import { useCotacaoPorToken, useFinalizar } from './cotacao-token.api'
import { useFilaDeSincronizacao } from './useFilaDeSincronizacao'
import { useRodapeEscondido } from './useRodapeEscondido'
import { prazoExpirando, contarComPreco, itemEhNovo } from './cotacao-token.derivados'
import type { CotacaoPorToken } from './cotacao-token.schema'

function estaVencido(prazo: string | null): boolean {
  return prazo != null && new Date(prazo).getTime() < Date.now()
}

/** Casca escura das rotas por token (Fase 1 do redesign). */
function Casca({ children }: { children: ReactNode }) {
  return (
    <div data-painel="dark" className="min-h-screen">
      {children}
    </div>
  )
}

export function CotacaoPorTokenPage() {
  const { token = '' } = useParams()
  const cotacao = useCotacaoPorToken(token)
  const fila = useFilaDeSincronizacao(token)
  const finalizar = useFinalizar(token)
  const { isRefreshing, pullY } = usePullToRefresh(() => cotacao.refetch())
  const rodapeEscondido = useRodapeEscondido()

  const [erroFinal, setErroFinal] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [finalizado, setFinalizado] = useState(false)

  // "Itens com preço agora" — reflete a digitação na hora, alimenta a bolha.
  // Semeado dos dados da API assim que chegam, sem efeito e sem flicker.
  const [temPrecoLocal, setTemPrecoLocal] = useState<Record<string, boolean> | null>(null)
  const [fonteSemeada, setFonteSemeada] = useState<CotacaoPorToken | null>(null)
  const [idsConhecidos, setIdsConhecidos] = useState<Set<string> | null>(null)
  if (cotacao.data && cotacao.data !== fonteSemeada) {
    const data = cotacao.data
    setFonteSemeada(data)
    setTemPrecoLocal((prev) => {
      const base = prev ?? {}
      const novos = Object.fromEntries(
        data.itens
          .filter((i) => !(i.itemCotacaoId in base))
          .map((i) => [i.itemCotacaoId, i.preco != null]),
      )
      return { ...base, ...novos }
    })
    if (idsConhecidos === null) {
      setIdsConhecidos(new Set(data.itens.map((i) => i.itemCotacaoId)))
    }
  }

  const onPrecoChange = useCallback((id: string, temPreco: boolean) => {
    setTemPrecoLocal((m) => {
      const base = m ?? {}
      return base[id] === temPreco ? base : { ...base, [id]: temPreco }
    })
  }, [])

  const d = cotacao.data
  const comPreco = temPrecoLocal
    ? Object.values(temPrecoLocal).filter(Boolean).length
    : d
      ? contarComPreco(d.itens)
      : 0
  const [bolhaKey, setBolhaKey] = useState(0)
  const comPrecoAnteriorRef = useRef(comPreco)
  useEffect(() => {
    if (comPreco !== comPrecoAnteriorRef.current) {
      setBolhaKey((k) => k + 1)
      comPrecoAnteriorRef.current = comPreco
    }
  }, [comPreco])

  const puxarParaAtualizar =
    (pullY > 0 || isRefreshing) && (
      <div
        className="flex w-full justify-center transition-transform"
        style={{ transform: `translateY(${pullY}px)`, height: 0 }}
      >
        <div className="z-50 flex items-center gap-2 rounded-full border border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-[var(--pnl-superficie,#12263f)] px-3 py-1 text-sm text-[var(--pnl-txt-2,rgba(255,255,255,0.7))] shadow-md">
          {isRefreshing ? (
            <span className="inline-block size-4 animate-spin rounded-full border-2 border-[var(--pnl-acento,#57bf8e)] border-t-transparent" />
          ) : (
            <span className="inline-block w-4 text-center">↓</span>
          )}
          {isRefreshing ? 'Atualizando…' : 'Puxe para atualizar'}
        </div>
      </div>
    )

  if (cotacao.isLoading) {
    return (
      <Casca>        {puxarParaAtualizar}
        <p className="p-6 text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">Carregando…</p>
      </Casca>
    )
  }

  if (cotacao.error || !d) {
    return (
      <Casca>
        <div className="mx-auto max-w-md space-y-2 p-6 text-center">
          <h1 className="text-xl font-semibold text-[var(--pnl-txt,#fff)]">Link inválido</h1>
          <p className="text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
            Este link de cotação não é válido ou expirou. Peça um novo ao comprador.
          </p>
        </div>
      </Casca>
    )
  }

  const somenteLeitura = !d.podeEditar
  const expirando = prazoExpirando(d.prazo)
  const vencido = estaVencido(d.prazo)
  const total = d.itens.length
  const semPreco = total - comPreco
  const primeiroNome = d.representanteNome.split(' ')[0]

  // Itens que o comprador adicionou depois do 1º carregamento vão pro fim da
  // lista (o `sort` é estável — os demais mantêm a ordem alfabética da API),
  // pra o representante não ter que caçar o item novo no meio do alfabeto.
  const conhecidos = idsConhecidos ?? new Set<string>()
  const itensOrdenados = [...d.itens].sort(
    (a, b) => Number(itemEhNovo(a, conhecidos)) - Number(itemEhNovo(b, conhecidos)),
  )
  const primeiroSemPreco = itensOrdenados.find((i) => i.preco == null)?.itemCotacaoId ?? null

  function temPrecoAgora(id: string, precoDoServidor: number | null): boolean {
    return temPrecoLocal ? Boolean(temPrecoLocal[id]) : precoDoServidor != null
  }

  // "Pulado": item sem preço com outro DEPOIS dele (na ordem exibida) já
  // preenchido — o representante claramente já passou por ele. Só um aviso
  // visual (não grava nada); ninguém precisa marcar "não cotado" à mão. Ao
  // finalizar, o back converte o que sobrar em NAO_COTADO de verdade.
  const pulados = new Set<string>()
  let algumDepoisTemPreco = false
  for (let i = itensOrdenados.length - 1; i >= 0; i--) {
    const item = itensOrdenados[i]
    const temPreco = temPrecoAgora(item.itemCotacaoId, item.preco)
    if (!temPreco && algumDepoisTemPreco) pulados.add(item.itemCotacaoId)
    algumDepoisTemPreco = algumDepoisTemPreco || temPreco
  }

  async function confirmarEnvio() {
    setConfirmando(false)
    setErroFinal(null)
    try {
      await finalizar.mutateAsync()
      fila.limpar()
      setFinalizado(true)
    } catch (e) {
      setErroFinal(
        e instanceof ApiError ? e.message : 'Não foi possível finalizar. Tente novamente.',
      )
    }
  }

  // Tela de sucesso enquanto a resposta continua fechada. Se o comprador
  // adicionar item numa cotação já respondida, o back reabre a resposta
  // (`podeEditar` volta a `true`, `somenteLeitura` a `false`) e o refetch
  // periódico traz o representante de volta pra lista — sem recarregar nem
  // ligar pro comprador.
  if (finalizado && somenteLeitura) {
    return (
      <Casca>
        <TelaDeSucesso nome={primeiroNome} aoFechar={() => setFinalizado(false)} />
      </Casca>
    )
  }

  const rotuloBotao =
    fila.pendencias > 0
      ? `Sincronizando ${fila.pendencias} preço(s)…`
      : finalizar.isPending
        ? 'Enviando…'
        : 'Enviar respostas'
  const completo = total > 0 && comPreco === total

  return (
    <Casca>      {puxarParaAtualizar}

      <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-40">
        <Superficie>
          <SecaoCabecalho
            titulo={d.titulo}
            acao={
              somenteLeitura ? (
                <Selo tom={d.participanteStatus === 'RESPONDIDO' ? 'sucesso' : 'neutro'}>
                  {d.participanteStatus === 'RESPONDIDO' ? 'Respondido' : 'Fechada'}
                </Selo>
              ) : (
                <Selo tom="info">Aberta</Selo>
              )
            }
          />
          <SubFaixa
            esquerda={`Olá, ${primeiroNome} · ${d.empresaNome} · cotação de ${d.compradorNome}`}
            direita={
              d.prazo ? (
                <span
                  className={cn(
                    expirando || vencido
                      ? 'font-semibold text-[var(--pnl-atencao,#e0a030)]'
                      : undefined,
                  )}
                >
                  {vencido ? 'Prazo expirado' : `Prazo: ${dataHoraBr(d.prazo)}`}
                </span>
              ) : undefined
            }
          />

          {somenteLeitura && (
            <div className="border-b border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.03] px-4 py-2.5 text-[13px] text-[var(--pnl-txt-2,rgba(255,255,255,0.7))] sm:px-5">
              {d.participanteStatus === 'RESPONDIDO'
                ? 'Sua resposta já foi enviada. Os preços abaixo são só para conferência.'
                : 'Esta cotação não está aberta para respostas.'}
            </div>
          )}

          <CondicoesResposta
            token={token}
            condicaoPagamento={d.condicaoPagamento}
            prazoEntregaEstimado={d.prazoEntregaEstimado}
            condicoesPagamentoDisponiveis={d.condicoesPagamentoDisponiveis}
            podeEditar={d.podeEditar}
          />

          {/* Cartão por item, não tabela: o nome usa a largura toda (só quebra
              se for realmente comprido) e o preço tem linha própria embaixo —
              nada disputando coluna com nome nenhum. */}
          <div className="flex flex-col gap-2 p-4 sm:p-5">
            {itensOrdenados.map((item) => (
              <LinhaPreco
                key={item.itemCotacaoId}
                item={item}
                podeEditar={d.podeEditar}
                autoFocus={item.itemCotacaoId === primeiroSemPreco}
                status={fila.statusPorItem[item.itemCotacaoId]}
                erro={fila.errosPorItem[item.itemCotacaoId]}
                novo={itemEhNovo(item, idsConhecidos ?? new Set())}
                pulado={pulados.has(item.itemCotacaoId)}
                aoAssentar={(patch) => fila.gravarEEnviar(item.itemCotacaoId, patch)}
                onPrecoChange={onPrecoChange}
              />
            ))}
          </div>
        </Superficie>
      </div>

      {!somenteLeitura && (
        <div
          data-painel="dark"
          className="fixed inset-x-0 bottom-0 z-10 transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            // Em celular, sai de cena enquanto o representante digita um preço
            // (teclado aberto) ou rola a lista para baixo; volta ao rolar para
            // cima ou perto do fim. 120% cobre a barra de progresso acima.
            transform: rodapeEscondido ? 'translateY(120%)' : 'translateY(0)',
          }}
          aria-hidden={rodapeEscondido}
        >
          <div className="mx-auto w-full max-w-3xl px-4">
            <div className="flex items-center justify-between gap-3 rounded-t-2xl border border-b-0 border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-[var(--pnl-superficie,#12263f)] px-4 py-3 shadow-[0_-16px_44px_-16px_rgba(0,0,0,0.7)] sm:px-5">
              <div
                role="status"
                aria-label={`${comPreco} de ${total} itens com preço`}
                className={cn(
                  'flex items-baseline gap-1 rounded-full px-3 py-1 transition-colors',
                  completo ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-[var(--pnl-txt,#fff)]',
                )}
              >
                <span key={bolhaKey} className="pop text-base font-bold leading-none tabular-nums">
                  {comPreco}
                </span>
                <span className="text-[11px] font-normal opacity-70">de {total}</span>
              </div>

              <BotaoPrimario
                className="h-11 px-5 text-[14px]"
                disabled={fila.pendencias > 0 || finalizar.isPending}
                onClick={() => setConfirmando(true)}
              >
                {rotuloBotao}
              </BotaoPrimario>
            </div>
            {erroFinal && (
              <p role="alert" className="px-4 pt-1 text-[12px] text-[var(--pnl-perigo,#ff6b6b)]">
                {erroFinal}
              </p>
            )}
          </div>
        </div>
      )}

      <ConfirmarEnvioDialog
        aberto={confirmando}
        itensSemPreco={semPreco}
        total={total}
        aoConfirmar={confirmarEnvio}
        aoCancelar={() => setConfirmando(false)}
      />
    </Casca>
  )
}
