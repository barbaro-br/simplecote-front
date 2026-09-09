import type { ReactNode } from 'react'

/**
 * Painel glass das seções do site — conteúdo legível por cima do fundo de marca
 * fixo (`HeroFundo`). Usado na home, em Preços e Ajuda para o mesmo visual.
 */
export function Painel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl rounded-3xl border border-white/10 bg-background/70 backdrop-blur-sm md:backdrop-blur-2xl ${
        className ?? ''
      }`}
    >
      {children}
    </div>
  )
}
