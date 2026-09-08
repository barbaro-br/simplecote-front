import { Link } from 'react-router-dom'
import { ArrowRight, Check, CheckCircle, Package, Storefront, TrendDown, Users } from '@phosphor-icons/react'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { moeda } from '@/shared/format/formatters'
import logo from '@/assets/logo-simplecote.jpg'
import { PLANOS } from './planos'
import { useSEO } from './seo'
import { HeroVideo } from './HeroVideo'
import { SecaoRevelavel } from './SecaoRevelavel'

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

export function HomePage() {
  useSEO(
    'SimpleCote — Cotações competitivas para supermercados',
    'SimpleCote: leilão reverso para supermercados cotarem e economizarem com fornecedores, sem planilha.',
    logo,
  )

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0" aria-hidden="true">
          <HeroVideo />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <Storefront className="size-4" aria-hidden />
            Leilão reverso para supermercados
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Cotações competitivas, sem planilha.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Você abre a cotação, os fornecedores disputam preço item a item e você economiza em
            cada compra — com a grade ao vivo mostrando tudo em tempo real.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/cadastro" className={buttonClasses({ size: 'lg' })}>
              Criar conta
            </Link>
            <Link to="/login" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
              Entrar
            </Link>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <SecaoRevelavel>
        <section className="border-b">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
            <h2 className="mb-3 text-center text-3xl font-bold tracking-tight">Como funciona</h2>
            <p className="mb-10 text-center text-muted-foreground">
              Da abertura à economia em três passos.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              {COMO_FUNCIONA.map((passo, i) => {
                const Icone = passo.Icone
                return (
                  <div key={passo.titulo} className="space-y-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icone className="size-5" aria-hidden />
                    </div>
                    <h3 className="text-lg font-semibold">
                      <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                      {passo.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground">{passo.texto}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </SecaoRevelavel>

      {/* VEJA EM AÇÃO */}
      <SecaoRevelavel>
        <section className="border-b">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
            <h2 className="mb-3 text-center text-3xl font-bold tracking-tight">Veja em ação</h2>
            <p className="mb-10 text-center text-muted-foreground">
              A grade ao vivo disputando preços, do jeito que o seu fornecedor vê.
            </p>
            <div className="overflow-hidden rounded-2xl border shadow-lg">
              <video
                className="aspect-video w-full"
                src="/midia/demo-produto.mp4"
                controls
                preload="metadata"
              />
            </div>
          </div>
        </section>
      </SecaoRevelavel>

      {/* BENEFÍCIOS */}
      <SecaoRevelavel>
        <section className="border-b">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">Por que o SimpleCote</h2>
            <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
              {BENEFICIOS.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-3 rounded-xl border p-4">
                  <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                  <span className="text-sm">{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </SecaoRevelavel>

      {/* PLANOS (resumo da fonte única) */}
      <SecaoRevelavel>
        <section className="border-b">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
            <h2 className="mb-3 text-center text-3xl font-bold tracking-tight">Planos</h2>
            <p className="mb-10 text-center text-muted-foreground">
              Comece grátis e evolua quando o volume pedir.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {PLANOS.map((plano) => (
                <div
                  key={plano.id}
                  className={`flex flex-col rounded-xl border p-6 ${plano.destaque ? 'border-primary shadow-lg' : 'border-border'}`}
                >
                  <h3 className="text-xl font-semibold">{plano.nome}</h3>
                  <p className="mt-3 text-3xl font-bold">
                    {plano.precoMensal === 0 ? 'Grátis' : moeda(plano.precoMensal)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                  <ul className="mt-5 flex-1 space-y-2">
                    {plano.quotas.slice(0, 3).map((quota) => (
                      <li key={quota.rotulo} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="size-4 shrink-0 text-success" aria-hidden />
                        {quota.rotulo}: {quota.limite === null ? 'Ilimitado' : quota.limite}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/precos" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Ver todos os planos
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </SecaoRevelavel>

      {/* CTA FINAL */}
      <SecaoRevelavel>
        <section>
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-20">
            <h2 className="text-3xl font-bold tracking-tight">Comece grátis</h2>
            <p className="max-w-lg text-muted-foreground">
              Crie sua conta em minutos, monte sua primeira cotação e veja o produto funcionando —
              sem cartão de crédito.
            </p>
            <ul className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {['Teste grátis', 'Sem cartão', 'Cancele quando quiser'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/cadastro" className={buttonClasses({ size: 'lg' })}>
              Criar conta
            </Link>
          </div>
        </section>
      </SecaoRevelavel>
    </div>
  )
}
