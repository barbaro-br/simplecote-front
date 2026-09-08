## Why

O site institucional (`/`, `/precos`, `/ajuda`) precisa **impressionar** um visitante que não conhece o SimpleCote — hoje é modesto e "não tem nada de tecnológico". Ele é a peça de venda: quando o fundador manda o link pra um supermercado prospect, tem que encher os olhos. A parte funcional já está de pé; aqui é 100% design + interação.

## What Changes

- **Paleta da marca** (extraída da logo — navy `#1e3a5f` + mint `#57bf8e`, + `navy-deep` e `mint-bright` para fundos e brilhos) como tokens no `index.css` (`--brand-*` + utilitários `brand-navy`/`brand-mint`).
- **Logo em SVG vetorial** (`src/site/BrandLogo.tsx`, já criado): substitui os JPEGs de IA (`src/assets/logo-simplecote*.jpg`) — transparente, recolorível, crisp em qualquer fundo, wordmark como texto. Usada no header, footer e onde a marca aparecer.
- **Redesign da Home (`/`)** com estética "tech" pesada, tudo atrás de `prefers-reduced-motion`:
  - **Hero**: `animacao-marca.mp4` como vídeo de fundo cover + uma **camada 3D** (plano com shader animado navy→mint via `@react-three/fiber`, carregada por `import()` dinâmico) por cima; textos e CTAs ("Criar conta" / "Entrar") com fade/stagger do `motion`.
  - **Smooth-scroll** com `lenis`, amarrado ao ticker do `gsap`.
  - **Scroll reveal cinematográfico** com `gsap` + `ScrollTrigger` (+ `SplitText` no título do hero); parallax leve de camadas.
  - **Componentes "wow"** (estilo Magic UI, copiados pro repo — sem registry externo): spotlight card que segue o mouse, border-beam nos cards de plano, fundo de grid/dots animado, **botão magnético**, **cursor custom** que vira um "+" sobre áreas clicáveis (só `pointer: fine`), marquee de logos/benefícios, texto com gradiente animado, bento grid na seção "por que".
  - **"Veja em ação"**: `demo-produto.mp4` integrado ao layout novo + **slot de embed do YouTube** (placeholder até o tutorial ser gravado); o mesmo slot vai na `/ajuda`.
- **Redesign da `/precos`**: cards glass interativos, hover 3D/tilt, destaque no plano principal.
- **Resiliência mobile (requisito explícito)**: a landing **não pode quebrar no celular**. Mobile-first; nada de scroll horizontal; a camada 3D e os `backdrop-blur` pesados são desligados abaixo de `md:` e sob `prefers-reduced-motion` / `Save-Data`, caindo num gradiente CSS estático; vídeo com `poster` e `playsInline`; testado a 360px de largura.

## Capabilities

### Modified Capabilities

- `site`: redesign profundo do site institucional (Home, Preços, Ajuda) — nova paleta e logo SVG da marca, animações avançadas de scroll/3D, vídeo de fundo e slot de tutorial, mantendo os requisitos funcionais já estabelecidos e a regra de `prefers-reduced-motion`. Nova requirement: a landing degrada com elegância no mobile e sob movimento reduzido (sem 3D/blur pesado, sem overflow horizontal).

## Impact

- `package.json`: `+ motion` (framer-motion), `+ gsap` (ScrollTrigger + SplitText, gratuitos), `+ lenis`, `+ three` `+ @react-three/fiber`. Sem SDK pago.
- `src/index.css`: tokens `--brand-navy/-deep`, `--brand-mint/-bright` + mapeamento em `@theme inline` (feito).
- `src/site/BrandLogo.tsx` (novo, feito) — wire nos consumidores.
- `src/site/`: reescrita de `HomePage.tsx`, `PrecosPage.tsx`, `SiteLayout.tsx` (header/footer); `HeroVideo.tsx` evolui pra `Hero3D`/`HeroFundo` (vídeo + shader + fallback); `Logo.tsx` aposentado em favor de `BrandLogo`. `useRevelarAoRolar`/`SecaoRevelavel` são substituídos pela orquestração `gsap`/`motion` de forma consistente (ou reusados onde couber).
- `src/site/tech/` (novo): `CursorMais.tsx`, `BotaoMagnetico.tsx`, `SpotlightCard.tsx`, `BorderBeam.tsx`, `GridAnimado.tsx`, `Marquee.tsx`, `TextoGradiente.tsx`, `useSmoothScroll.ts` (Lenis+GSAP), `useReduzirMovimento.ts` (reduced-motion + Save-Data), `HeroShader.tsx` (R3F, lazy).
- `src/site/AjudaPage.tsx` + Home: `EmbedYouTube.tsx` (placeholder configurável por id).
- Testes: `HomePage`/`PrecosPage` RTL revisados (textos/roles que importam); `useReduzirMovimento` (mock matchMedia → sem animação); um teste garantindo que a Home renderiza sem 3D no ambiente de teste (jsdom sem WebGL) e sem lançar.
- **Assets**: `public/midia/animacao-marca.mp4` (hero) e `public/midia/demo-produto.mp4` (demo) já no repo. Se `animacao-marca.mp4` não servir bem como fundo, o hero fica só com a camada shader (sem vídeo). Vídeo do tutorial YouTube: pendente (slot com placeholder).
- Non-goals: não muda roteamento, login/cadastro, nem cria entidade/tabela.
