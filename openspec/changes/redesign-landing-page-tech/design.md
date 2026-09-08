## Context

Conforme a `proposal.md`, vamos redesenhar a página institucional do SimpleCote com um estilo altamente tecnológico e moderno. A stack atual usa React 19, Tailwind v4 e `@base-ui/react`. Precisamos implementar efeitos complexos de rolagem e de "vidro" (glassmorphism) sem comprometer o desempenho e mantendo a compatibilidade estrita com a regra de acessibilidade do sistema (`prefers-reduced-motion`).

## Goals / Non-Goals

**Goals:**
- Integrar a biblioteca `framer-motion` para gerenciar animações de scroll e componentes com `layoutId` e transições de presença.
- Adicionar ao `tailwind.config.ts` (ou CSS global do v4) a nova paleta de cores (baseada na logo SVG).
- Reestruturar `src/site/HomePage.tsx` para usar o vídeo de fundo coberto por componentes semitransparentes.
- Otimizar o SVG da nova logo para ser leve e controlável por propriedades CSS (ex: troca de cor no dark mode).

**Non-Goals:**
- Mudar a arquitetura de roteamento ou o fluxo de login/cadastro (apenas a "casca" e o CTA mudam).
- Criar modelos ou entidades no banco de dados.

## Decisions

**1. Framer Motion vs CSS Puro**
- **Decisão:** Usar `framer-motion` para orquestrar o scroll reveal e o *stagger* de elementos.
- **Alternativa:** Intersection Observer + CSS puro. Daria mais trabalho gerenciar a entrada/saída contínua na viewport e os atrasos dinâmicos (`delay`) nos itens de preços/features.

**2. Integração com Tailwind (Dark Mode e Cores)**
- **Decisão:** Declarar `brand-navy` (ex: `#1a365d`) e `brand-mint` (ex: `#38b2ac`) no tema do Tailwind. Usar `backdrop-blur-md bg-white/10 dark:bg-black/40` para o efeito *Glassmorphism* em cima do vídeo.
- **Alternativa:** Usar cores inline (ruim para manutenção) ou criar classes CSS arbitrárias. Tailwind utilities de desfoque e opacidade entregam o efeito perfeitamente.

**3. Respeito ao `prefers-reduced-motion`**
- **Decisão:** O Framer Motion já trata isso nativamente se usarmos o hook `useReducedMotion()`. Vamos envolver todas as animações pesadas com uma checagem `shouldAnimate = !useReducedMotion()`. Para os vídeos, adicionaremos lógica para pausar se a preferência de sistema exigir movimento reduzido.

## Risks / Trade-offs

- **Performance do Vídeo e Blur:** Efeitos de `backdrop-filter` combinados com vídeos reproduzindo em autoplay no mobile podem derrubar o FPS (Frames Per Second) ou torrar bateria.
  - **Mitigação:** Vamos garantir que o vídeo seja um MP4 otimizado (baixo bitrate, 720p ou 1080p muito compactado) e vamos ocultar o desfoque ou simplificar o layout em telas estritamente móveis, caso necessário, usando um design mais plano e performático abaixo de `md:`.
