# admin/produtos Specification

## Purpose

Gestão do catálogo de produtos pelo Comprador, com suporte a busca automatizada de nomes via Código de Barras (GTIN) para acelerar a criação de cotações.

## Requirements

### Requirement: Listagem do Catálogo
O sistema SHALL listar os produtos cadastrados do Comprador em uma tabela contendo nome, código de barras, embalagem e quantidade por embalagem.

#### Scenario: Visualização do Catálogo
- **WHEN** o usuário acessa a página de produtos
- **THEN** a lista de produtos carregada via API é exibida em formato tabular

### Requirement: Cadastro de Novo Produto
O sistema SHALL permitir o cadastro de um novo produto solicitando nome, código de barras opcional, tipo de embalagem e quantidade por embalagem.

#### Scenario: Cadastro com sucesso
- **WHEN** o usuário preenche o formulário corretamente e salva
- **THEN** o produto é criado via API, o formulário é fechado, e a listagem é atualizada

#### Scenario: Erro de validação local
- **WHEN** o usuário tenta salvar com nome vazio ou quantidade menor que 1
- **THEN** a interface exibe erros locais de validação abaixo dos campos sem enviar a requisição

### Requirement: Inativação de Produto
O sistema SHALL listar os produtos do Comprador incluindo os inativos, exibindo cada linha inativa com aparência apagada (cinza), e SHALL oferecer, por linha, uma ação que **inativa** o produto ativo (`POST /api/produtos/{id}/inativar`) ou **reativa** o produto inativo (`POST /api/produtos/{id}/ativar`), conforme o estado atual. As ações SHALL ser apresentadas como ícones com dica (tooltip) no hover, e a linha inteira sob o cursor SHALL ganhar destaque visual.

#### Scenario: Inativar produto
- **WHEN** o usuário aciona "Inativar" na linha de um produto ativo
- **THEN** a inativação é solicitada à API e a lista recarrega, com o produto passando a aparecer como inativo

#### Scenario: Reativar produto
- **WHEN** o usuário aciona "Ativar" na linha de um produto inativo
- **THEN** a reativação é solicitada à API e a lista recarrega, com o produto de volta ao estado ativo

#### Scenario: Ação depende do estado da linha
- **WHEN** a lista tem produtos ativos e inativos
- **THEN** a linha ativa oferece "Inativar" e a linha inativa oferece "Ativar", nunca as duas

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
