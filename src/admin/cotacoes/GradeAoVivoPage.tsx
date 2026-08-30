import { Link, useParams } from 'react-router-dom'
import { useGradeAoVivo } from './cotacoes.api'
import { GradeAoVivoTabela } from './GradeAoVivoTabela'

export function GradeAoVivoPage() {
  const { id = '' } = useParams()
  const { data, isLoading, error } = useGradeAoVivo(id)

  if (isLoading) return <p className="p-6 text-muted-foreground">Carregando grade…</p>
  if (error) return <p className="p-6 text-destructive">Erro ao carregar a grade: {error.message}</p>
  if (!data) return null

  const progressPct = data.totalParticipantes > 0 
    ? Math.round((data.respondidos / data.totalParticipantes) * 100) 
    : 0

  return (
    <div className="space-y-6 max-w-[95vw] mx-auto">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Grade ao vivo</h1>
            <span className="text-sm font-medium text-muted-foreground">
              {data.respondidos}/{data.totalParticipantes} responderam
            </span>
          </div>
          <div className="h-2 w-64 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out" 
              style={{ width: `${progressPct}%` }} 
            />
          </div>
        </div>
        <Link to={`/admin/cotacoes/${id}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">
          ← Cotação
        </Link>
      </div>

      <GradeAoVivoTabela cotacaoId={id} grade={data} />
    </div>
  )
}
