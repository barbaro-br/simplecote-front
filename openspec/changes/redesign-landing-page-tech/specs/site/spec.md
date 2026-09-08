## MODIFIED Requirements

### Requirement: Marca, vídeo e movimento no site institucional

O site institucional SHALL exibir a marca SimpleCote como **logo SVG vetorial** (símbolo "S" navy/mint + wordmark em texto, recolorível, transparente) no cabeçalho e no rodapé, no lugar de um ícone genérico e dos JPEGs anteriores, com texto alternativo acessível e a paleta institucional (navy/mint) tokenizada. A home SHALL ter uma seção de abertura (hero) tecnológica com um vídeo de marca em reprodução automática, sem som, em loop e `playsinline`, com um `poster` estático sempre presente, atuando como background imersivo, e conteúdo (título, subtítulo, CTAs "Criar conta" e "Entrar") legível sobre ele nos temas claro e escuro, destacado com efeitos visuais modernos (glassmorphism, gradiente da marca). O hero PODE ter uma camada de fundo 3D animada (shader) por cima do gradiente/vídeo, carregada sem bloquear o first paint; a página NÃO SHALL depender dela para ser utilizável. A home SHALL ter uma seção de demonstração com um vídeo do produto em player com controles (sem reprodução automática) e um espaço para um vídeo de tutorial do YouTube (com placeholder enquanto não houver id). As seções da home SHALL entrar e se organizar com animações coordenadas baseadas no scroll do usuário (aparecimento na viewport, elevação de cards, parallax leve). Toda animação, a reprodução automática do hero e a camada 3D SHALL respeitar `prefers-reduced-motion: reduce` e `Save-Data` (nesse caso, sem animação de scroll, sem 3D e sem play no vídeo — apenas a interface estática legível e o `poster`). A home SHALL continuar mostrando um resumo dos planos a partir da fonte única (`planos.ts`), com link para `/precos`. As rotas e o comportamento tenant-aware do `/` (backoffice → login, marketing → home) NÃO mudam.

#### Scenario: Hero com vídeo de marca

- **WHEN** um visitante abre a home num desktop sem movimento reduzido
- **THEN** vê o novo logo SVG no cabeçalho e um hero imersivo com o vídeo de marca de fundo (autoplay, mudo, loop, `playsinline`, com `poster`), eventualmente com uma camada 3D animada por cima, e os CTAs "Criar conta" e "Entrar" com destaque legível

#### Scenario: Movimento reduzido

- **WHEN** o visitante tem `prefers-reduced-motion: reduce` (ou `Save-Data`)
- **THEN** o vídeo do hero não é reproduzido automaticamente (mostra o `poster`), não há camada 3D, e todas as seções e cards aparecem na tela instantaneamente, sem nenhuma animação de scroll ou fade-in

#### Scenario: Degrada no celular sem quebrar

- **WHEN** o visitante abre qualquer rota do site numa viewport estreita (ex.: 360px)
- **THEN** não há scroll horizontal, a camada 3D e os desfoques pesados não são renderizados, os cards ficam em uma coluna, e todo o conteúdo (hero, planos, demonstração) permanece legível e navegável

#### Scenario: Resumo de planos da fonte única

- **WHEN** a home renderiza a seção de planos
- **THEN** os planos vêm de `planos.ts` (nome, preço, quotas) e há um link para `/precos`

#### Scenario: Demonstração do produto

- **WHEN** o visitante chega na seção "veja em ação"
- **THEN** vê um player do vídeo de demonstração com controles, integrado ao layout moderno, sem reprodução automática, e um espaço para o vídeo de tutorial do YouTube
