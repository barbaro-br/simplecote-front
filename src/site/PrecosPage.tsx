import { Link } from 'react-router-dom'
import { Check } from '@phosphor-icons/react'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { moeda } from '@/shared/format/formatters'
import { PLANOS } from './planos'
import { useSEO } from './seo'

export function PrecosPage() {
  useSEO('Preços — SimpleCote', 'Conheça os planos do SimpleCote e escolha o ideal para o seu supermercado.')

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="mb-12 text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Planos e preços</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Comece grátis e evolua quando o volume pedir. Sem fidelidade, sem cartão para testar.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANOS.map((plano) => (
          <div
            key={plano.id}
            className={`flex flex-col rounded-xl border p-6 ${
              plano.destaque ? 'border-primary shadow-lg' : 'border-border'
            }`}
          >
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{plano.nome}</h2>
              <p className="text-sm text-muted-foreground">{plano.descricao}</p>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {plano.precoMensal === 0 ? 'Grátis' : moeda(plano.precoMensal)}
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </p>

            <ul className="mt-6 flex-1 space-y-2.5">
              {plano.quotas.map((quota) => (
                <li key={quota.rotulo} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 shrink-0 text-success" aria-hidden />
                  <span>
                    {quota.rotulo}: {quota.limite === null ? 'Ilimitado' : quota.limite}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="/cadastro"
              className={buttonClasses({
                variant: plano.destaque ? 'default' : 'outline',
                className: 'mt-6 w-full',
              })}
            >
              Criar conta
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
