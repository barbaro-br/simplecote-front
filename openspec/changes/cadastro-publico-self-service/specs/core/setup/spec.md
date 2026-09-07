## MODIFIED Requirements

### Requirement: Roteamento isolado por perfil
A aplicação MUST disponibilizar duas árvores de rota independentes: uma área de administração (`/admin/**`) com navegação global e guarda de sessão, e uma área pública desenhada primariamente para mobile. A área pública inclui as rotas anônimas de acesso via token (`/cotacao/:token`, `/pedido/:token`, `/colaborador/:token`) e as rotas anônimas de entrada de conta (`/login`, `/esqueci-senha`, `/cadastro`, `/verificar-email`) — nenhuma delas SHALL renderizar o shell do painel nem exigir sessão autenticada.

#### Scenario: Acesso Admin
- **WHEN** o usuário acessa `/admin/produtos`
- **THEN** a interface exibe o shell do painel (sidebar, layout global) e o conteúdo da rota

#### Scenario: Acesso Representante
- **WHEN** o usuário acessa `/cotacao/abc-123`
- **THEN** a interface exibe apenas o formulário da cotação sem navegação lateral (shell minimalista)

#### Scenario: Acesso ao cadastro público
- **WHEN** um visitante sem sessão acessa `/cadastro` ou `/verificar-email`
- **THEN** a interface exibe a tela pública correspondente, sem o shell do painel e sem redirecionar para `/login`
