## MODIFIED Requirements

### Requirement: Montar itens da Cotação
O sistema SHALL permitir, enquanto a Cotação está em `RASCUNHO`, adicionar itens escolhendo um Produto do catálogo (`POST /api/cotacoes/{id}/itens`) e remover itens (`DELETE /api/cotacoes/{id}/itens/{itemId}`). Fora de `RASCUNHO` a edição de itens SHALL ficar indisponível. Quando o Produto desejado ainda não existe no catálogo, o sistema SHALL permitir cadastrá-lo **sem sair da tela de montagem da Cotação** e usá-lo imediatamente no item.

#### Scenario: Adicionar e remover item em rascunho
- **WHEN** a Cotação está em `RASCUNHO` e o Comprador adiciona um Produto e depois remove um item
- **THEN** a lista de itens reflete cada operação após a resposta da API

#### Scenario: Edição de itens travada fora de rascunho
- **WHEN** a Cotação está `ABERTA`, `ENCERRADA`, `PEDIDOS_GERADOS` ou `CANCELADA`
- **THEN** os controles de adicionar/remover item não são exibidos ou ficam desabilitados

#### Scenario: Cadastrar Produto novo sem sair da montagem
- **WHEN** ao adicionar um item o Comprador percebe que o Produto não está no catálogo e aciona "Cadastrar novo produto"
- **THEN** o formulário de Produto abre sobre a mesma tela (modal), e ao salvar com sucesso o novo Produto passa a existir no catálogo e fica pré-selecionado para o item, sem que o Comprador tenha navegado para fora do detalhe da Cotação
