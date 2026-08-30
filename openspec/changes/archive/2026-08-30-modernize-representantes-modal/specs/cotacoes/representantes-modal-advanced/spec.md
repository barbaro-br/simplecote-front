## Purpose

Adiciona busca por texto, filtros de status de envio e ações em lote contextualizadas no modal de convite de representantes, otimizando o fluxo de seleção.

## ADDED Requirements

### Requirement: Busca de representantes
O sistema SHALL permitir buscar representantes ou empresas pelo nome no modal.

#### Scenario: Busca com resultados
- **WHEN** o usuário digita um texto no campo de busca
- **THEN** a lista exibe apenas empresas ou representantes cujos nomes contenham o texto digitado (case-insensitive)

#### Scenario: Busca sem resultados
- **WHEN** o texto digitado não corresponde a nenhuma empresa ou representante
- **THEN** a lista fica vazia e uma mensagem "Nenhuma empresa encontrada." é exibida

### Requirement: Filtros por status de envio
O sistema SHALL permitir filtrar a lista de representantes pelo status do convite quando a cotação não estiver em rascunho.

#### Scenario: Uso dos filtros
- **WHEN** a cotação não for "RASCUNHO"
- **THEN** os filtros "Todos", "Enviado" e "Não enviado" (com contadores) são exibidos
- **AND WHEN** o usuário seleciona um filtro
- **THEN** a lista exibe apenas as empresas correspondentes ao status selecionado, considerando apenas as que estão selecionadas (fazem parte da cotação)

### Requirement: Rodapé dinâmico
O sistema SHALL exibir informações e ações no rodapé do modal de acordo com o status da cotação e dos envios.

#### Scenario: Cotação em rascunho
- **WHEN** a cotação for "RASCUNHO"
- **THEN** o rodapé exibe um ícone de informação com a mensagem indicando que os convites serão disparados ao abrir a cotação

#### Scenario: Cotação aberta com convites pendentes
- **WHEN** a cotação não for rascunho e houver participantes com convite pendente
- **THEN** o rodapé exibe a quantidade de convites não enviados e o botão "Enviar para todos"

#### Scenario: Cotação aberta sem convites pendentes
- **WHEN** a cotação não for rascunho e todos os selecionados possuírem convite "enviado"
- **THEN** o rodapé exibe uma mensagem de sucesso "Todos os convites foram enviados."
