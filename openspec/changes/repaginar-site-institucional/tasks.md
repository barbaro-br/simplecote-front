## 1. Marca

- [ ] 1.1 `src/site/Logo.tsx`: componente reutilizável. Resolve o fundo branco do JPEG — recorta/usa só o símbolo "S" (`object-position`/`clip` ou um crop novo em `src/assets/`) e escreve "SimpleCote" como texto ao lado; `alt`/`aria-label` acessível; aceita `variant` (só símbolo / símbolo+wordmark) e tamanho
- [ ] 1.2 `SiteChrome` (em `src/site/SiteLayout.tsx`): header e rodapé usam `<Logo />` no lugar de `ShoppingBag` + `<span>SimpleCote</span>`
- [ ] 1.3 `seo.ts`/`index.html`: `og:image` aponta para o logo (arquivo em `src/assets` importado, ou uma cópia em `public/`)

## 2. Hero com vídeo

- [ ] 2.1 `src/site/HeroVideo.tsx` (ou dentro do `HomePage`): `<video src="/midia/animacao-marca.mp4" autoplay muted loop playsinline poster={…}>` de fundo, com overlay (gradiente/cor) para o texto ficar legível nos temas claro e escuro
- [ ] 2.2 `prefers-reduced-motion: reduce` → não dá play (mostra só o `poster`); um `poster` estático (frame do vídeo ou o `hero.png` atual) sempre presente
- [ ] 2.3 Conteúdo do hero: título, subtítulo, CTAs "Criar conta" (`/cadastro`) e "Entrar" (`/login`)

## 3. Seções e movimento

- [ ] 3.1 `src/site/useRevelarAoRolar.ts`: hook `IntersectionObserver` que adiciona uma classe quando a seção entra na viewport; **no-op** se `prefers-reduced-motion: reduce`. (Ou `framer-motion` — no máximo 1 lib, sem GSAP/lenis)
- [ ] 3.2 `HomePage`: seções na ordem hero → como funciona (3 passos com número/ícone destacado — reusa o texto atual) → **veja em ação** (`<video src="/midia/demo-produto.mp4" controls>` enquadrado como tela do app) → benefícios (grade curta) → **planos** (map de `planos.ts` — nome, preço, 2–3 quotas, `destaque`; link "ver todos" → `/precos`) → CTA final ("Criar conta", "sem cartão")
- [ ] 3.3 Cada seção usa o hook/motion de 3.1 para entrar suave; sem parallax

## 4. Tema e responsivo

- [ ] 4.1 Tudo com tokens do design system (`bg-background`, `text-foreground`, `text-muted-foreground`, `border`, `primary`…); nada de cor fixa fora do overlay do hero
- [ ] 4.2 Mobile: hero legível, vídeos com `width:100%`, sem overflow horizontal; nav do header colapsa bem

## 5. Testes

- [ ] 5.1 `HomePage.test.tsx`: hero tem os CTAs "Criar conta"/"Entrar"; o `<video>` do hero tem `muted`, `loop`, `playsinline` e um `poster`
- [ ] 5.2 `HomePage.test.tsx`: a seção de planos lista os 3 de `planos.ts` (por nome) e tem link para `/precos`
- [ ] 5.3 `prefers-reduced-motion`: com `matchMedia` mockado como `reduce`, o vídeo do hero não recebe play e o hook de revelar é no-op (as seções aparecem sem classe de animação)
- [ ] 5.4 `SiteChrome`/`Logo`: renderiza com `alt`/`aria-label` "SimpleCote"; roteamento (`Raiz` backoffice→login, `/` marketing→home) segue nos testes existentes

## 6. Checagem de saúde

- [ ] 6.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 6.2 Verificação manual: abrir `/` numa aba anônima (claro e escuro), rolar até o fim, dar play na demo; abrir no celular; conferir `/precos` e `/ajuda` com o header/rodapé novos
