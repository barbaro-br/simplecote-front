## MODIFIED Requirements

### Requirement: Lista de cotações por status
O sistema SHALL exibir, no painel, a lista de Cotações do Comprador (`GET /api/cotacoes`) com título, status e prazo, permitindo filtrar por status, e um atalho para criar uma nova Cotação. Ao carregar a lista de itens pela primeira vez, as linhas (cards ou linhas de tabela) SHALL aparecer usando uma animação em cascata (staggered animation), revelando os itens um a um.

#### Scenario: Painel lista as cotações com cascata
- **WHEN** o Comprador acessa o painel e os dados carregam
- **THEN** as cotações retornadas pela API aparecem sendo reveladas uma após a outra em um efeito cascata visual

#### Scenario: Atalho para nova cotação
- **WHEN** o Comprador aciona "Nova cotação"
- **THEN** o sistema abre o formulário de criação
