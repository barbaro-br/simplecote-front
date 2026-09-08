## 1. Marca

- [x] 1.1 `src/site/Logo.tsx`: componente reutilizável — recorta só o símbolo "S" (`object-cover`/`object-left`, o wordmark do JPEG tem "E" invertido) + texto "SimpleCote"; `variant` (`completo`/`simbolo`) e tamanho; nome acessível "SimpleCote"
- [x] 1.2 `SiteChrome` (em `src/site/SiteLayout.tsx`): header e rodapé usam `<Logo />` no lugar de `ShoppingBag` + texto
- [x] 1.3 `seo.ts`: `useSEO` ganhou `ogImage` opcional; a home passa o logo importado

## 2. Hero com vídeo

- [x] 2.1 `src/site/HeroVideo.tsx`: `<video src="/midia/animacao-marca.mp4" muted loop playsinline poster={…}>` de fundo + overlay (`bg-gradient-to-b`) legível nos 2 temas
- [x] 2.2 `prefers-reduced-motion: reduce` → `autoPlay={false}` (via `useSyncExternalStore`); `poster` sempre presente
- [x] 2.3 Hero com título, subtítulo e CTAs "Criar conta" (`/cadastro`) / "Entrar" (`/login`)

## 3. Seções e movimento

- [x] 3.1 `src/site/useRevelarAoRolar.ts`: hook `IntersectionObserver` que adiciona `.revelado`; **no-op** sem `IntersectionObserver` (jsdom) ou com `prefers-reduced-motion`
- [x] 3.2 `HomePage`: hero → como funciona (3 passos) → veja em ação (`demo-produto.mp4` com `controls`) → benefícios → planos (map de `planos.ts` + link `/precos`) → CTA final
- [x] 3.3 Cada seção usa `SecaoRevelavel` para entrar suave; sem parallax

## 4. Tema e responsivo

- [x] 4.1 Tokens do design system (`bg-background`, `text-foreground`, `text-muted-foreground`, `border`, `primary`…); só o overlay do hero usa cor/gradiente
- [x] 4.2 Hero legível em mobile; vídeos com `width:100%`; nav do header colapsa bem (gap responsivo)

## 5. Testes

- [x] 5.1 `HomePage.test.tsx`: CTAs "Criar conta"/"Entrar"; vídeo do hero com `muted`/`loop`/`playsinline`/`poster`
- [x] 5.2 `HomePage.test.tsx`: seção de planos lista os 3 de `planos.ts` (nome) + link para `/precos`
- [x] 5.3 `prefers-reduced-motion: reduce` (matchMedia mockado) → vídeo do hero `autoplay=false`; hook no-op
- [x] 5.4 `Logo.test.tsx`: nome acessível "SimpleCote"; roteamento (`Raiz` backoffice→login, `/` marketing→home) segue nos testes existentes (`site.test.tsx`, `raiz-backoffice.test.tsx`)

## 6. Checagem de saúde

- [x] 6.1 `npm test` + `npm run build` + `npm run lint` verdes
- [ ] 6.2 Verificação manual: abrir `/` numa aba anônima (claro e escuro), rolar até o fim, dar play na demo; abrir no celular; conferir `/precos` e `/ajuda` com o header/rodapé novos
