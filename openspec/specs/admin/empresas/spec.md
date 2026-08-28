# admin/empresas Specification

## Purpose

Gestão de fornecedores (Empresas) pelo Comprador, mantendo dados cadastrais base para relacionamento em futuras cotações.

## Requirements

### Requirement: Listagem do Catálogo de Fornecedores
O sistema SHALL exibir uma lista de todas as empresas fornecedoras vinculadas ao Comprador contendo CNPJ, Razão Social, Telefone e Situação (Ativa/Inativa).

#### Scenario: Visualização
- **WHEN** o usuário acessa a página de Empresas
- **THEN** a lista de empresas é carregada do backend e exibida de forma tabular

### Requirement: Cadastro de Empresa
O sistema SHALL permitir o cadastro de um novo fornecedor exigindo apenas o Nome (Identidade Comercial), além de permitir no mesmo fluxo os dados do Representante Comercial primário (E-mail, Telefone, WhatsApp). O frontend orquestrará a criação da Empresa e em seguida a vinculação do Representante. A empresa nasce ativa por padrão.

#### Scenario: Cadastro com sucesso
- **WHEN** o usuário preenche o formulário com o nome da empresa e os dados do representante
- **THEN** o sistema orquestra as requisições sequencialmente e a nova empresa passa a figurar na listagem

#### Scenario: Preenchimento inválido
- **WHEN** o usuário tenta salvar sem informar o Nome da empresa ou o Nome/Email do Representante
- **THEN** o validador bloqueia o envio e exibe mensagens de erro nos respectivos campos

### Requirement: Inativação e Reativação de Empresa
O sistema SHALL possuir botões na tabela para alternar o estado do fornecedor (soft delete).

#### Scenario: Inativação (soft delete)
- **WHEN** o usuário clica em Inativar
- **THEN** o status atualiza e a empresa fica marcada visualmente como inativa, bloqueada de novas cotações (regra do backend)

### Requirement: Atualização de Empresa
O sistema SHALL permitir ao Comprador atualizar o Nome de uma Empresa existente, mantendo seu identificador.

#### Scenario: Atualizar com sucesso
- **WHEN** o usuário clica em "Editar" numa empresa da lista e altera seu nome no formulário
- **THEN** as alterações são salvas e a listagem atualizada reflete o novo nome
