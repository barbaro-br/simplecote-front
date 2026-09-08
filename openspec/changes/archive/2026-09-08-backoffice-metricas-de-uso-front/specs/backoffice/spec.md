## ADDED Requirements

### Requirement: Métricas de uso no detalhe da loja

O detalhe de uma loja no backoffice SHALL mostrar, em destaque, o valor total comprado pela loja, a quantidade de cotações com a distribuição por status, a data da primeira cotação e a da última atividade. SHALL mostrar também uma tabela das cotações da loja (`GET /api/admin/compradores/{id}/cotacoes`) com título, status, quantidade de itens e de participantes, valor comprado e datas. SHALL oferecer um botão que baixa o relatório de uso em CSV (`GET /api/admin/compradores/{id}/relatorio`).

#### Scenario: Cards de uso

- **WHEN** o operador abre o detalhe de uma loja com cotações
- **THEN** vê o valor total comprado formatado como moeda, a contagem de cotações por status, e as datas de primeira cotação e última atividade

#### Scenario: Tabela de cotações

- **WHEN** o detalhe carrega a lista de cotações da loja
- **THEN** cada linha mostra status, itens, participantes e o valor comprado daquela cotação

#### Scenario: Baixar relatório

- **WHEN** o operador clica em "Baixar relatório (CSV)"
- **THEN** o front chama `GET /api/admin/compradores/{id}/relatorio` e o arquivo é baixado

### Requirement: Valor comprado na lista de lojas

A listagem de lojas no backoffice SHALL mostrar uma coluna com o valor total comprado por cada loja, formatado como moeda.

#### Scenario: Coluna "Comprado"

- **WHEN** a lista de lojas é exibida
- **THEN** cada linha mostra o valor total comprado daquela loja
