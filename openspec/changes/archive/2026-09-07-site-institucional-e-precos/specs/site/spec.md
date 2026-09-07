## Purpose

Site institucional público do SimpleCote — a página inicial que apresenta o produto, a página de preços com os planos e a central de ajuda — servindo de porta de entrada para o auto-cadastro e o login, para visitantes que chegam sem sessão.

## ADDED Requirements

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
