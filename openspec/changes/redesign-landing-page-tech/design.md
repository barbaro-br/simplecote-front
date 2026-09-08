## Context

Redesign "max tech" do site institucional (React 19, Tailwind v4, Vite 8/rolldown, `@base-ui/react`, Geist). Efeitos pesados de scroll/3D/glass **sem** comprometer o first paint nem quebrar no mobile, e respeitando `prefers-reduced-motion` (regra do projeto). O site é servido em `www.simplecote.com.br` / `app.simplecote.app`; um cliente prospect abre tanto no desktop quanto no celular.

## Goals / Non-Goals

**Goals**
- Estética de produto de tecnologia de ponta na Home e na `/precos`.
- Camada 3D de destaque no hero (shader animado), carregada sem bloquear a página.
- Smooth-scroll + scroll reveal cinematográfico (GSAP/ScrollTrigger) e micro-interações (cursor custom, botão magnético, spotlight).
- Logo SVG da marca + paleta navy/mint tokenizada.
- Degradação elegante: mobile e reduced-motion recebem uma versão plana, rápida e sem bugs.

**Non-Goals**
- Roteamento, login/cadastro, entidades/DB.
- SEO além de manter o `useSEO` atual.
- Dark mode novo (herda o `.dark` existente).

## Decisions

**1. Motor de animação: `motion` (framer-motion) + `gsap`**
- `motion` para entrada de componentes, gestos, `whileInView` simples e o cursor/botão magnético.
- `gsap` + `ScrollTrigger` para as sequências longas amarradas ao scroll (pin, parallax, stagger por seção) e `SplitText` para o título do hero animar por letra/palavra.
- Alternativa (IntersectionObserver + CSS): descartada — não entrega pin/scrub/timeline.

**2. Smooth scroll: `lenis`**
- Um `Lenis` global no layout do site; `gsap.ticker` dá o `raf`. `ScrollTrigger.update` no evento `scroll` do Lenis.
- **Desligado** quando `prefers-reduced-motion: reduce` → scroll nativo.
- Só na casca do site (`SiteChrome`), nunca no `/admin` nem nas rotas por token.

**3. Camada 3D: `@react-three/fiber` + `three`, shader plane**
- Um `<mesh>` de plano ocupando o hero, fragment shader com ruído/gradiente fluido navy→mint (simplex noise + tempo). Sem modelos, sem texturas — só shader, leve.
- **`React.lazy` / `import()` dinâmico**: o chunk R3F/three só baixa depois do first paint e só quando `deveAnimar` é true. Enquanto isso (e sempre no fallback), um gradiente CSS `--brand-navy-deep → --brand-navy` cobre o mesmo espaço — o layout nunca depende do 3D.
- **Não renderiza** em: `prefers-reduced-motion`, `navigator.connection.saveData`, viewport `< md` (768px), ou quando o contexto WebGL falha (`onCreated` erro → estado `sem3d`). jsdom (testes) cai no fallback naturalmente.
- LCP = o `<h1>` do hero (texto), nunca o vídeo ou o canvas.

**4. Vídeo de fundo**
- `animacao-marca.mp4` em `<video autoPlay muted loop playsInline poster>` como cover, `object-cover`, atrás do shader com `opacity`/`mix-blend`. Pausado sob reduced-motion (só o poster). Se ficar ruim como fundo, remove o `<video>` e deixa só shader+gradiente — decisão no handoff.

**5. Componentes "wow" copiados pro repo (`src/site/tech/`)**
- Nada de dependência de registry (shadcn add / aceternity). Cada efeito é um componente pequeno próprio, construído sobre `motion` + Tailwind:
  - `CursorMais`: elemento fixo que segue o mouse com spring; vira um "+" (escala + rótulo) quando o mouse está sobre `[data-cursor="mais"]`. Montado só com `matchMedia('(pointer: fine)')`. Esconde o cursor nativo só na área do hero/seções interativas.
  - `BotaoMagnetico`: wrapper que puxa o filho na direção do mouse (translate com spring, raio limitado). Degrada pra botão normal sem `pointer: fine`.
  - `SpotlightCard`: `radial-gradient` seguindo `--x/--y` (mousemove) sob `backdrop-blur`.
  - `BorderBeam`: borda com um brilho `conic-gradient` girando (CSS `@property` + keyframes), desligável.
  - `GridAnimado`: fundo SVG de grid/dots com máscara radial e leve drift.
  - `Marquee`: faixa infinita (CSS animation) com `prefers-reduced-motion` → estática.
  - `TextoGradiente`: `background-clip: text` navy→mint com shimmer opcional.
- Todos aceitam e respeitam `deveAnimar` de `useReduzirMovimento`.

**6. `useReduzirMovimento()`**
- `true` quando `matchMedia('(prefers-reduced-motion: reduce)')` **ou** `navigator.connection?.saveData`. Um único hook, usado por tudo. `deveAnimar = !useReduzirMovimento()`.

**7. Mobile-first / não quebrar no celular (requisito)**
- Toda seção projetada primeiro em 360px; breakpoints só *adicionam*.
- `overflow-x: clip` no wrapper do site; nenhum elemento com largura fixa maior que a viewport; efeitos que "vazam" (beam, marquee, parallax) sempre dentro de um container `overflow-hidden`.
- `< md`: sem canvas 3D, sem `backdrop-blur` além de `sm`, sem cursor custom, sem parallax; animações viram fade curto. Layout de cards vira 1 coluna.
- Vídeos: `playsInline` obrigatório; `poster` sempre; `preload="metadata"`.
- Checagem manual a 360/390/768/1280 no handoff.

## Risks / Trade-offs

- **FPS/bateria no mobile** com blur + vídeo + shader → mitigado desligando os três abaixo de `md` e sob Save-Data/reduced-motion.
- **Peso do bundle** (three ≈ pesado) → chunk R3F 100% lazy e fora do caminho crítico; a Home é utilizável antes dele.
- **Regressão de testes RTL** por mudança de marcação → parte 5 revisa os testes; manter roles/textos-âncora ("Criar conta", "Planos", headings).
- **Logo SVG é reinterpretação** do símbolo, não 1:1 — aceitável como v1; troca fácil depois.
