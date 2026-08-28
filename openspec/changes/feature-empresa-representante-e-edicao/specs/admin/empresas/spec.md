## MODIFIED Requirements

### Requirement: Cadastro de Empresa
O sistema SHALL permitir o cadastro de um novo fornecedor exigindo apenas o Nome (Identidade Comercial), além de permitir no mesmo fluxo os dados do Representante Comercial primário (E-mail, Telefone, WhatsApp). O frontend orquestrará a criação da Empresa e em seguida a vinculação do Representante. A empresa nasce ativa por padrão.

#### Scenario: Cadastro com sucesso
- **WHEN** o usuário preenche o formulário com o nome da empresa e os dados do representante
- **THEN** o sistema orquestra as requisições sequencialmente e a nova empresa passa a figurar na listagem

#### Scenario: Preenchimento inválido
- **WHEN** o usuário tenta salvar sem informar o Nome da empresa ou o Nome/Email do Representante
- **THEN** o validador bloqueia o envio e exibe mensagens de erro nos respectivos campos

## ADDED Requirements

### Requirement: Atualização de Empresa
O sistema SHALL permitir ao Comprador atualizar o Nome de uma Empresa existente, mantendo seu identificador.

#### Scenario: Atualizar com sucesso
- **WHEN** o usuário clica em "Editar" numa empresa da lista e altera seu nome no formulário
- **THEN** as alterações são salvas e a listagem atualizada reflete o novo nome

## REMOVED Requirements

### Requirement: Consulta externa por CNPJ
**Reason**: O backend de Empresas não gerencia CNPJ nem dados de Receita Federal, ele trata apenas do Nome fantasia (identidade comercial).
**Migration**: O fluxo de busca foi removido da UI para espelhar a estrutura do backend.
