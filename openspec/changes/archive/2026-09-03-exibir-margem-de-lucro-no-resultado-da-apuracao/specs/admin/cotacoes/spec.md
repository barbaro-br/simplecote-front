## MODIFIED Requirements

### Requirement: Resultado da apuração e pedidos
O sistema SHALL exibir o resultado de uma Cotação apurada (`GET /api/cotacoes/{id}/resultado`): vencedor por item identificado pelo **nome da Empresa** (não do representante), preço da embalagem e preço unitário derivado que já vêm prontos da API. SHALL listar os pedidos gerados (`GET /api/cotacoes/{id}/pedidos`), permitir enviar um pedido (`POST /api/pedidos/{id}/enviar`), baixar o resultado em XLSX (`GET /api/cotacoes/{id}/resultado.xlsx`) e baixar o PDF de um pedido (`GET /api/pedidos/{id}.pdf`). Quando a API indicar que um item foi `decididoPorDesempate`, a tela SHALL exibir um indicador visual junto ao preço desse item, sem recalcular ou inferir o empate.

A lista de pedidos e o vencedor por item SHALL ser apresentados numa única lista de pedidos (não duas tabelas separadas). Cada linha de pedido (Empresa, status, total, ações) SHALL ter um controle de expandir/recolher; ao expandir, os itens vencidos daquele pedido (produto, preço da embalagem, preço unitário — com o indicador de empate quando aplicável — e subtotal) SHALL aparecer inline, abaixo da linha do pedido, sem navegar para outra tela. Itens sem vencedor (sem lance algum, portanto sem pedido associado) SHALL continuar sendo listados à parte, abaixo da lista de pedidos.

A tela SHALL oferecer um campo de **margem de lucro (%)** global, acima da lista de pedidos. Quando preenchido, cada item exibido nas linhas expandidas SHALL mostrar, além do preço de custo já existente, um **preço de venda sugerido** (`preço de custo × (1 + margem / 100)`), calculado inteiramente no front a partir do preço de custo já apurado pela API — sem alterar, recalcular ou substituir o preço de custo, o vencedor ou qualquer outro dado da apuração. Cada item SHALL permitir sobrescrever a margem global com uma margem própria; um item com margem própria SHALL manter seu valor mesmo que a margem global mude depois. A margem (global e por item) SHALL ser efêmera — mantida só no estado da tela, sem ser persistida no backend, sem ser enviada em nenhuma chamada de API, e sem aparecer no XLSX/PDF exportados (que continuam vindo prontos do backend). A interface SHALL deixar claro que o preço de venda é uma sugestão/prévia, não o preço de custo real do pedido.

#### Scenario: Ver resultado com vencedores por empresa
- **WHEN** o Comprador abre o resultado de uma Cotação `PEDIDOS_GERADOS`
- **THEN** cada item mostra o nome da Empresa vencedora e os preços já calculados pelo backend, sem o front recalcular nada

#### Scenario: Enviar um pedido
- **WHEN** o Comprador aciona "Enviar" num pedido da lista
- **THEN** o sistema chama `POST /api/pedidos/{id}/enviar` e o status do pedido na tela é atualizado

#### Scenario: Baixar exportações
- **WHEN** o Comprador aciona "Baixar XLSX" no resultado ou "Baixar PDF" num pedido
- **THEN** o arquivo binário retornado pela API é entregue ao navegador para download

#### Scenario: Item decidido por empate mostra indicador
- **WHEN** um item do resultado vem da API com `decididoPorDesempate: true`
- **THEN** o preço desse item exibe um indicador visual (badge) com um texto explicando que o preço empatou com outro concorrente e foi decidido por critério de desempate

#### Scenario: Item sem empate não mostra indicador
- **WHEN** um item do resultado vem com `decididoPorDesempate: false` (ou o campo ausente)
- **THEN** nenhum indicador de empate é exibido para esse item

#### Scenario: Expandir um pedido mostra seus itens vencidos

- **WHEN** o Comprador aciona o controle de expandir na linha de um pedido
- **THEN** os itens vencidos daquele pedido aparecem inline, abaixo da linha, com produto, preço da embalagem, preço unitário (com indicador de empate quando aplicável) e subtotal — sem navegar para outra tela

#### Scenario: Recolher volta a esconder os itens

- **WHEN** o Comprador aciona o controle de recolher numa linha de pedido já expandida
- **THEN** os itens daquele pedido deixam de ser exibidos, voltando ao estado compacto

#### Scenario: Itens sem vencedor continuam visíveis fora da lista de pedidos

- **WHEN** a apuração tem um ou mais itens sem nenhum lance vencedor
- **THEN** esses itens aparecem listados abaixo da lista de pedidos, independente de qualquer pedido estar expandido ou não

#### Scenario: Margem global aplica a todos os itens

- **WHEN** o Comprador preenche o campo de margem de lucro global com "30" e expande um pedido
- **THEN** cada item daquele pedido mostra um preço de venda sugerido igual ao preço de custo do item multiplicado por 1,30

#### Scenario: Margem por item sobrescreve a global

- **WHEN** o Comprador já preencheu uma margem global e edita a margem de um item específico para um valor diferente
- **THEN** o preço de venda sugerido daquele item usa a margem própria dele, e os demais itens continuam usando a margem global

#### Scenario: Margem por item não é afetada por mudanças na margem global depois de customizada

- **WHEN** um item já tem margem própria definida e o Comprador muda o valor do campo de margem global
- **THEN** o preço de venda sugerido do item customizado não muda; só os itens que nunca tiveram margem própria acompanham a nova margem global

#### Scenario: Sem margem preenchida, nenhum preço de venda é exibido

- **WHEN** o Comprador não preenche nenhuma margem (nem global, nem de item específico)
- **THEN** a coluna de preço de venda sugerido mostra "—", sem afetar as demais colunas já existentes

#### Scenario: Margem não é persistida nem enviada ao backend

- **WHEN** o Comprador preenche uma margem, envia um pedido ou baixa o XLSX/PDF, e depois recarrega a página do Resultado
- **THEN** nenhuma chamada de API (envio de pedido, exportação) inclui a margem ou o preço de venda sugerido, e ao recarregar a página o campo de margem volta a ficar vazio
