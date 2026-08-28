## Purpose

Fornecer ao Comprador a interface administrativa para gerenciamento do seu catálogo de produtos (listagem, criação e inativação).

## ADDED Requirements

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
O sistema SHALL permitir que o usuário inative produtos do catálogo através de um botão rápido na própria listagem.

#### Scenario: Inativar produto
- **WHEN** o usuário clica em "Inativar" na linha de um produto
- **THEN** a inativação é solicitada à API e a lista é recarregada para refletir o estado atual
