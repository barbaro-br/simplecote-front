import { useNavigate } from 'react-router-dom'
import { PainelDashboard } from './PainelDashboard'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import type { StatusCotacao } from '@/shared/domain/tipos-base'

export function DashboardPage() {
  const navigate = useNavigate()

  function irParaStatus(status: StatusCotacao) {
    navigate(`/admin/cotacoes?status=${status}`)
  }

  return (
    <PageContainer maxWidth="5xl" className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral das suas cotações, gastos e economia.
        </p>
      </div>
      <PainelDashboard onStatusClick={irParaStatus} />
    </PageContainer>
  )
}
