import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Circle, Sparkle, Trash, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiError, SessaoExpiradaError } from '@/shared/api/api-client'
import { Button } from '@/shared/components/ui/button'
import { Superficie, SecaoCabecalho, BotaoIcone } from '@/shared/ui'
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

  const concluidos = passos.filter((p) => p.feito).length
  const pct = Math.round((concluidos / passos.length) * 100)

  return (
    <Superficie>
      <SecaoCabecalho
        titulo="Primeiros passos"
        acao={
          <>
            <span className="text-[11px] text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
              {concluidos} de {passos.length} concluídos
            </span>
            <BotaoIcone
              type="button"
              onClick={() => dispensar.mutate(true)}
              aria-label="Dispensar primeiros passos"
            >
              <X className="size-4" />
            </BotaoIcone>
          </>
        }
      />

      <div className="h-1 w-full bg-white/[0.06]">
        <div
          className="h-full bg-[var(--pnl-acento,#57bf8e)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-4 p-4 sm:p-5">
      <p className="text-sm text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]">
        Configure sua loja para ver o SimpleCote funcionando.
      </p>

      <ul className="space-y-1">
        {passos.map((p) => (
          <li key={p.key}>
            <Link
              to={p.to}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                p.feito
                  ? 'text-[var(--pnl-txt-3,rgba(255,255,255,0.45))]'
                  : 'hover:bg-white/[0.04]'
              }`}
            >
              {p.feito ? (
                <CheckCircle className="size-5 shrink-0 text-[var(--pnl-acento-hi,#6fe6ac)]" aria-hidden />
              ) : (
                <Circle className="size-5 shrink-0 text-[var(--pnl-txt-4,rgba(255,255,255,0.3))]" aria-hidden />
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

      </div>

      {wizardAberto && <OnboardingWizard open onClose={() => setWizardAberto(false)} />}
    </Superficie>
  )
}
