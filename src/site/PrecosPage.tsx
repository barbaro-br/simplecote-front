import { Link } from 'react-router-dom'
import { Check } from '@phosphor-icons/react'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { moeda } from '@/shared/format/formatters'
import { PLANOS } from './planos'
import { useSEO } from './seo'
import { HeroFundo } from './HeroFundo'
import { Painel } from './tech/Painel'
import { BorderBeam } from './tech/BorderBeam'
import { CardTilt } from './tech/CardTilt'
import { Marquee } from './tech/Marquee'
import { RevealSecao } from './tech/RevealSecao'

const DIFERENCIAIS = [
  'Sem fidelidade',
  'Cancele quando quiser',
  'Suporte em português',
  'Grade ao vivo em todos os planos',
] as const

export function PrecosPage() {
  useSEO('Preços — SimpleCote', 'Conheça os planos do SimpleCote e escolha o ideal para o seu supermercado.')

  return (
    <div className="overflow-x-clip">
      {/* Mesmo fundo de marca da home (versão leve: só gradiente + scrim) */}
      <HeroFundo variant="simples" />

      <div className="relative z-10">
        <RevealSecao className="px-4 py-20">
          <div data-reveal className="mb-12 space-y-3 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">Planos e preços</h1>
            <p className="mx-auto max-w-xl text-white/80">
              Comece grátis e evolua quando o volume pedir. Sem fidelidade, sem cartão para testar.
            </p>
          </div>

          <Painel className="p-6 sm:p-10 md:p-14">
            <div data-reveal className="grid gap-6 md:grid-cols-3">
              {PLANOS.map((plano) => (
                <CardTilt key={plano.id} className="h-full">
                  <div
                    className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-background/60 p-6 backdrop-blur-sm ${
                      plano.destaque ? 'border-brand-mint' : 'border-border'
                    }`}
                  >
                    {plano.destaque && <BorderBeam />}
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
                          <Check className="size-4 shrink-0 text-brand-mint" aria-hidden />
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
                      data-cursor="mais"
                    >
                      Criar conta
                    </Link>
                  </div>
                </CardTilt>
              ))}
            </div>
          </Painel>
        </RevealSecao>

        <RevealSecao>
          <div className="relative border-y border-white/10 bg-white/10 py-6 backdrop-blur-md">
            <Marquee className="mx-auto max-w-6xl">
              {DIFERENCIAIS.map((item) => (
                <span
                  key={item}
                  className="mx-6 flex items-center gap-2 text-sm font-medium text-white/90"
                >
                  <span className="size-1.5 rounded-full bg-brand-mint" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </Marquee>
          </div>
        </RevealSecao>
      </div>
    </div>
  )
}
