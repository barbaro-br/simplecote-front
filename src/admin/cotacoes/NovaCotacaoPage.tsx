import { useVisualNovo } from '@/shared/hooks/useVisualNovo'
import { NovaCotacaoPageV1 } from './NovaCotacaoPageV1'
import { NovaCotacaoPageV2 } from './NovaCotacaoPageV2'

export function NovaCotacaoPage() {
  const { ligado } = useVisualNovo()

  if (ligado) {
    return <NovaCotacaoPageV2 />
  }

  return <NovaCotacaoPageV1 />
}
