import { moeda, dataHoraBr } from '@/shared/format/formatters'
import type { InsightEmpresa } from './analise.schema'

interface Props {
  insight: InsightEmpresa | null | 'erro'
}

export function duracaoAprox(segundos: number): string {
  if (segundos < 60) return '< 1 min'
  const horas = segundos / 3600
  if (horas >= 24) return `~${Math.round(horas / 24)} dia${Math.round(horas / 24) > 1 ? 's' : ''}`
  if (horas >= 1) return `~${Math.round(horas)} h`
  const min = Math.round(segundos / 60)
  return `~${min} min`
}

export function InsightEmpresaCard({ insight }: Props) {
  if (insight === 'erro' || insight === null) {
    return (
      <div className="p-4 w-72 text-sm bg-popover text-muted-foreground rounded-md shadow-md border" data-testid="insight-empresa-vazio">
        Sem dados de relacionamento.
      </div>
    )
  }

  const {
    taxaResposta,
    itensVencidos,
    valorComprado,
    ultimaCompra,
    maisBarata,
    segundoLugar,
    produtosFornecidos,
    tempoMedioRespostaSegundos,
  } = insight

  // Consider "zerado" se tudo estiver null/0
  const isVazio = !taxaResposta && !itensVencidos && !valorComprado && !ultimaCompra && !maisBarata && !segundoLugar && !produtosFornecidos && tempoMedioRespostaSegundos === null
  if (isVazio) {
    return (
      <div className="p-4 w-72 text-sm bg-popover text-muted-foreground rounded-md shadow-md border" data-testid="insight-empresa-vazio">
        Sem dados de relacionamento.
      </div>
    )
  }

  return (
    <div className="p-4 w-72 text-sm bg-popover text-popover-foreground rounded-md shadow-md border" data-testid="insight-empresa-card">
      <div className="space-y-3">
        {/* Taxa de Resposta e Tempo Médio */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-muted-foreground">Respostas</div>
            <div className="font-medium">
              {taxaResposta ? `${taxaResposta.respondeu} / ${taxaResposta.convidada}` : '—'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Tempo médio</div>
            <div className="font-medium">
              {tempoMedioRespostaSegundos !== null ? duracaoAprox(tempoMedioRespostaSegundos) : '—'}
            </div>
          </div>
        </div>

        {/* Competitividade */}
        <div>
          <div className="text-xs text-muted-foreground">Competitividade</div>
          <div className="font-medium">
            {maisBarata ? `Mais barata ${maisBarata}×` : 'Nunca foi mais barata'}
            {segundoLugar ? ` / 2º lugar ${segundoLugar}×` : ''}
          </div>
        </div>

        {/* Histórico */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-muted-foreground">Itens ganhos</div>
            <div className="font-medium">{itensVencidos ?? '—'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Fornecidos</div>
            <div className="font-medium">{produtosFornecidos ?? '—'}</div>
          </div>
        </div>

        {/* Valores */}
        <div>
          <div className="text-xs text-muted-foreground">Comprado (Total / 90d)</div>
          <div className="font-medium">
            {valorComprado ? `${moeda(Number(valorComprado.total))} / ${moeda(Number(valorComprado.ultimos90d))}` : '—'}
          </div>
        </div>

        {/* Última compra */}
        {ultimaCompra && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">Última compra</div>
            <div className="flex justify-between font-medium">
              <span>{dataHoraBr(ultimaCompra.data).split(' ')[0].replace(',', '')}</span>
              <span>{moeda(Number(ultimaCompra.valor))}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
