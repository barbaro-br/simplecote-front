## ADDED Requirements

### Requirement: Atualização por pull-to-refresh nas listas
O aplicativo móvel do representante SHALL suportar o gesto de puxar a lista de itens para baixo (pull-to-refresh) para recarregar os dados mais recentes da cotação do servidor.

#### Scenario: Gesto de puxar recarrega
- **WHEN** o representante desliza a lista do topo para baixo
- **THEN** o indicador de carregamento aparece e a tela busca os dados atualizados

### Requirement: Bottom Sheets para menus de ação
O aplicativo do representante SHALL usar painéis que sobem do fundo da tela (Bottom Sheets) para apresentar filtros ou opções secundárias, substituindo os modais centralizados em telas móveis.

#### Scenario: Acionar filtros
- **WHEN** o representante toca no botão de filtro de itens
- **THEN** um Bottom Sheet desliza da base da tela mostrando as opções de filtro
