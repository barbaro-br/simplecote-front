import { Link, useParams } from 'react-router-dom'
import { useGradeAoVivo } from './cotacoes.api'
import { GradeAoVivoTabela } from './GradeAoVivoTabela'

export function GradeAoVivoPage() {
  const { id = '' } = useParams()
  const { data, isLoading, error } = useGradeAoVivo(id)

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando grade…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar a grade: {error.message}</p>
  if (!data) return null

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold">Grade ao vivo</h1>
          <span className="text-sm text-muted-foreground">
            {data.respondidos}/{data.totalParticipantes} responderam
          </span>
        </div>
        <Link to={`/admin/cotacoes/${id}`} className="text-sm text-primary hover:underline">
          ← Cotação
        </Link>
      </div>

      <GradeAoVivoTabela cotacaoId={id} grade={data} />
    </div>
  )
}
