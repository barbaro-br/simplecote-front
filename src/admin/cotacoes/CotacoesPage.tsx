import { useVisualNovo } from '@/shared/hooks/useVisualNovo'
import { CotacoesPageV1 } from './CotacoesPageV1'
import { CotacoesPageV2 } from './CotacoesPageV2'

export function CotacoesPage() {
  const { ligado } = useVisualNovo()

  if (ligado) {
    return <CotacoesPageV2 />
  }

  return <CotacoesPageV1 />
}
