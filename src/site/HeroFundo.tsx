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
 * Camadas de fundo do hero, em ordem de robustez:
 * (a) gradiente CSS `--brand-navy-deep → --brand-navy` SEMPRE presente — o
 *     layout do hero nunca depende de mídia/3D;
 * (b) `<video>` de marca (`/midia/animacao-marca.mp4`) como cover, só com
 *     `useDeveAnimar()` e `>= md`;
 * (c) `HeroShader` (R3F, lazy) só com `useDeveAnimar()`, `>= md` e WebGL ok.
 *     Sem WebGL (jsdom/teste) ou erro de contexto → cai fora sem lançar.
 */
export function HeroFundo() {
  const deveAnimar = useDeveAnimar()
  const larga = useViewportLarga()
  const [webglOk] = useState(() => webglDisponivel())
  const [sem3d, setSem3d] = useState(false)

  const podeVideo = deveAnimar && larga
  const pode3d = podeVideo && webglOk && !sem3d

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, var(--brand-navy-deep), var(--brand-navy))' }}
      />
      {podeVideo && (
        <video
          className="h-full w-full object-cover opacity-70"
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-navy/20 to-background" />
    </div>
  )
}
