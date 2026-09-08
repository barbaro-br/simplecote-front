## ADDED Requirements

### Requirement: Marca, vídeo e movimento no site institucional

O site institucional SHALL exibir a marca SimpleCote (logo) no cabeçalho e no rodapé, no lugar de um ícone genérico, com texto alternativo acessível. A home SHALL ter uma seção de abertura (hero) com um vídeo de marca em reprodução automática, sem som, em loop e `playsinline`, com um `poster` estático sempre presente e conteúdo (título, subtítulo, CTAs "Criar conta" e "Entrar") legível sobre ele nos temas claro e escuro. A home SHALL ter uma seção de demonstração com um vídeo do produto em player com controles (sem reprodução automática). As seções da home SHALL entrar com uma animação sutil ao aparecer na viewport. Toda animação e a reprodução automática do hero SHALL respeitar `prefers-reduced-motion: reduce` (nesse caso, sem animação e sem play — apenas o `poster`). A home SHALL continuar mostrando um resumo dos planos a partir da fonte única (`planos.ts`), com link para `/precos`. As rotas e o comportamento tenant-aware do `/` (backoffice → login, marketing → home) NÃO mudam.

#### Scenario: Hero com vídeo de marca

- **WHEN** um visitante abre a home
- **THEN** vê o logo SimpleCote no cabeçalho e um hero com o vídeo de marca (autoplay, mudo, loop, `playsinline`, com `poster`) e os CTAs "Criar conta" e "Entrar"

#### Scenario: Movimento reduzido

- **WHEN** o visitante tem `prefers-reduced-motion: reduce`
- **THEN** o vídeo do hero não é reproduzido automaticamente (mostra o `poster`) e as seções aparecem sem animação de entrada

#### Scenario: Resumo de planos da fonte única

- **WHEN** a home renderiza a seção de planos
- **THEN** os planos vêm de `planos.ts` (nome, preço, quotas) e há um link para `/precos`

#### Scenario: Demonstração do produto

- **WHEN** o visitante chega na seção "veja em ação"
- **THEN** vê um player do vídeo de demonstração com controles, sem reprodução automática
