## MODIFIED Requirements

### Requirement: Lista de cotações por status

O sistema SHALL exibir, em `/admin/cotacoes`, a lista de Cotações do Comprador (`GET /api/cotacoes`) com título, status e prazo, e um atalho para criar uma nova Cotação. O filtro por status SHALL ser refletido na URL como parâmetro `status` (`/admin/cotacoes?status=ENCERRADA`), de modo que a lista possa ser acessada já filtrada a partir de um link (ex.: os atalhos do dashboard). Um `status` ausente ou inválido SHALL exibir todas as cotações. A busca por título SHALL permanecer local (estado da página, sem ir para a URL).

#### Scenario: Painel lista as cotações

- **WHEN** o admin acessa `/admin/cotacoes`
- **THEN** as cotações retornadas pela API aparecem com seu status, e o usuário pode filtrar a lista por um status específico

#### Scenario: Filtro refletido na URL

- **WHEN** o admin seleciona o filtro "Encerrada" (ou chega por um link com `?status=ENCERRADA`)
- **THEN** a URL passa a conter `?status=ENCERRADA` e a lista exibe apenas as cotações encerradas

#### Scenario: Status ausente ou inválido

- **WHEN** a URL não traz `status`, ou traz um valor que não corresponde a um `StatusCotacao`
- **THEN** a lista exibe todas as cotações (comportamento de "Todos")

#### Scenario: Atalho para nova cotação

- **WHEN** o Comprador aciona "Nova cotação"
- **THEN** o sistema abre o formulário de criação
