## Why

O site institucional (`site-institucional-e-precos`) subiu numa versão mínima: header com um ícone genérico, hero com um `hero.png` e três blocos de texto. Agora há **marca** (logo SimpleCote) e **material de vídeo** (uma animação de marca + uma demo do produto) para mandar a clientes. O site precisa parecer um produto real — hero com movimento, o logo de verdade, os vídeos, animação ao rolar — sem virar um monstro de dependências.

Change de **design**, front puro. Não muda API, rotas, `planos.ts`, SEO nem o comportamento tenant-aware do `/`.

## What Changes

- **Logo**: header e rodapé passam a usar a marca SimpleCote (`src/assets/logo-simplecote.jpg` — e a variante `-alt`) no lugar do ícone `ShoppingBag` + texto. Como os arquivos são JPEG com fundo branco, a implementação SHALL resolver o fundo (recortar o símbolo "S" e compor com texto HTML "SimpleCote" ao lado; ou `mix-blend-mode`; ou converter para PNG transparente). O símbolo "S" isolado é o elemento seguro de reuso (o wordmark do JPEG tem um "E" final invertido — artefato).
- **Hero**: seção de abertura com a **animação de marca** (`/midia/animacao-marca.mp4`) como fundo/elemento visual (autoplay, muted, loop, playsinline; `poster` estático; respeita `prefers-reduced-motion` → mostra o poster parado). Título + subtítulo + CTAs "Criar conta" / "Entrar" sobre um overlay legível.
- **"Veja em ação"**: seção nova com a **demo do produto** (`/midia/demo-produto.mp4`) num player com controles (não autoplay), enquadrado como a tela do app.
- **Movimento ao rolar**: as seções entram com um fade/slide sutil ao aparecer (IntersectionObserver ou lib leve). SHALL respeitar `prefers-reduced-motion` (sem animação). Sem parallax pesado.
- **Seções**: hero → como funciona (3 passos, com ícone/número destacado) → veja em ação (vídeo) → benefícios (grade curta) → planos (resumo dos 3 de `planos.ts`, link para `/precos`) → CTA final. Mantém "como funciona" e o texto atual como base.
- **Tema**: o site SHALL respeitar o tema claro/escuro (tokens do design system) — hoje o `SiteChrome` já usa `bg-background`/`text-foreground`; garantir contraste do hero sobre o vídeo nos dois temas.
- **`PrecosPage` / `AjudaPage`**: só herdam o header/rodapé novos; conteúdo inalterado (podem ganhar um respiro de espaçamento).

## Capabilities

### Modified Capabilities

- `site`: o site institucional passa a usar a marca SimpleCote, vídeo no hero e numa seção de demonstração, e animação de entrada ao rolar — respeitando `prefers-reduced-motion` e o tema.

## Impact

- `src/assets/logo-simplecote.jpg`, `logo-simplecote-alt.jpg` (novos — já no repo). `public/midia/animacao-marca.mp4`, `public/midia/demo-produto.mp4` (novos — já no repo; servidos em `/midia/…`).
- `src/site/SiteLayout.tsx` (`SiteChrome`): logo no lugar do ícone+texto, no header e no rodapé.
- `src/site/HomePage.tsx`: reescrita das seções (hero com vídeo, "veja em ação", movimento ao rolar, resumo de planos). Usa `planos.ts` para o resumo — não duplica (`RISCOS-TRANSVERSAIS.md §G`).
- `src/site/` — possível `useRevelarAoRolar.ts` (hook IntersectionObserver) ou `MediaHero.tsx`/`SecaoRevelavel.tsx`; um `<Logo />` reutilizável.
- Opcional: **1** dependência leve de animação (ex.: `framer-motion`) se o hook próprio não bastar — decisão do agente; sem GSAP/lenis.
- `index.html` / `seo.ts`: manter `<title>`/description; `og:image` pode passar a apontar para o logo.
- Testes: `HomePage` renderiza o hero com CTAs "Criar conta"/"Entrar" e a seção de planos com os itens de `planos.ts`; o vídeo do hero tem `muted`/`playsinline`/`loop` e um `poster`; com `prefers-reduced-motion` reduzido, nenhuma animação de entrada roda (mock do matchMedia). `SiteChrome` renderiza o logo com `alt` acessível. Roteamento (`Raiz` backoffice→login, `/` marketing→home) inalterado.
- `npm run build` — atenção ao aviso de chunk: o vídeo em `public/` não entra no bundle; o logo em `src/assets/` é otimizado pelo Vite.
- Sem mudança de contrato com o back.

## Fora do escopo (follow-up)

- Logo em **SVG** de verdade (o JPEG é provisório). Trocar quando houver o vetor.
- Compressão/transcodificação dos `.mp4` para `webm` + `mp4` (dois `<source>`), se o peso incomodar.
- Página de casos/depoimentos reais (hoje só um CTA).
