import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/api-client'

// Contrato da change tenant-por-subdominio: GET /public/compradores/{slug}/existe
// → `{ existe: boolean }` (só confirma o slug; sem nome/id/branding). Rota
// anônima (`/public/**` não carrega o JWT nem redireciona em 401).
export function useSlugExiste(slug: string | null) {
  return useQuery({
    queryKey: ['public', 'slug-existe', slug],
    queryFn: () => api.get<{ existe: boolean }>(`/public/compradores/${slug}/existe`),
    enabled: slug !== null,
    retry: false,
  })
}
