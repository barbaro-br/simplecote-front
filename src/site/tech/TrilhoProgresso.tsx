import { useEffect, useState } from 'react'
import { lenisAtual } from './lenis-atual'

type SecaoTrilho = { id: string; rotulo: string }

// Seções da home, na ordem em que aparecem. Os `id` batem com os das <section>
// da HomePage.
const SECOES_HOME: SecaoTrilho[] = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'como-funciona', rotulo: 'Como funciona' },
  { id: 'em-acao', rotulo: 'Em ação' },
  { id: 'por-que', rotulo: 'Por quê' },
  { id: 'planos', rotulo: 'Planos' },
  { id: 'comecar', rotulo: 'Começar' },
]

function irPara(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = lenisAtual()
  if (lenis) lenis.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * Trilho fixo na lateral que mostra em que seção da home o visitante está e
 * quanto já rolou. Só em `xl+` (`hidden xl:flex`) — abaixo disso o hero de 2
 * colunas fica estreito e o trilho encostaria no card da grade. Seção ativa
 * via IntersectionObserver, progresso via scroll.
 */
export function TrilhoProgresso({ secoes = SECOES_HOME }: { secoes?: SecaoTrilho[] }) {
  const [ativa, setAtiva] = useState(secoes[0]?.id ?? '')
  const [progresso, setProgresso] = useState(0)

  useEffect(() => {
    const aoRolar = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgresso(total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0)
    }
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)
    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const alvos = secoes
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el != null)
    if (!alvos.length) return

    const obs = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visivel?.target.id) setAtiva(visivel.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    for (const el of alvos) obs.observe(el)
    return () => obs.disconnect()
  }, [secoes])

  return (
    <nav
      aria-label="Progresso da página"
      className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 xl:flex 2xl:right-8"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-[3px] top-1 bottom-1 w-px bg-white/15"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-[3px] top-1 w-px origin-top bg-brand-mint transition-transform duration-150"
        style={{ height: 'calc(100% - 0.5rem)', transform: `scaleY(${progresso})` }}
      />
      {secoes.map((s) => {
        const atual = s.id === ativa
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => irPara(s.id)}
            aria-current={atual ? 'true' : undefined}
            className="group relative flex items-center gap-3 pl-0 text-left"
            data-cursor="mais"
          >
            <span
              className={`relative z-10 size-[7px] shrink-0 rounded-full transition-all duration-200 ${
                atual ? 'scale-[1.6] bg-brand-mint' : 'bg-white/35 group-hover:bg-white/70'
              }`}
            />
            <span
              className={`whitespace-nowrap text-xs font-medium transition-all duration-200 ${
                atual
                  ? 'text-white opacity-100'
                  : 'text-white/60 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
              }`}
            >
              {s.rotulo}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
