import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Package, Storefront, TrendDown, Users } from '@phosphor-icons/react'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { moeda } from '@/shared/format/formatters'
import logo from '@/assets/logo-simplecote.jpg'
import { PLANOS } from './planos'
import { useSEO } from './seo'
import { HeroFundo } from './HeroFundo'
import { BotaoMagnetico } from './tech/BotaoMagnetico'
import { BorderBeam } from './tech/BorderBeam'
import { CardTilt } from './tech/CardTilt'
import { EmbedYouTube } from './tech/EmbedYouTube'
import { GridAnimado } from './tech/GridAnimado'
import { Marquee } from './tech/Marquee'
import { RevealSecao } from './tech/RevealSecao'
import { SpotlightCard } from './tech/SpotlightCard'
import { TextoGradiente } from './tech/TextoGradiente'
import { gsap, SplitText } from './tech/gsap-scroll'
import { useDeveAnimar } from './tech/useReduzirMovimento'

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

const BENEFICIOS = [
  'Leilão reverso item a item — o menor preço vence',
  'Grade ao vivo com a resposta de cada fornecedor',
  'Histórico de cotações e resultados para recompra',
  'Sem planilha: tudo num painel só',
] as const

function HeroTitulo() {
  const ref = useRef<HTMLHeadingElement>(null)
  const deveAnimar = useDeveAnimar()

  useEffect(() => {
    if (!deveAnimar) return
    const el = ref.current
    if (!el) return
    try {
      const split = new SplitText(el, { type: 'words' })
      gsap.from(split.words, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.06,
        delay: 0.1,
      })
      return () => split.revert()
    } catch {
      return
    }
  }, [deveAnimar])

  return (
    <h1 ref={ref} className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
      Cotações competitivas, sem planilha.
    </h1>
  )
}

export function HomePage() {
  useSEO(
    'SimpleCote — Cotações competitivas para supermercados',
    'SimpleCote: leilão reverso para supermercados cotarem e economizarem com fornecedores, sem planilha.',
    logo,
  )

  return (
    <div className="overflow-x-clip">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <HeroFundo />
        </div>
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Storefront className="size-4" aria-hidden />
            Leilão reverso para supermercados
          </span>
          <HeroTitulo />
          <p className="max-w-xl text-lg text-white/80">
            Você abre a cotação, os fornecedores disputam preço item a item e você economiza em
            cada compra — com a grade ao vivo mostrando tudo em tempo real.
          </p>
          <div className="flex flex-wrap gap-3">
            <BotaoMagnetico>
              <Link to="/cadastro" className={buttonClasses({ size: 'lg' })} data-cursor="mais">
                Criar conta
              </Link>
            </BotaoMagnetico>
            <BotaoMagnetico>
              <Link
                to="/login"
                className={buttonClasses({ variant: 'outline', size: 'lg', className: 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white' })}
                data-cursor="mais"
              >
                Entrar
              </Link>
            </BotaoMagnetico>
          </div>
        </div>
      </section>

      {/* MARQUEE DE BENEFÍCIOS */}
      <section className="border-b bg-background py-6">
        <Marquee className="max-w-6xl mx-auto">
          {BENEFICIOS.map((beneficio) => (
            <span
              key={beneficio}
              className="mx-6 flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-brand-mint" aria-hidden="true" />
              {beneficio}
            </span>
          ))}
        </Marquee>
      </section>

      {/* COMO FUNCIONA (bento) */}
      <RevealSecao className="relative border-b">
        <GridAnimado />
        <section>
          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
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
          </div>
        </section>
      </RevealSecao>

      {/* VEJA EM AÇÃO */}
      <RevealSecao className="border-b">
        <section>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
            <div data-reveal className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight">
                Veja o <TextoGradiente>SimpleCote</TextoGradiente> em ação
              </h2>
              <p className="text-muted-foreground">
                A grade ao vivo disputando preços, do jeito que o seu fornecedor vê.
              </p>
            </div>
            <div data-reveal className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border bg-background/60 shadow-lg backdrop-blur-sm">
                <video
                  className="aspect-video w-full"
                  src="/midia/demo-produto.mp4"
                  controls
                  preload="metadata"
                  poster={logo}
                  playsInline
                />
              </div>
              <EmbedYouTube />
            </div>
          </div>
        </section>
      </RevealSecao>

      {/* POR QUE O SIMPLECOTE (bento) */}
      <RevealSecao className="relative border-b">
        <GridAnimado />
        <section>
          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
            <div data-reveal className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold tracking-tight">Por que o SimpleCote</h2>
              <p className="text-muted-foreground">Menos planilha, mais margem — item a item.</p>
            </div>
            <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
              {BENEFICIOS.map((beneficio) => (
                <li key={beneficio} data-reveal>
                  <SpotlightCard className="h-full p-5">
                    <span className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 size-5 shrink-0 text-brand-mint" aria-hidden />
                      <span className="text-sm">{beneficio}</span>
                    </span>
                  </SpotlightCard>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </RevealSecao>

      {/* PLANOS (resumo da fonte única) */}
      <RevealSecao className="relative border-b">
        <section>
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
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
                        <li key={quota.rotulo} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="size-4 shrink-0 text-brand-mint" aria-hidden />
                          {quota.rotulo}: {quota.limite === null ? 'Ilimitado' : quota.limite}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardTilt>
              ))}
            </div>
            <div data-reveal className="mt-8 text-center">
              <Link to="/precos" className="inline-flex items-center gap-1 text-sm font-medium text-brand-navy hover:underline" data-cursor="mais">
                Ver todos os planos
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </RevealSecao>

      {/* CTA FINAL */}
      <RevealSecao className="relative">
        <section className="overflow-hidden bg-brand-navy text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-20">
            <h2 data-reveal className="text-3xl font-bold tracking-tight">
              Comece grátis
            </h2>
            <p data-reveal className="max-w-lg text-white/80">
              Crie sua conta em minutos, monte sua primeira cotação e veja o produto funcionando —
              sem cartão de crédito.
            </p>
            <ul data-reveal className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
              {['Teste grátis', 'Sem cartão', 'Cancele quando quiser'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-brand-mint" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div data-reveal>
              <BotaoMagnetico>
                <Link to="/cadastro" className={buttonClasses({ size: 'lg' })} data-cursor="mais">
                  Criar conta
                </Link>
              </BotaoMagnetico>
            </div>
          </div>
        </section>
      </RevealSecao>
    </div>
  )
}
