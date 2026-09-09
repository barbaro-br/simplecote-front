import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Pause,
  Play,
  Storefront,
} from '@phosphor-icons/react'
import { buttonClasses } from '@/shared/components/ui/button-classes'
import { BotaoMagnetico } from './BotaoMagnetico'
import { GradeAoVivoDemo } from './GradeAoVivoDemo'
import { RepresentantesDemo } from './telas/RepresentantesDemo'
import { EmpresasDemo } from './telas/EmpresasDemo'
import { ResultadoDemo } from './telas/ResultadoDemo'
import { useDeveAnimar } from './useReduzirMovimento'

const DURACAO_MS = 6000

function LadoCopy({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
        {titulo}
      </h2>
      <p className="max-w-md text-sm text-white/75 sm:text-base">{texto}</p>
    </div>
  )
}

function SlideTela({ copy, children }: { copy: ReactNode; children: ReactNode }) {
  return (
    <div className="grid w-full min-w-0 items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
      <div className="min-w-0">{copy}</div>
      <div className="flex min-w-0 justify-center lg:justify-end">{children}</div>
    </div>
  )
}

type Slide = { id: string; rotulo: string; render: (ativo: boolean) => ReactNode }

const SLIDES: Slide[] = [
  {
    id: 'intro',
    rotulo: 'Início',
    render: () => (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
          <Storefront className="size-4" aria-hidden />
          Leilão reverso para supermercados
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Cotações competitivas, sem planilha.
        </h1>
        <p className="max-w-xl text-lg text-white/80">
          Você abre a cotação, os fornecedores disputam preço item a item e você economiza em cada
          compra — com a grade ao vivo mostrando tudo em tempo real.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <BotaoMagnetico>
            <Link to="/cadastro" className={buttonClasses({ size: 'lg' })} data-cursor="mais">
              Criar conta
            </Link>
          </BotaoMagnetico>
          <BotaoMagnetico>
            <Link
              to="/login"
              className={buttonClasses({
                variant: 'outline',
                size: 'lg',
                className:
                  'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white',
              })}
              data-cursor="mais"
            >
              Entrar
            </Link>
          </BotaoMagnetico>
        </div>
      </div>
    ),
  },
  {
    id: 'grade',
    rotulo: 'Grade ao vivo',
    render: (ativo) => (
      <SlideTela
        copy={
          <LadoCopy
            titulo="Preço disputado item a item"
            texto="Cada fornecedor cobre o menor lance da embalagem. A grade ao vivo mostra quem está ganhando cada item — sem você atualizar nada."
          />
        }
      >
        <GradeAoVivoDemo ativo={ativo} />
      </SlideTela>
    ),
  },
  {
    id: 'representantes',
    rotulo: 'Representantes',
    render: () => (
      <SlideTela
        copy={
          <LadoCopy
            titulo="Convide por link, acompanhe a resposta"
            texto="O fornecedor recebe o convite por e-mail ou WhatsApp e responde pelo link. Você vê quem abriu, quem respondeu e reenvia com um clique."
          />
        }
      >
        <RepresentantesDemo />
      </SlideTela>
    ),
  },
  {
    id: 'empresas',
    rotulo: 'Empresas',
    render: () => (
      <SlideTela
        copy={
          <LadoCopy
            titulo="Seus fornecedores, organizados por ramo"
            texto="Cadastre uma vez e monte cotações direcionadas: convide só quem fornece hortifruti, bebidas, carnes — o que a cotação pedir."
          />
        }
      >
        <EmpresasDemo />
      </SlideTela>
    ),
  },
  {
    id: 'resultado',
    rotulo: 'Resultado',
    render: () => (
      <SlideTela
        copy={
          <LadoCopy
            titulo="No fim, o vencedor de cada item"
            texto="O SimpleCote apura a cotação, mostra quanto você economizou e gera os pedidos já separados por fornecedor."
          />
        }
      >
        <ResultadoDemo />
      </SlideTela>
    ),
  },
  {
    id: 'comecar',
    rotulo: 'Começar',
    render: () => (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Comece grátis</h2>
        <p className="max-w-md text-white/80">
          Crie sua conta em minutos, monte a primeira cotação e veja o produto funcionando — sem
          cartão de crédito.
        </p>
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
          {['Teste grátis', 'Sem cartão', 'Cancele quando quiser'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle className="size-4 text-brand-mint" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <BotaoMagnetico>
          <Link to="/cadastro" className={buttonClasses({ size: 'lg' })} data-cursor="mais">
            Criar conta
          </Link>
        </BotaoMagnetico>
      </div>
    ),
  },
]

const N = SLIDES.length

/**
 * Home em formato "stories": os slides passam de lado (auto a cada 6s), com
 * barra de progresso segmentada no topo e controles ‹ ⏸ › embaixo. Teclado
 * (setas), swipe no mobile, pausa no hover/foco. Sob `prefers-reduced-motion`
 * não gira sozinho — vira um deck manual.
 */
export function DeckHero() {
  const deveAnimar = useDeveAnimar()
  const [indice, setIndice] = useState(0)
  const [pausadoManual, setPausadoManual] = useState(false)
  const [hover, setHover] = useState(false)
  const [foco, setFoco] = useState(false)
  const toqueRef = useRef<{ x: number; y: number } | null>(null)

  const rodando = deveAnimar && !pausadoManual && !hover && !foco
  const mostrarPlay = pausadoManual || !deveAnimar

  const ir = (n: number) => setIndice(((n % N) + N) % N)

  useEffect(() => {
    if (!rodando) return
    const t = window.setTimeout(() => setIndice((v) => (v + 1) % N), DURACAO_MS)
    return () => window.clearTimeout(t)
  }, [rodando, indice])

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null
      if (alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable))
        return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setIndice((v) => (v + 1) % N)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setIndice((v) => (v - 1 + N) % N)
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [])

  function aoSoltar(e: React.PointerEvent) {
    const ini = toqueRef.current
    toqueRef.current = null
    if (!ini) return
    const dx = e.clientX - ini.x
    const dy = e.clientY - ini.y
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy)) return
    ir(indice + (dx < 0 ? 1 : -1))
  }

  return (
    <section
      aria-label="Tour do SimpleCote"
      aria-roledescription="carrossel"
      className="relative flex h-[calc(100svh-4rem)] min-h-[34rem] flex-col"
    >
      {/* Barra de progresso segmentada */}
      <div className="mx-auto flex w-full max-w-6xl gap-1.5 px-4 pt-4">
        {SLIDES.map((s, i) => {
          const estado = i < indice ? 'cheio' : i === indice ? 'atual' : 'vazio'
          const anim = estado === 'atual' && rodando
          return (
            <span key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <span
                key={`${s.id}-${indice}-${anim ? 'run' : 'stop'}`}
                className="block h-full origin-left bg-brand-mint"
                style={
                  anim
                    ? { animation: `deck-fill ${DURACAO_MS}ms linear forwards` }
                    : { transform: estado === 'vazio' ? 'scaleX(0)' : 'scaleX(1)' }
                }
              />
            </span>
          )
        })}
      </div>

      {/* Viewport dos slides */}
      <div
        className="relative flex-1 overflow-hidden"
        onPointerDown={(e) => {
          toqueRef.current = { x: e.clientX, y: e.clientY }
        }}
        onPointerUp={aoSoltar}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocusCapture={() => setFoco(true)}
        onBlurCapture={() => setFoco(false)}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(-${indice * 100}%)`,
            transition: deveAnimar ? 'transform 500ms ease-out' : 'none',
          }}
        >
          {SLIDES.map((s, i) => {
            const inativo = i !== indice
            return (
              <div
                key={s.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${N} — ${s.rotulo}`}
                aria-hidden={inativo}
                inert={inativo || undefined}
                className="h-full w-full shrink-0 overflow-y-auto"
              >
                <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center px-4 pb-10 pt-8">
                  {s.render(i === indice)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controles */}
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 pb-6 pt-2">
        <button
          type="button"
          onClick={() => ir(indice - 1)}
          aria-label="Slide anterior"
          className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15"
        >
          <CaretLeft className="size-4" weight="bold" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setPausadoManual((p) => !p)}
          aria-label={mostrarPlay ? 'Retomar apresentação' : 'Pausar apresentação'}
          className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15"
        >
          {mostrarPlay ? (
            <Play className="size-4" weight="fill" aria-hidden />
          ) : (
            <Pause className="size-4" weight="fill" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => ir(indice + 1)}
          aria-label="Próximo slide"
          className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15"
        >
          <CaretRight className="size-4" weight="bold" aria-hidden />
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        Slide {indice + 1} de {N}: {SLIDES[indice].rotulo}
      </p>

      <a
        href="#como-funciona"
        data-cursor="mais"
        className="absolute bottom-6 right-4 hidden items-center gap-1.5 text-[11px] font-medium text-white/45 transition-colors hover:text-white/80 sm:flex"
      >
        Planos e detalhes
        <CaretDown className="size-3.5" aria-hidden />
      </a>
    </section>
  )
}
