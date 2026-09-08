## ADDED Requirements

### Requirement: Prazo de teste no backoffice

O detalhe de uma loja no backoffice SHALL mostrar o prazo de teste (`trialExpiraEm`) de forma legível — dias restantes, "expirou há N dias", ou "sem prazo" — e SHALL oferecer ações para estender (+7 / +30 dias, ou uma data escolhida) e para remover o prazo, chamando `POST /api/admin/compradores/{id}/prazo`. A listagem SHALL mostrar um indicador de prazo por loja, com destaque para prazos a vencer (≤ 7 dias) e vencidos.

#### Scenario: Estender o prazo pelo detalhe

- **WHEN** o operador clica em "+30 dias" no detalhe de uma loja
- **THEN** o front chama `POST /api/admin/compradores/{id}/prazo` com uma data ~30 dias à frente e o novo prazo aparece

#### Scenario: Remover o prazo

- **WHEN** o operador escolhe "remover prazo"
- **THEN** o front chama o endpoint com `expiraEm` nulo

#### Scenario: Indicador na lista

- **WHEN** a lista mostra uma loja com `trialExpiraEm` no passado
- **THEN** o indicador de prazo dessa linha aparece como vencido/destacado

### Requirement: Tela de acesso bloqueado no painel do cliente

Quando uma chamada `/api/**` autenticada recebe `403` com um `ProblemDetail` de bloqueio (suspensão administrativa ou prazo de teste vencido, identificados pelo `type`/`title`), o painel do cliente SHALL exibir uma tela cheia — identidade SimpleCote, título conforme o motivo, a mensagem do backend e um botão "Sair" — em vez de renderizar o painel com as chamadas falhando. `403` comuns (autorização de papel) e `403` em `/api/auth/**` NÃO SHALL disparar essa tela.

#### Scenario: Loja bloqueada

- **WHEN** um Usuario de uma loja suspensa ou com teste vencido abre o painel e uma chamada `/api/**` volta `403` de bloqueio
- **THEN** ele vê a tela de bloqueio com a mensagem do backend e o botão "Sair", não o painel quebrado

#### Scenario: 403 de autorização não é bloqueio

- **WHEN** um `OPERADOR` acessa uma rota que exige `ADMIN` e recebe `403`
- **THEN** o comportamento segue o de erro de API comum, sem a tela de bloqueio
