## Purpose

Melhorar o `AdicionarItemModal` permitindo que o usuário defina a quantidade do produto antes de efetivar a inserção. O salvamento agora ocorre em lote ao finalizar o modal.

## ADDED Requirements

### Requirement: Fluxo de adição em lote (Bulk Add)
O sistema SHALL permitir o preenchimento das quantidades junto com a seleção dos produtos e SHALL salvar apenas ao clicar em Concluir.

#### Scenario: Preencher quantidade do produto
- **GIVEN** que o usuário está buscando produtos no modal
- **WHEN** o usuário marca o checkbox de um produto não adicionado
- **THEN** o produto é marcado visualmente e um campo de "Quantidade" é exibido na mesma linha
- **AND** a quantidade inicial é 1
- **AND** o usuário pode alterar esse número livremente

#### Scenario: Salvar em lote
- **WHEN** o usuário clica em "Concluído" no modal
- **THEN** o modal dispara o salvamento apenas para os produtos que o usuário acabou de marcar, usando a quantidade que ele digitou
- **AND** se o usuário não alterou a quantidade, a quantidade 1 é usada
