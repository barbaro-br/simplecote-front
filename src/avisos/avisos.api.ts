import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'
import { avisoListaSchema, type Aviso } from './avisos.schema'

// Avisos vigentes (ativos e não expirados) para o painel da loja. A filtragem
// já vem do back — aqui só lê e parseia.
export function useAvisosVigentes() {
  return useQuery({
    queryKey: ['avisos', 'vigentes'],
    queryFn: () => api.get<Aviso[]>('/api/avisos').then((d) => avisoListaSchema.parse(d)),
  })
}
