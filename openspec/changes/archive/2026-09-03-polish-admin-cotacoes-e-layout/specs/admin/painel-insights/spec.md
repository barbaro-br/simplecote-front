## MODIFIED Requirements

### Requirement: Dashboard como página inicial

A página inicial do admin (`/admin`) SHALL ser o dashboard de monitor, lendo `GET /api/analises/dashboard`. O dashboard SHALL mostrar um estado de carregamento (esqueleto) enquanto o dado não chega, e SHALL exibir um estado vazio orientando a criar a primeira cotação quando o Comprador não tem nenhuma.

Quando o dado chega, o dashboard SHALL apresentar: o hero de economia (`economiaEstimada90d`), o bloco "precisa de ação" (`encerradasSemApurar` e `apuradasSemPedidoEnviado`), a lista de próximos prazos (`proximosPrazos`), os gastos dos dois meses (`gastoMes`/`gastoMesAnterior`), o pipeline de status (`porStatus`) e os top 5 de produtos e empresas em barras. Os itens de "precisa de ação" e os segmentos do pipeline SHALL ser acionáveis e SHALL navegar para a lista de cotações já filtrada (`/admin/cotacoes?status=<STATUS>`).

Os rótulos usados para cada status no pipeline SHALL ser os mesmos rótulos usados nos filtros da lista de Cotações (`/admin/cotacoes`) — em particular, o status `PEDIDOS_GERADOS` SHALL usar o rótulo "Pedidos gerados" em ambos os lugares, não "Apurada".

Valores monetários SHALL ser formatados em pt-BR e algarismos tabulares.

#### Scenario: Dashboard como landing

- **WHEN** o admin abre `/admin`
- **THEN** a página mostra o dashboard de monitor (hero de economia, ação, prazos, gastos, pipeline e top 5), sem a lista de cotações na mesma tela

#### Scenario: Atalho do dashboard leva à lista filtrada

- **WHEN** o admin aciona "encerradas sem apurar" (ou um segmento do pipeline) no dashboard
- **THEN** o sistema navega para `/admin/cotacoes?status=<STATUS>` e a lista aparece filtrada por aquele status

#### Scenario: Dashboard falha ou vazio

- **WHEN** `GET /api/analises/dashboard` responde com erro, ou o Comprador não tem cotações
- **THEN** a página mostra o estado vazio (ou nada, em caso de erro), sem quebrar a navegação

#### Scenario: Rótulo do pipeline bate com o rótulo da lista de Cotações

- **WHEN** o admin vê o segmento `PEDIDOS_GERADOS` no pipeline de status do dashboard
- **THEN** o rótulo exibido é "Pedidos gerados" — o mesmo texto usado na aba de filtro correspondente em `/admin/cotacoes`
