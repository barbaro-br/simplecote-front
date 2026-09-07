import { Link } from 'react-router-dom'
import { CheckCircle } from '@phosphor-icons/react'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { useSEO } from './seo'
import hero from '@/assets/hero.png'

const COMO_FUNCIONA = [
  {
    titulo: '1. Abra uma cotação',
    texto: 'Monte a lista de itens que você quer comprar — por bipagem, busca ou importação de catálogo.',
  },
  {
    titulo: '2. Convide representantes',
    texto: 'Seus fornecedores recebem o link por e-mail ou WhatsApp e dão o preço de cada item.',
  },
  {
    titulo: '3. Compare e economize',
    texto: 'A grade ao vivo mostra quem ofereceu menos em cada item. Aperte e gere os pedidos.',
  },
] as const

export function HomePage() {
  useSEO('SimpleCote — Cotações competitivas para supermercados', 'SimpleCote: leilão reverso para supermercados cotarem e economizarem com fornecedores, sem planilha.')

  return (
    <div>
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Cotações competitivas, sem planilha.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              O SimpleCote é um leilão reverso para supermercados: você abre a cotação, os
              fornecedores disputam preço item a item e você economiza em cada compra.
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
          <img
            src={hero}
            alt="Painel do SimpleCote com a grade ao vivo de cotações"
            className="w-full rounded-xl border shadow-lg"
          />
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">Como funciona</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {COMO_FUNCIONA.map((passo) => (
              <div key={passo.titulo} className="space-y-2">
                <h3 className="text-lg font-semibold">{passo.titulo}</h3>
                <p className="text-sm text-muted-foreground">{passo.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center">
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
    </div>
  )
}
