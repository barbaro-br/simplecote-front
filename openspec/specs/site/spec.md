# site Specification

## Purpose
Site institucional público do SimpleCote — a página inicial que apresenta o produto, a página de preços com os planos e a central de ajuda — servindo de porta de entrada para o auto-cadastro e o login, para visitantes que chegam sem sessão.

## Requirements

### Requirement: Página inicial pública

A rota `/` SHALL, para um visitante sem sessão, exibir uma página institucional explicando o que é o SimpleCote (cotação competitiva / leilão reverso para supermercados) e como funciona, com chamadas claras para "Criar conta" (`/cadastro`) e "Entrar" (`/login`). Para um visitante com sessão ativa, `/` SHALL continuar redirecionando para `/admin`. A página SHALL usar o layout público (cabeçalho e rodapé do site), não o shell do painel.

#### Scenario: Visitante sem sessão

- **WHEN** alguém sem sessão abre `/`
- **THEN** vê a página institucional com os CTAs "Criar conta" e "Entrar"

#### Scenario: Usuário logado

- **WHEN** alguém com sessão ativa abre `/`
- **THEN** é levado a `/admin`, sem ver a página institucional

#### Scenario: Rota desconhecida sem sessão

- **WHEN** um visitante sem sessão abre uma URL que não corresponde a nenhuma rota
- **THEN** é levado à página inicial pública, não a `/admin`

### Requirement: Página de preços

A rota `/precos` SHALL listar os planos do SimpleCote com o que cada um inclui (as mesmas quotas usadas na cobrança) e um CTA para `/cadastro`. A descrição dos planos SHALL vir de uma fonte única compartilhada com a área de cobrança do painel, de modo que a página de preços e a tela de plano não divirjam.

#### Scenario: Ver os planos

- **WHEN** um visitante abre `/precos`
- **THEN** vê cada plano com suas quotas e um botão que leva a `/cadastro`

#### Scenario: Consistência com a cobrança

- **WHEN** a definição de um plano muda na fonte única
- **THEN** `/precos` e a aba de plano do painel refletem a mesma informação

### Requirement: Central de ajuda pública

A rota `/ajuda` SHALL apresentar, numa página pública navegável, o conteúdo de ajuda hoje disponível apenas no botão flutuante do painel (o FAQ), reaproveitando a mesma fonte de conteúdo.

#### Scenario: Abrir a central de ajuda

- **WHEN** um visitante abre `/ajuda`
- **THEN** vê as perguntas e respostas do FAQ numa página pública, sem precisar de sessão

### Requirement: Layout público comum

As páginas do site (`/`, `/precos`, `/ajuda`) SHALL compartilhar um cabeçalho e um rodapé públicos, com navegação entre elas e os links para "Entrar" e "Criar conta", além do crédito de desenvolvedor já existente na aplicação.

#### Scenario: Navegação entre páginas do site

- **WHEN** o visitante está em qualquer página do site
- **THEN** consegue ir para as outras páginas do site, para `/login` e para `/cadastro` pelo cabeçalho ou rodapé

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
