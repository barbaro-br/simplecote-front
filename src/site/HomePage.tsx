import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Package, TrendDown, Users } from '@phosphor-icons/react'
import { moeda } from '@/shared/format/formatters'
import logo from '@/assets/logo-simplecote.jpg'
import { PLANOS } from './planos'
import { useSEO } from './seo'
import { HeroFundo } from './HeroFundo'
import { Painel } from './tech/Painel'
import { BorderBeam } from './tech/BorderBeam'
import { CardTilt } from './tech/CardTilt'
import { RevealSecao } from './tech/RevealSecao'
import { SpotlightCard } from './tech/SpotlightCard'
import { DeckHero } from './tech/DeckHero'

const COMO_FUNCIONA = [
  {
    titulo: 'Abra uma cotação',
    texto: 'Monte a lista de itens que você quer comprar — por bipagem, busca ou importação de catálogo.',
    Icone: Package,
  },
  {
    titulo: 'Convide representantes',
    texto: 'Seus fornecedores recebem o link por e-mail ou WhatsApp e dão o preço de cada item.',
    Icone: Users,
  },
  {
    titulo: 'Compare e economize',
    texto: 'A grade ao vivo mostra quem ofereceu menos em cada item. Aperte e gere os pedidos.',
    Icone: TrendDown,
  },
] as const

export function HomePage() {
  useSEO(
    'SimpleCote — Cotações competitivas para supermercados',
    'SimpleCote: leilão reverso para supermercados cotarem e economizarem com fornecedores, sem planilha.',
    logo,
  )

  return (
    <div className="overflow-x-clip">
      {/* Fundo de marca fixo atrás da página inteira (só na home) */}
      <HeroFundo />

      <div className="relative z-10">
        {/* Deck de slides no formato "stories" — é o hero da home */}
        <DeckHero />

        {/* Abaixo do deck: conteúdo pra ler/comparar (SEO + quem chega decidido) */}
        <RevealSecao id="como-funciona" className="px-4 py-20">
          <Painel className="p-6 sm:p-10 md:p-14">
            <div data-reveal className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight">Como funciona</h2>
              <p className="text-muted-foreground">Da abertura à economia em três passos.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {COMO_FUNCIONA.map((passo, i) => {
                const Icone = passo.Icone
                return (
                  <SpotlightCard key={passo.titulo} className="p-6">
                    <div data-reveal className="space-y-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                        <Icone className="size-5" aria-hidden />
                      </div>
                      <h3 className="text-lg font-semibold">
                        <span className="mr-2 text-brand-mint">{i + 1}.</span>
                        {passo.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground">{passo.texto}</p>
                    </div>
                  </SpotlightCard>
                )
              })}
            </div>
          </Painel>
        </RevealSecao>

        <RevealSecao id="planos" className="px-4 pb-20">
          <Painel className="p-6 sm:p-10 md:p-14">
            <div data-reveal className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight">Planos</h2>
              <p className="text-muted-foreground">Comece grátis e evolua quando o volume pedir.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {PLANOS.map((plano) => (
                <CardTilt key={plano.id} className="h-full">
                  <div
                    data-reveal
                    className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-background/60 p-6 backdrop-blur-sm ${
                      plano.destaque ? 'border-brand-mint' : 'border-border'
                    }`}
                  >
                    {plano.destaque && <BorderBeam />}
                    <h3 className="text-xl font-semibold">{plano.nome}</h3>
                    <p className="mt-3 text-3xl font-bold">
                      {plano.precoMensal === 0 ? 'Grátis' : moeda(plano.precoMensal)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    <ul className="mt-5 flex-1 space-y-2">
                      {plano.quotas.slice(0, 3).map((quota) => (
                        <li
                          key={quota.rotulo}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle className="size-4 shrink-0 text-brand-mint" aria-hidden />
                          {quota.rotulo}: {quota.limite === null ? 'Ilimitado' : quota.limite}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardTilt>
              ))}
            </div>
            <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link
                to="/precos"
                className="inline-flex items-center gap-1 font-medium text-brand-navy hover:underline"
                data-cursor="mais"
              >
                Ver todos os planos
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link to="/ajuda" className="text-muted-foreground hover:text-foreground">
                Dúvidas? Central de ajuda
              </Link>
            </div>
          </Painel>
        </RevealSecao>
      </div>
    </div>
  )
}
