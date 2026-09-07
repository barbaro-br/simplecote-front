## ADDED Requirements

### Requirement: Identidade do produto antes do login

As telas de entrada de conta — `/login`, `/esqueci-senha`, `/cadastro`, `/verificar-email` — e o site institucional SHALL exibir exclusivamente a identidade SimpleCote (nome "SimpleCote", mote "Cotações simplificadas"), iguais para qualquer visitante. Essas telas SHALL NOT exibir nome, cor de marca ou logo de uma loja específica, e SHALL NOT chamar `GET /api/configuracoes`. O título base da aba SHALL ser "SimpleCote".

As telas de trabalho por link mágico (`/cotacao/:token`, `/pedido/:token`, `/colaborador/:token`), embora anônimas, NÃO são telas de entrada de conta: elas MAY exibir o nome da loja como contexto de domínio (de qual loja é a cotação), obtido do endpoint público do token — nunca de `GET /api/configuracoes`. Continuam forçando tema claro e SHALL NOT aplicar a cor de marca da loja como identidade visual.

#### Scenario: Tela de login é sempre SimpleCote

- **WHEN** um visitante abre `/login`
- **THEN** vê o nome "SimpleCote" e o mote "Cotações simplificadas", sem nome nem cor de nenhuma loja, e nenhuma chamada a `GET /api/configuracoes` é feita

#### Scenario: Título da aba antes de logar

- **WHEN** o visitante está em qualquer tela anônima
- **THEN** a aba do navegador mostra "SimpleCote"

#### Scenario: Tela de colaborador mostra a loja como contexto

- **WHEN** o colaborador abre `/colaborador/:token`
- **THEN** vê o nome da loja da cotação (do endpoint do token), sem cor de marca e sem chamada a `GET /api/configuracoes`

### Requirement: Identidade da loja depois do login

Após a autenticação, o painel SHALL aplicar a identidade da loja da sessão — nome no shell (sidebar/topbar) e cor de marca — a partir de `GET /api/configuracoes`. O título da aba do navegador SHALL passar a "<nome da loja> · SimpleCote" quando a configuração carregar, e SHALL voltar para "SimpleCote" quando a sessão terminar (logout ou sessão expirada).

#### Scenario: Nome da loja aparece após logar

- **WHEN** o usuário se autentica e a configuração da loja carrega
- **THEN** o shell do painel mostra o nome da loja e a cor de marca, e a aba do navegador passa a "<nome da loja> · SimpleCote"

#### Scenario: Voltar à identidade do produto no logout

- **WHEN** o usuário sai da sessão
- **THEN** o título da aba volta a ser "SimpleCote" e nenhuma identidade de loja permanece visível
