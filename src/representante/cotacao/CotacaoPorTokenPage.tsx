import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { dataHoraBr } from '@/shared/format/formatters'
import { ApiError } from '@/shared/api/api-client'
import { ItemLanceCard } from './ItemLanceCard'
import { useCotacaoPorToken, useFinalizar } from './cotacao-token.api'
import { useFilaDeSincronizacao } from './useFilaDeSincronizacao'

export function CotacaoPorTokenPage() {
  const { token = '' } = useParams()
  const cotacao = useCotacaoPorToken(token)
  const fila = useFilaDeSincronizacao(token)
  const finalizar = useFinalizar(token)
  const [erroFinal, setErroFinal] = useState<string | null>(null)

  if (cotacao.isLoading) {
    return <p className="p-6 text-muted-foreground">Carregando…</p>
  }

  if (cotacao.error || !cotacao.data) {
    return (
      <div className="mx-auto max-w-md p-6 text-center space-y-2">
        <h1 className="text-xl font-semibold">Link inválido</h1>
        <p className="text-muted-foreground">
          Este link de cotação não é válido ou expirou. Peça um novo ao comprador.
        </p>
      </div>
    )
  }

  const d = cotacao.data
  const somenteLeitura = !d.podeEditar

  async function aoFinalizar() {
    setErroFinal(null)
    try {
      await finalizar.mutateAsync()
      fila.limpar()
    } catch (e) {
      setErroFinal(e instanceof ApiError ? e.message : 'Não foi possível finalizar. Tente novamente.')
    }
  }

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Olá, {d.representanteNome.split(' ')[0]}!</h1>
        <p className="text-sm text-muted-foreground">
          {d.empresaNome} · cotação de {d.compradorNome}
        </p>
        <p className="text-base font-medium pt-1">{d.titulo}</p>
        {d.prazo && (
          <p className="text-sm text-muted-foreground">Prazo: {dataHoraBr(d.prazo)}</p>
        )}
      </header>

      {somenteLeitura && (
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
          {d.participanteStatus === 'RESPONDIDO'
            ? 'Sua resposta já foi enviada. Os preços abaixo são só para conferência.'
            : 'Esta cotação não está aberta para respostas.'}
        </div>
      )}

      <div className="space-y-3">
        {d.itens.map((item) => (
          <ItemLanceCard
            key={item.itemCotacaoId}
            item={item}
            podeEditar={d.podeEditar}
            status={fila.statusPorItem[item.itemCotacaoId]}
            erro={fila.errosPorItem[item.itemCotacaoId]}
            aoAssentar={(patch) => fila.gravarEEnviar(item.itemCotacaoId, patch)}
          />
        ))}
      </div>

      {!somenteLeitura && (
        <div className="space-y-2 pt-2">
          {erroFinal && (
            <div role="alert" className="text-sm text-destructive">
              {erroFinal}
            </div>
          )}
          <Button
            className="w-full h-12 text-base"
            disabled={fila.pendencias > 0 || finalizar.isPending}
            onClick={aoFinalizar}
          >
            {fila.pendencias > 0
              ? `Sincronizando ${fila.pendencias} preço(s)…`
              : finalizar.isPending
                ? 'Finalizando…'
                : 'Finalizar resposta'}
          </Button>
        </div>
      )}
    </div>
  )
}
