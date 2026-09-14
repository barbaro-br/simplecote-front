import { useVisualNovo } from '@/shared/hooks/useVisualNovo'
import { CotacaoDetalhePageV1 } from './CotacaoDetalhePageV1'
import { CotacaoDetalhePageV2 } from './v2/CotacaoDetalhePageV2'

export function CotacaoDetalhePage() {
  const { ligado } = useVisualNovo()

  if (ligado) {
    return <CotacaoDetalhePageV2 />
  }

  return <CotacaoDetalhePageV1 />
}
