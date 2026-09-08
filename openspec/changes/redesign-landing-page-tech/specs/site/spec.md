## MODIFIED Requirements

### Requirement: Marca, vídeo e movimento no site institucional

O site institucional SHALL exibir a nova marca oficial SimpleCote (logo com "S" em vetor/SVG) no cabeçalho e no rodapé, no lugar de um ícone genérico, com texto alternativo acessível e as cores institucionais atualizadas. A home SHALL ter uma seção de abertura (hero) tecnológica com um vídeo de marca em reprodução automática, sem som, em loop e `playsinline`, atuando como background imersivo, com um `poster` estático sempre presente e conteúdo (título, subtítulo, CTAs "Criar conta" e "Entrar") legível sobre ele, destacado com efeitos visuais modernos (ex: glassmorphism/desfoque de fundo). A home SHALL ter uma seção de demonstração com um vídeo do produto em player imersivo com controles (sem reprodução automática). As seções da home e a navegação SHALL entrar e se organizar com animações coordenadas e avançadas baseadas no scroll do usuário (aparecimento na viewport, elevação de cards, etc). Toda animação e a reprodução automática do hero SHALL respeitar estritamente `prefers-reduced-motion: reduce` (nesse caso, sem animação de scroll e sem play no vídeo — apenas a interface estática legível e o `poster`). A home SHALL continuar mostrando um resumo dos planos a partir da fonte única (`planos.ts`), com link para `/precos`. As rotas e o comportamento tenant-aware do `/` (backoffice → login, marketing → home) NÃO mudam.

#### Scenario: Hero tecnológico com vídeo imersivo

- **WHEN** um visitante abre a home
- **THEN** vê o novo logo SVG no cabeçalho e um hero imersivo com o vídeo de marca de fundo (autoplay, mudo, loop, `playsinline`, com `poster`) e os CTAs "Criar conta" e "Entrar" com destaque legível

#### Scenario: Movimento reduzido (Acessibilidade)

- **WHEN** o visitante tem `prefers-reduced-motion: reduce`
- **THEN** o vídeo do hero não é reproduzido automaticamente (mostra o `poster`) e todas as seções e cards aparecem na tela instantaneamente, sem nenhuma animação de scroll ou fade-in

#### Scenario: Resumo de planos da fonte única

- **WHEN** a home renderiza a seção de planos
- **THEN** os planos vêm de `planos.ts` (nome, preço, quotas) e há um link para `/precos`

#### Scenario: Demonstração do produto

- **WHEN** o visitante chega na seção "veja em ação"
- **THEN** vê um player do vídeo de demonstração com controles, integrado perfeitamente ao layout moderno, sem reprodução automática
