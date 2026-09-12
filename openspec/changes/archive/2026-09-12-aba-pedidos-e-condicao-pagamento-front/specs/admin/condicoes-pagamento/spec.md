## Purpose

Catálogo de condições de pagamento (ex.: "14/21/28") mantido pelo Comprador, oferecido como opção consistente na criação de Cotação, na resposta do Representante e no Pedido avulso — mesmo padrão de `admin/empresas`.

## ADDED Requirements

### Requirement: Cadastro de Condição de Pagamento

O sistema SHALL permitir ao Comprador cadastrar uma Condição de Pagamento informando uma descrição (ex.: "14/21/28"), via `POST /api/condicoes-pagamento`. A condição nasce ativa.

#### Scenario: Cadastro com sucesso

- **WHEN** o usuário preenche "14/21/28" e salva
- **THEN** a condição é criada e passa a figurar na listagem

#### Scenario: Descrição vazia é bloqueada

- **WHEN** o usuário tenta salvar sem preencher a descrição
- **THEN** o formulário bloqueia o envio e exibe erro de validação

### Requirement: Listagem e Inativação/Reativação de Condição de Pagamento

O sistema SHALL listar as Condições de Pagamento do Comprador (`GET /api/condicoes-pagamento?incluirInativos=true`), exibindo as inativas com aparência apagada, e SHALL oferecer, por linha, a ação de inativar (`POST /api/condicoes-pagamento/{id}/inativar`) ou reativar (`POST /api/condicoes-pagamento/{id}/ativar`), conforme o estado atual.

#### Scenario: Visualização

- **WHEN** o usuário acessa a página de Condições de Pagamento
- **THEN** a lista é carregada do backend, com as inativas em aparência apagada

#### Scenario: Inativação

- **WHEN** o usuário aciona "Inativar" numa condição ativa
- **THEN** a API é chamada e a condição passa a aparecer com aparência de inativa

#### Scenario: Reativação

- **WHEN** o usuário aciona "Ativar" numa condição inativa
- **THEN** a API é chamada e a condição volta ao estado ativo
