import { useNavigate } from 'react-router-dom'
import { PainelDashboard } from './PainelDashboard'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { LinkColaboradorCard } from '@/admin/configuracoes/LinkColaboradorCard'
import { OnboardingChecklist } from '@/admin/onboarding/OnboardingChecklist'
import { useDispensarOnboarding, useOnboarding } from '@/admin/onboarding/onboarding.api'
import { Button } from '@/shared/components/ui/button'
import type { StatusCotacao } from '@/shared/domain/tipos-base'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: estado, isLoading } = useOnboarding()
  const reexibir = useDispensarOnboarding()

  const todosCumpridos =
    !!estado && estado.temProduto && estado.temRepresentante && estado.temCotacao
  const mostrarChecklist = !isLoading && !!estado && !estado.dispensado && !todosCumpridos
  const mostrarReexibir = !isLoading && !!estado && estado.dispensado && !todosCumpridos

  function irParaStatus(status: StatusCotacao) {
    navigate(`/admin/cotacoes?status=${status}`)
  }

  return (
    <PageContainer maxWidth="5xl" className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold ui-uppercase">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral das suas cotações, gastos e economia.
        </p>
      </div>
      {mostrarChecklist && <OnboardingChecklist />}
      {mostrarReexibir && (
        <div>
          <Button variant="outline" onClick={() => reexibir.mutate(false)}>
            Mostrar primeiros passos
          </Button>
        </div>
      )}
      <PainelDashboard onStatusClick={irParaStatus} />
      <LinkColaboradorCard />
    </PageContainer>
  )
}
