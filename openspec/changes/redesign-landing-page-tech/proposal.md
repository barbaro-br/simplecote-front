## Why

O site institucional atual (front do SaaS) precisa de um visual muito mais moderno, tecnológico e impactante para converter visitantes em clientes. Precisamos aplicar a nova identidade visual (com a paleta extraída da nova logo: azul marinho e verde menta), adicionar efeitos de scroll, transições suaves e integrar os vídeos (hero e demonstração) de forma imersiva.

## What Changes

- Extração e padronização da nova paleta de cores (Navy Blue e Mint Green) no Tailwind.
- Substituição do ícone genérico pela nova logo oficial em formato SVG/vetorizado (navbar e rodapé).
- Redesign completo da página inicial (`/`):
  - **Hero Section**: Fundo escuro/tecnológico com o vídeo institucional rodando de fundo, textos legíveis e CTAs brilhantes.
  - **Scroll Animations**: Implementação de *Framer Motion* para as seções irem aparecendo suavemente conforme o usuário desce a página (fade-in, slide-up).
  - **Features / Demo**: Novo layout para a demonstração do produto, com estilo "Glassmorphism" (vidro) e muito respiro.
- Redesign da página de preços (`/precos`) com *cards* interativos, hover effects modernos e foco no plano principal.
- Garantir que todos os efeitos respeitem as regras de acessibilidade (`prefers-reduced-motion`).

## Capabilities

### New Capabilities
- (Nenhuma capacidade puramente nova, é um refinamento extremo do design existente).

### Modified Capabilities
- `site`: Atualização profunda do design do site institucional (Home, Preços e Ajuda) incorporando animações avançadas, a nova paleta da marca e o vídeo de fundo, mantendo os requisitos funcionais já estabelecidos.

## Impact

- `tailwind.config.ts`: Adição da nova paleta de cores (brand-primary, brand-secondary).
- `src/site/`: Alteração drástica dos componentes visuais (`HomePage`, `PrecosPage`, layouts de cabeçalho/rodapé).
- Dependência: Adição do pacote `framer-motion` para gerenciar as animações de scroll.
