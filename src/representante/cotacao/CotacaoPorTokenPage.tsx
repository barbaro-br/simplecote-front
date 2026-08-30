import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { dataHoraBr } from '@/shared/format/formatters'
import { ApiError } from '@/shared/api/api-client'
import { ItemLanceCard } from './ItemLanceCard'
import { ConfirmarEnvioDialog } from './ConfirmarEnvioDialog'
import { TelaDeSucesso } from './TelaDeSucesso'
import { TutorialOnboarding } from './TutorialOnboarding'
import { useCotacaoPorToken, useFinalizar } from './cotacao-token.api'
import { useFilaDeSincronizacao } from './useFilaDeSincronizacao'
import { prazoExpirando, contarComPreco } from './cotacao-token.derivados'
import type { CotacaoPorToken } from './cotacao-token.schema'

const CHAVE_TUTORIAL = 'simplecote:tutorial-preco:v1'

function tutorialJaVisto(): boolean {
  try {
    return localStorage.getItem(CHAVE_TUTORIAL) != null
  } catch {
    return false
  }
}
function marcarTutorialVisto() {
  try {
    localStorage.setItem(CHAVE_TUTORIAL, '1')
  } catch {
    /* modo privado / storage indisponível — só não persiste */
  }
}

function estaVencido(prazo: string | null): boolean {
  return prazo != null && new Date(prazo).getTime() < Date.now()
}

export function CotacaoPorTokenPage() {
  const { token = '' } = useParams()
  const cotacao = useCotacaoPorToken(token)
  const fila = useFilaDeSincronizacao(token)
  const finalizar = useFinalizar(token)

  const [erroFinal, setErroFinal] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [finalizado, setFinalizado] = useState(false)
  const [mostrarTutorial, setMostrarTutorial] = useState(() => !tutorialJaVisto())

  // "Itens com preço agora" — reflete a digitação na hora, alimenta a bolha.
  // Semeado dos dados da API assim que chegam (padrão React de ajustar estado
  // quando uma entrada muda), sem efeito e sem flicker de "0 de N".
  const [temPrecoLocal, setTemPrecoLocal] = useState<Record<string, boolean> | null>(null)
  const [fonteSemeada, setFonteSemeada] = useState<CotacaoPorToken | null>(null)
  if (cotacao.data && cotacao.data !== fonteSemeada) {
    setFonteSemeada(cotacao.data)
    setTemPrecoLocal(
      Object.fromEntries(cotacao.data.itens.map((i) => [i.itemCotacaoId, i.preco != null])),
    )
  }

  const onPrecoChange = useCallback((id: string, temPreco: boolean) => {
    setTemPrecoLocal((m) => {
      const base = m ?? {}
      return base[id] === temPreco ? base : { ...base, [id]: temPreco }
    })
  }, [])

  function dispensarTutorial() {
    marcarTutorialVisto()
    setMostrarTutorial(false)
  }

  const tutorialEl = mostrarTutorial ? (
    <TutorialOnboarding aoConcluir={dispensarTutorial} />
  ) : null

  // Bolha "N de T": anima o número a cada mudança de N.
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

  if (cotacao.isLoading) {
    return (
      <>
        {tutorialEl}
        <p className="p-6 text-muted-foreground">Carregando…</p>
      </>
    )
  }

  if (cotacao.error || !d) {
    return (
      <div className="mx-auto max-w-md space-y-2 p-6 text-center">
        <h1 className="text-xl font-semibold">Link inválido</h1>
        <p className="text-muted-foreground">
          Este link de cotação não é válido ou expirou. Peça um novo ao comprador.
        </p>
      </div>
    )
  }

  const somenteLeitura = !d.podeEditar
  const expirando = prazoExpirando(d.prazo)
  const vencido = estaVencido(d.prazo)
  const total = d.itens.length
  const semPreco = total - comPreco
  const primeiroNome = d.representanteNome.split(' ')[0]
  const primeiroSemPreco = d.itens.find((i) => i.preco == null)?.itemCotacaoId ?? null

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

  if (finalizado) {
    return <TelaDeSucesso nome={primeiroNome} aoFechar={() => setFinalizado(false)} />
  }

  // Comentário: TemaClaro.tsx atua como container de rolagem.
  return (
    <div className="mx-auto max-w-2xl pb-40">
      {tutorialEl}

      <div className="space-y-2 px-4 pt-6">
        {somenteLeitura && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
            {d.participanteStatus === 'RESPONDIDO'
              ? 'Sua resposta já foi enviada. Os preços abaixo são só para conferência.'
              : 'Esta cotação não está aberta para respostas.'}
          </div>
        )}

        {d.itens.map((item, i) => (
          <div key={item.itemCotacaoId} className="scroll-mt-4">
            <ItemLanceCard
              item={item}
              index={i + 1}
              podeEditar={d.podeEditar}
              autoFocus={item.itemCotacaoId === primeiroSemPreco}
              status={fila.statusPorItem[item.itemCotacaoId]}
              erro={fila.errosPorItem[item.itemCotacaoId]}
              aoAssentar={(patch) => fila.gravarEEnviar(item.itemCotacaoId, patch)}
              onPrecoChange={onPrecoChange}
            />
          </div>
        ))}
      </div>

      {!somenteLeitura && (
        <div
          className="fixed inset-x-0 bottom-0 z-10 overflow-visible border-t border-border bg-card shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="absolute -top-5 left-5">
            <div
              role="status"
              aria-label={`${comPreco} de ${total} itens com preço`}
              className={`flex items-baseline gap-0.5 rounded-full px-3 py-1.5 shadow-lg transition-colors duration-300 ${
                total > 0 && comPreco === total
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-foreground text-background'
              }`}
            >
              <span key={bolhaKey} className="pop text-[18px] font-bold leading-none">
                {comPreco}
              </span>{' '}
              <span className="mx-0.5 text-[11px] font-normal opacity-70">de</span>{' '}
              <span className="text-[14px] font-semibold leading-none">{total}</span>
            </div>
          </div>

          <div className="mx-auto flex max-w-2xl items-center gap-4 px-5 pb-4 pt-4">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[16px] font-bold leading-tight">{d.titulo}</h1>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Olá, {primeiroNome}!
              </p>
              <p className="text-[13px] text-muted-foreground">
                {d.empresaNome} · cotação de {d.compradorNome}
              </p>
              {d.prazo && (
                <p
                  className={`mt-0.5 text-[11px] ${
                    expirando || vencido ? 'font-semibold text-destructive' : 'text-muted-foreground'
                  }`}
                >
                  {vencido ? 'Prazo expirado' : `Prazo: ${dataHoraBr(d.prazo)}`}
                </p>
              )}
              {erroFinal && (
                <p role="alert" className="mt-1 text-[13px] text-destructive">
                  {erroFinal}
                </p>
              )}
            </div>

            <Button
              className="h-12 shrink-0 rounded-2xl px-6 text-[15px]"
              disabled={fila.pendencias > 0 || finalizar.isPending}
              onClick={() => setConfirmando(true)}
            >
              {fila.pendencias > 0
                ? `Sincronizando ${fila.pendencias} preço(s)…`
                : finalizar.isPending
                  ? 'Finalizando…'
                  : 'Finalizar'}
            </Button>
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
    </div>
  )
}
