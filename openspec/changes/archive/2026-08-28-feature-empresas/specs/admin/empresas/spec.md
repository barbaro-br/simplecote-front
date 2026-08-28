## Purpose

Gestão de fornecedores (Empresas) pelo Comprador, mantendo dados cadastrais base para relacionamento em futuras cotações.

## ADDED Requirements

### Requirement: Listagem do Catálogo de Fornecedores
O sistema SHALL exibir uma lista de todas as empresas fornecedoras vinculadas ao Comprador contendo CNPJ, Razão Social, Telefone e Situação (Ativa/Inativa).

#### Scenario: Visualização
- **WHEN** o usuário acessa a página de Empresas
- **THEN** a lista de empresas é carregada do backend e exibida de forma tabular

### Requirement: Cadastro de Empresa
O sistema SHALL permitir o cadastro de um novo fornecedor exigindo um CNPJ válido e Razão Social, além de opções de contato (E-mail, Telefone, WhatsApp). O frontend fará validação local do formato do CNPJ para evitar roundtrips desnecessários de erro. A empresa nasce ativa por padrão.

#### Scenario: Cadastro com sucesso
- **WHEN** o usuário preenche o formulário com dados e CNPJ válidos
- **THEN** a requisição é disparada e a nova empresa passa a figurar na listagem

#### Scenario: Preenchimento de CNPJ inválido
- **WHEN** o usuário digita um CNPJ matematicamente inválido ou sem os 14 dígitos e tenta enviar
- **THEN** o validador do frontend (Zod) bloqueia o formulário e exibe mensagem de erro embaixo do campo de CNPJ

### Requirement: Consulta externa por CNPJ
O sistema SHALL permitir uma busca rápida pelo número do CNPJ (`GET /api/empresas/lookup?cnpj=`), preenchendo automaticamente a Razão Social e Nome Fantasia retornados pelo provedor (ex: Receita Federal).

#### Scenario: Consulta de CNPJ com sucesso
- **WHEN** o usuário digita o CNPJ e clica em buscar
- **THEN** os campos de Razão Social e Nome Fantasia do formulário são preenchidos automaticamente com o retorno da API

### Requirement: Inativação e Reativação de Empresa
O sistema SHALL possuir botões na tabela para alternar o estado do fornecedor (soft delete).

#### Scenario: Inativação (soft delete)
- **WHEN** o usuário clica em Inativar
- **THEN** o status atualiza e a empresa fica marcada visualmente como inativa, bloqueada de novas cotações (regra do backend)
