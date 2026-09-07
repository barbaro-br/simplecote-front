import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Circle, Sparkle, Trash, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Card } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { OnboardingWizard } from './OnboardingWizard'
import {
  useDispensarOnboarding,
  useLimparDadosExemplo,
  useOnboarding,
  useSemearDadosExemplo,
} from './onboarding.api'

function erroDe(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.'
}

export function OnboardingChecklist() {
  const { data: estado } = useOnboarding()
  const dispensar = useDispensarOnboarding()
  const semear = useSemearDadosExemplo()
  const limpar = useLimparDadosExemplo()
  const [wizardAberto, setWizardAberto] = useState(false)

  if (!estado) return null

  const passos = [
    { key: 'temProduto', label: 'Cadastrar produtos', to: '/admin/produtos', feito: estado.temProduto },
    { key: 'temRepresentante', label: 'Cadastrar um representante', to: '/admin/empresas', feito: estado.temRepresentante },
    { key: 'temCotacao', label: 'Abrir uma cotação de teste', to: '/admin/cotacoes/nova', feito: estado.temCotacao },
  ] as const

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight ui-uppercase">Primeiros passos</h2>
          <p className="text-sm text-muted-foreground">
            Configure sua loja para ver o SimpleCote funcionando.
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispensar.mutate(true)}
          aria-label="Dispensar primeiros passos"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>

      <ul className="space-y-2">
        {passos.map((p) => (
          <li key={p.key}>
            <Link
              to={p.to}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                p.feito ? 'text-muted-foreground' : 'hover:bg-muted'
              }`}
            >
              {p.feito ? (
                <CheckCircle className="size-5 shrink-0 text-success" aria-hidden />
              ) : (
                <Circle className="size-5 shrink-0 text-muted-foreground/50" aria-hidden />
              )}
              <span className={p.feito ? 'line-through' : 'font-medium'}>{p.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setWizardAberto(true)}>
          <Sparkle className="mr-2 size-4" />
          Configurar em 3 passos
        </Button>
        {estado.modoTeste && (
          <>
            <Button variant="outline" disabled={semear.isPending} onClick={() => semear.mutate()}>
              {semear.isPending ? 'Preenchendo…' : 'Preencher com dados de exemplo'}
            </Button>
            <Button
              variant="ghost"
              disabled={limpar.isPending}
              onClick={() =>
                limpar.mutate(undefined, {
                  onSuccess: () => toast.success('Dados de exemplo removidos.'),
                  onError: (e) => {
                    if (e instanceof SessaoExpiradaError) return
                    toast.error(erroDe(e))
                  },
                })
              }
            >
              <Trash className="mr-2 size-4" />
              Limpar dados de exemplo
            </Button>
          </>
        )}
      </div>

      {wizardAberto && <OnboardingWizard open onClose={() => setWizardAberto(false)} />}
    </Card>
  )
}
