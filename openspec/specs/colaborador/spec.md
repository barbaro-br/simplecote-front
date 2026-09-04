# colaborador Specification

## Purpose
Tela pública, sem login, pelo link permanente do colaborador, para um funcionário do Comprador buscar produtos do catálogo e adicioná-los à Cotação em rascunho mais recente da loja.

## Requirements

### Requirement: Tela pública de adição de itens pelo colaborador

O sistema SHALL oferecer `/colaborador/:token` como rota pública (sem login), com tema claro forçado e layout mobile-first, permitindo a um funcionário do Comprador buscar um produto do catálogo e adicioná-lo (com quantidade) à Cotação `RASCUNHO` mais recente da loja. Quando não houver nenhuma Cotação `RASCUNHO` no momento, a tela SHALL exibir uma mensagem clara nesse sentido, sem oferecer o formulário de busca/adição.

#### Scenario: Sem cotação em rascunho

- **WHEN** o colaborador abre `/colaborador/:token` e o Comprador não tem nenhuma Cotação `RASCUNHO`
- **THEN** a tela exibe uma mensagem clara de que não há cotação ativa no momento, sem formulário de adicionar item

#### Scenario: Buscar e adicionar um produto

- **WHEN** o colaborador digita parte do nome (ou código de barras) de um produto do catálogo, seleciona um resultado, informa a quantidade e confirma
- **THEN** o sistema chama a API de adicionar item, mostra uma confirmação temporária e limpa a seleção, pronta para o colaborador adicionar o próximo item sem sair da tela

#### Scenario: Token inválido

- **WHEN** o colaborador abre `/colaborador/:token` com um token que não corresponde a nenhum Comprador
- **THEN** a tela exibe um estado de "link inválido", sem vazar dados

#### Scenario: Erro ao adicionar item é exibido

- **WHEN** a API rejeita a adição do item (ex.: a Cotação deixou de estar em `RASCUNHO` entre a busca e o envio)
- **THEN** a mensagem de erro é exibida na tela, sem perder a seleção do produto e da quantidade já informados
