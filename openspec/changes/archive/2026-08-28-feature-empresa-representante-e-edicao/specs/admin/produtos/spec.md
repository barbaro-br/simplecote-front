## Purpose

Gestão do catálogo de produtos pelo Comprador, com suporte a busca automatizada de nomes via Código de Barras (GTIN) para acelerar a criação de cotações.

## ADDED Requirements

### Requirement: Consulta externa por Código de Barras (GTIN)
O sistema SHALL permitir uma busca do nome do Produto via API (`GET /api/produtos/lookup?gtin=`) para preencher o formulário automaticamente a partir de provedores externos.

#### Scenario: Consulta com sucesso
- **WHEN** o usuário digita o código de barras e clica em buscar
- **THEN** o nome do produto retornado pelo provedor é preenchido no formulário

#### Scenario: Produto não encontrado
- **WHEN** a busca do código de barras não encontra correspondência
- **THEN** o sistema falha silenciosamente (degrada graciosamente) sem travar o cadastro manual

### Requirement: Atualização de Produto
O sistema SHALL permitir a edição dos dados cadastrais (nome, código de barras, embalagem, quantidade por embalagem) de um Produto existente no catálogo (`PUT /api/produtos/{id}`).

#### Scenario: Edição bem-sucedida
- **WHEN** o usuário clica em "Editar" um produto e altera sua embalagem
- **THEN** as alterações são salvas e a listagem exibe a nova configuração do produto
