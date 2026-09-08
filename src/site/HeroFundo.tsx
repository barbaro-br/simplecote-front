import { Component, Suspense, lazy, useState, type ReactNode } from 'react'
import hero from '@/assets/hero.png'
import { useDeveAnimar } from './tech/useReduzirMovimento'
import { useViewportLarga } from './tech/useViewportLarga'

const HeroShaderLazy = lazy(() => import('./HeroShader'))

/** Captura erro de montagem do R3F/WebGL e desliga o 3D (estado `sem3d`). */
class LimiteShader extends Component<{ onErro: () => void; children: ReactNode }, { falhou: boolean }> {
  state = { falhou: false }

  static getDerivedStateFromError() {
    return { falhou: true }
  }

  componentDidCatch() {
    this.props.onErro()
  }

  render() {
    return this.state.falhou ? null : this.props.children
  }
}

function webglDisponivel(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Camada FIXA de fundo da home — montada uma vez no topo da `HomePage`,
 * atrás da página inteira (`fixed inset-0 -z-10`), deixando o vídeo da marca
 * aparecer entre os painéis de conteúdo. Em ordem de robustez:
 * (a) gradiente CSS `--brand-navy-deep → --brand-navy` SEMPRE presente;
 * (b) `<video>` de marca (`/midia/animacao-marca.mp4`) cover, dimmed, só com
 *     `useDeveAnimar()` e `>= md`;
 * (c) `HeroShader` (R3F, lazy) só com `useDeveAnimar()`, `>= md` e WebGL ok
 *     (erro de contexto → `sem3d`, sem lançar);
 * (d) scrim `bg-brand-navy-deep/50` por cima pro contraste do texto.
 * `< md` ou reduced-motion/Save-Data → só o gradiente fixo (sem vídeo).
 */
export function HeroFundo() {
  const deveAnimar = useDeveAnimar()
  const larga = useViewportLarga()
  const [webglOk] = useState(() => webglDisponivel())
  const [sem3d, setSem3d] = useState(false)

  const podeVideo = deveAnimar && larga
  const pode3d = podeVideo && webglOk && !sem3d

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, var(--brand-navy-deep), var(--brand-navy))' }}
      />
      {podeVideo && (
        <video
          className="h-full w-full object-cover opacity-60"
          src="/midia/animacao-marca.mp4"
          poster={hero}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
        />
      )}
      {pode3d && (
        <LimiteShader onErro={() => setSem3d(true)}>
          <Suspense fallback={null}>
            <div className="absolute inset-0 mix-blend-screen">
              <HeroShaderLazy />
            </div>
          </Suspense>
        </LimiteShader>
      )}
      <div className="absolute inset-0 bg-brand-navy-deep/50" />
    </div>
  )
}
