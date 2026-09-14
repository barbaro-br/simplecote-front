import { useVisualNovo } from '@/shared/hooks/useVisualNovo'
import { PedidosPageV1 } from './PedidosPageV1'
import { PedidosPageV2 } from './PedidosPageV2'

export function PedidosPage() {
  const { ligado } = useVisualNovo()

  if (ligado) {
    return <PedidosPageV2 />
  }

  return <PedidosPageV1 />
}
