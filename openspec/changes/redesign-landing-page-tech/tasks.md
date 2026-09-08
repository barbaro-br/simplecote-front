## 1. Setup, marca e infraestrutura de motion

- [x] 1.1 Instalar `motion` (framer-motion). *(pré-existente do primeiro rascunho — revalidar com `npm run build`.)*
- [x] 1.2 Instalar `gsap` (usar `ScrollTrigger` e `SplitText` de `gsap/*` — gratuitos) + `lenis` + `three` + `@react-three/fiber`. `npm run build` verde.
- [x] 1.3 Tokens da marca no `index.css`: `--brand-navy/-deep`, `--brand-mint/-bright` em `:root` + `--color-brand-*` em `@theme inline`. *(feito — validar que `bg-brand-navy` / `text-brand-mint` compilam.)*
- [x] 1.4 `src/site/BrandLogo.tsx` (SVG vetorial, `variant` full/mark, `size`). *(feito — só wire.)*
- [x] 1.5 `src/site/tech/useReduzirMovimento.ts` — `true` sob `prefers-reduced-motion` OU `navigator.connection?.saveData`; export `useDeveAnimar()` = negação. Teste com `matchMedia` mockado.
- [x] 1.6 `src/site/tech/useSmoothScroll.ts` — Lenis global amarrado ao `gsap.ticker`; no-op (scroll nativo) sob `useReduzirMovimento`. Montado uma vez no `SiteChrome`.

## 2. Casca pública (Header/Footer)

- [x] 2.1 `SiteLayout.tsx`: trocar `Logo` por `BrandLogo`; header com glassmorphism (`backdrop-blur-md bg-background/70 supports-[backdrop-filter]:bg-background/60`, borda sutil, sombra ao rolar via estado de scroll). `overflow-x: clip` no wrapper raiz do site.
- [x] 2.2 Footer com `BrandLogo`, cores da marca, e — se fizer sentido — um `GridAnimado` discreto de fundo. Sem overflow horizontal.
- [x] 2.3 Aposentar `src/site/Logo.tsx` (e ajustar `Logo.test.tsx` → `BrandLogo.test.tsx`).

## 3. Componentes "tech" (`src/site/tech/`)

- [x] 3.1 `CursorMais.tsx` — segue o mouse com spring do `motion`; vira "+" sobre `[data-cursor="mais"]`; só monta com `matchMedia('(pointer: fine)')` e `useDeveAnimar()`.
- [x] 3.2 `BotaoMagnetico.tsx` — atrai o filho na direção do mouse (raio limitado, spring); degrada pra render normal sem `pointer: fine`. Aplicar nos CTAs do hero e da seção final.
- [x] 3.3 `SpotlightCard.tsx` — brilho radial seguindo o mouse sob blur. `BorderBeam.tsx` — borda com brilho girando (CSS `@property`/keyframes), desligável.
- [x] 3.4 `GridAnimado.tsx` (grid/dots com máscara radial + drift), `Marquee.tsx` (faixa infinita; estática sob reduced-motion), `TextoGradiente.tsx` (`bg-clip-text` navy→mint + shimmer).
- [x] 3.5 `EmbedYouTube.tsx` — recebe `videoId?`; sem id mostra um placeholder "tutorial em breve" no mesmo formato (aspect-video, moldura glass).
- [x] 3.6 Todos os componentes acima respeitam `useDeveAnimar()` e ficam dentro de containers `overflow-hidden`.

## 4. Hero da Home (vídeo + 3D + fallback)

- [x] 4.1 `src/site/HeroShader.tsx` — `@react-three/fiber` `<Canvas>` com um plano + fragment shader (ruído + gradiente navy→mint animado). Default export para `React.lazy`.
- [x] 4.2 `src/site/HeroFundo.tsx` — orquestra as camadas: (a) gradiente CSS `--brand-navy-deep→--brand-navy` sempre presente; (b) `<video autoPlay muted loop playsInline poster preload="metadata">` de `/midia/animacao-marca.mp4` como cover, só se `useDeveAnimar()` e `>= md`; (c) `<Suspense>` + `lazy(HeroShader)` só se `useDeveAnimar()`, `>= md`, sem `saveData` e WebGL ok (`onCreated`/`onError` → estado `sem3d`). Se o vídeo ficar ruim como fundo, remover a camada (b) — anotar no handoff o que ficou.
- [x] 4.3 `HomePage.tsx` hero: `HeroFundo` atrás; `<h1>` com `SplitText` + stagger (`gsap`), subtítulo e CTAs (`BotaoMagnetico`) com fade do `motion`. `<h1>` é o LCP — texto, nunca mídia. `data-cursor="mais"` nos CTAs.

## 5. Corpo da Home e /precos

- [x] 5.1 Reescrever as seções da Home (Como funciona, Veja em ação, Por que, Planos, Comece grátis) com reveal via `gsap`+`ScrollTrigger` (stagger por seção, parallax leve das camadas) atrás de `useDeveAnimar()`; substituir `SecaoRevelavel`/`useRevelarAoRolar` de forma consistente.
- [x] 5.2 "Como funciona" e "Por que o SimpleCote": bento grid com `SpotlightCard`. "Veja em ação": `demo-produto.mp4` emoldurado (glass) + `EmbedYouTube` (placeholder) lado a lado ou em abas.
- [x] 5.3 Seção de planos (Home) e `PrecosPage.tsx`: cards glass com `BorderBeam` no plano em destaque, hover tilt (`motion` `rotateX/rotateY` por mouse), `Marquee` de benefícios/logos. Legibilidade do texto sobre glass conferida (contraste AA).
- [x] 5.4 `EmbedYouTube` (placeholder) também na `AjudaPage.tsx`.

## 6. Mobile / degradação (requisito explícito)

- [x] 6.1 `< md`: sem `HeroShader`, sem `<video>` de fundo (só gradiente), sem `CursorMais`, sem parallax, blur no máximo `sm`; cards em 1 coluna; animações viram fade curto.
- [x] 6.2 Nenhum scroll horizontal em nenhuma rota do site: `overflow-x: clip` no wrapper + toda seção de efeito dentro de `overflow-hidden`; conferir a 360 / 390 / 768 / 1280 px.
- [x] 6.3 `prefers-reduced-motion` e `Save-Data`: sem 3D, sem vídeo em autoplay (poster), sem marquee/beam/parallax; a página fica estática e completa.

## 7. Testes e health gate

- [x] 7.1 `useReduzirMovimento` — `matchMedia` mockado (reduce on/off) e `saveData`.
- [x] 7.2 `HomePage` / `PrecosPage` RTL: revisar seletores; a Home renderiza em jsdom (sem WebGL) **sem lançar** e mostra o fallback (headline, CTAs "Criar conta"/"Entrar", headings de seção, "Planos").
- [x] 7.3 `BrandLogo.test.tsx` (substitui `Logo.test.tsx`): renderiza `full` e `mark`, tem `aria-label`.
- [x] 7.4 Health gate: `npx vitest run` + `npm run build` (com `VITE_API_BASE_URL=http://localhost:8080`) + `npx oxlint` verdes. **Não commitar.**
- [ ] 7.5 (manual, no handoff) print/observação em 360, 390, 768 e 1280 px, e com reduced-motion ligado.
