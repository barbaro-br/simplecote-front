## MODIFIED Requirements

### Requirement: Marca, vídeo e movimento no site institucional

O site institucional SHALL exibir a marca SimpleCote como **logo SVG vetorial** (símbolo "S" navy/mint + wordmark em texto, recolorível, transparente) no cabeçalho e no rodapé, no lugar de um ícone genérico e dos JPEGs anteriores, com texto alternativo acessível e a paleta institucional (navy/mint) tokenizada. Na home, o vídeo de marca (autoplay, sem som, loop, `playsinline`, com `poster`) SHALL atuar como **fundo FIXO da página inteira** — nunca rola —, com o conteúdo passando por cima. O hero SHALL ocupar a viewport inteira (altura `100svh`), de modo que nenhuma seção seguinte apareça antes do fim dele. Cada seção subsequente SHALL vir num painel translúcido (glass/scrim) que mantém o texto legível sobre o vídeo em movimento, nos temas claro e escuro. O fundo PODE ter uma camada 3D animada (shader) por cima do gradiente/vídeo, carregada sem bloquear o first paint; a página NÃO SHALL depender dela. A rolagem entre seções SHALL usar scroll-snap suave (`proximity`) e o cabeçalho do site PODE se esconder ao rolar para baixo e reaparecer ao rolar para cima. A home SHALL ter uma seção de demonstração com um vídeo do produto em player com controles (sem reprodução automática) e um espaço para um vídeo de tutorial do YouTube (com placeholder enquanto não houver id). As seções da home SHALL entrar com animações coordenadas baseadas no scroll (aparecimento na viewport, elevação de cards). Toda animação, o scroll-snap, o auto-hide do cabeçalho, a reprodução automática do vídeo e a camada 3D SHALL respeitar `prefers-reduced-motion: reduce` e `Save-Data` (nesse caso: fundo fixo só com o gradiente da marca, sem vídeo/3D/snap; cabeçalho sempre visível; seções instantâneas). Numa viewport estreita (`< md`) o fundo fixo SHALL ser apenas o gradiente (sem decode de vídeo durante o scroll). A home SHALL continuar mostrando um resumo dos planos a partir da fonte única (`planos.ts`), com link para `/precos`. As rotas e o comportamento tenant-aware do `/` (backoffice → login, marketing → home) NÃO mudam.

#### Scenario: Fundo de marca fixo com hero em tela cheia

- **WHEN** um visitante abre a home num desktop sem movimento reduzido
- **THEN** vê o hero preenchendo a tela inteira (nada da próxima seção espiando por baixo), com o vídeo de marca de fundo; ao rolar, o vídeo permanece fixo e as seções (Como funciona, Por que, Planos, Comece grátis) passam por cima como painéis translúcidos legíveis, com snap suave entre elas

#### Scenario: Movimento reduzido

- **WHEN** o visitante tem `prefers-reduced-motion: reduce` (ou `Save-Data`)
- **THEN** o fundo fixo é só o gradiente da marca (sem vídeo em autoplay, sem 3D), não há scroll-snap, o cabeçalho fica sempre visível, e todas as seções e cards aparecem instantaneamente, sem animação de scroll ou fade-in

#### Scenario: Degrada no celular sem quebrar

- **WHEN** o visitante abre qualquer rota do site numa viewport estreita (ex.: 360px)
- **THEN** não há scroll horizontal, o fundo fixo é só o gradiente (sem vídeo rolando) e a camada 3D não é renderizada, os painéis das seções ficam em uma coluna, e todo o conteúdo (hero, planos, demonstração) permanece legível e navegável

#### Scenario: Resumo de planos da fonte única

- **WHEN** a home renderiza a seção de planos
- **THEN** os planos vêm de `planos.ts` (nome, preço, quotas) e há um link para `/precos`

#### Scenario: Demonstração do produto

- **WHEN** o visitante chega na seção "veja em ação"
- **THEN** vê um player do vídeo de demonstração com controles, integrado ao layout moderno, sem reprodução automática, e um espaço para o vídeo de tutorial do YouTube
