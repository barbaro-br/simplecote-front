import { useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { FileArrowDown, CheckCircle } from '@phosphor-icons/react'
import { moeda } from '@/shared/format/formatters'
import { ApiError } from '@/shared/api/api-client'
import {
  Superficie,
  SecaoCabecalho,
  SubFaixa,
  GradeDados,
  RodapeAcao,
  CampoEstat,
  Selo,
  BotaoPrimario,
  BotaoFantasma,
} from '@/shared/ui'
import { baixarPedidoPdfPublico, useConfirmarPedido, usePedidoPorToken } from './pedido-token.api'

function Casca({ children }: { children: ReactNode }) {
  return (
    <div data-painel="dark" className="min-h-screen">
      {children}
    </div>
  )
}

export function PedidoPorTokenPage() {
  const { token = '' } = useParams()
  const pedido = usePedidoPorToken(token)
  const confirmar = useConfirmarPedido(token)
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  if (pedido.isLoading) {
    return (
      <Casca>
        <p className="p-6 text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">Carregando…</p>
      </Casca>
    )
  }

  if (pedido.error || !pedido.data) {
    return (
      <Casca>
        <div className="mx-auto max-w-md space-y-2 p-6 text-center">
          <h1 className="text-xl font-semibold text-[var(--pnl-txt,#fff)]">Link inválido</h1>
          <p className="text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
            Este link de pedido não é válido ou expirou.
          </p>
        </div>
      </Casca>
    )
  }

  const p = pedido.data
  const confirmado = p.status === 'CONFIRMADO' || p.confirmadoEm != null
  const aguardandoEnvio = p.status === 'GERADO'

  async function aoConfirmar() {
    setErro(null)
    try {
      await confirmar.mutateAsync(observacao.trim() || undefined)
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível confirmar. Tente novamente.')
    }
  }

  return (
    <Casca>
      <div className="mx-auto w-full max-w-xl px-4 py-6 pb-40">
        <Superficie>
          <SecaoCabecalho
            titulo="Pedido"
            nivelTitulo={1}
            acao={
              confirmado ? (
                <Selo tom="sucesso" icone={CheckCircle}>
                  Pedido confirmado
                </Selo>
              ) : (
                <Selo tom="info">Aguardando confirmação</Selo>
              )
            }
          />
          <SubFaixa
            esquerda={p.empresaNome}
            direita={confirmado ? undefined : 'Confira os itens e confirme'}
          />

          <GradeDados
            rotuloItem="Item"
            minWidth={340}
            colunas={[
              { chave: 'qtd', rotulo: 'Qtd.' },
              { chave: 'subtotal', rotulo: 'Subtotal' },
            ]}
            linhas={p.itens.map((item) => ({
              chave: item.id,
              titulo: item.nomeSnapshot,
              celulas: [{ valor: item.quantidade }, { valor: moeda(item.subtotal) }],
            }))}
          />

          <RodapeAcao
            esquerda={<CampoEstat inline rotulo="Total do pedido" valor={moeda(p.total)} />}
          />

          {confirmado && p.observacao && (
            <div className="border-t border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.03] px-4 py-3 text-[13px] text-[var(--pnl-txt-2,rgba(255,255,255,0.7))] sm:px-5">
              <span className="font-medium text-[var(--pnl-txt,#fff)]">Sua observação:</span>{' '}
              {p.observacao}
            </div>
          )}
        </Superficie>
      </div>

      <div
        data-painel="dark"
        className="fixed inset-x-0 bottom-0 z-10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto w-full max-w-xl space-y-3 rounded-t-2xl border border-b-0 border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-[var(--pnl-superficie,#12263f)] px-4 py-3 shadow-[0_-16px_44px_-16px_rgba(0,0,0,0.7)] sm:px-5">
          {erro && (
            <p role="alert" className="text-[13px] font-medium text-[var(--pnl-perigo,#ff6b6b)]">
              {erro}
            </p>
          )}

          {aguardandoEnvio && (
            <div className="rounded-md border border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.03] px-3 py-2 text-[13px] text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]">
              Aguardando envio pelo comprador.
            </div>
          )}

          {!aguardandoEnvio && !confirmado && (
            <div className="space-y-1.5">
              <label
                htmlFor="obs"
                className="text-[13px] font-medium text-[var(--pnl-txt-2,rgba(255,255,255,0.7))]"
              >
                Observação{' '}
                <span className="font-normal text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
                  (opcional)
                </span>
              </label>
              <textarea
                id="obs"
                value={observacao}
                maxLength={500}
                rows={2}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Alguma instrução para a entrega?"
                className="w-full rounded-md border border-[var(--pnl-borda,rgba(255,255,255,0.1))] bg-white/[0.04] px-3 py-2 text-[13px] text-[var(--pnl-txt,#fff)] placeholder:text-[var(--pnl-txt-4,rgba(255,255,255,0.3))] focus:outline-none focus:ring-1 focus:ring-[var(--pnl-acento,#57bf8e)]/50"
              />
            </div>
          )}

          <div className="flex gap-2">
            <BotaoFantasma
              className="h-11 flex-1 text-[14px]"
              onClick={() => {
                setErro(null)
                baixarPedidoPdfPublico(token).catch(() => setErro('Não foi possível baixar o PDF.'))
              }}
            >
              <FileArrowDown className="size-4" aria-hidden />
              Baixar PDF
            </BotaoFantasma>

            {!aguardandoEnvio && !confirmado && (
              <BotaoPrimario
                className="h-11 flex-[2] text-[14px]"
                disabled={confirmar.isPending}
                onClick={aoConfirmar}
              >
                {confirmar.isPending ? 'Confirmando…' : 'Confirmar'}
              </BotaoPrimario>
            )}
          </div>
        </div>
      </div>
    </Casca>
  )
}
