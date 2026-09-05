## MODIFIED Requirements

### Requirement: Insight de compra ao passar sobre um produto

Ao passar o mouse (ou focar) sobre um produto listado numa cotação — tanto nas linhas de itens da cotação quanto no seletor de "adicionar produto" — o sistema SHALL exibir um cartão flutuante com o insight de compra daquele produto, obtido de `GET /api/analises/produtos/insight`. As chamadas para os produtos visíveis SHALL ser agrupadas: o sistema faz **uma** requisição em lote com os ids em vista, e o cartão de cada produto lê desse resultado sem disparar uma requisição por produto.

A validação da resposta SHALL espelhar o contrato real da API (dinheiro como **número**, não string): cada item do mapa SHALL ter `ultimaCompra` (nula quando nunca comprado; senão objeto com `empresa`, `representante`, `precoUnitario` numérico, `data`, `quantidade` e `cotacaoId`), `variacaoPct` numérico ou nulo, `menorPrecoUnitario` numérico ou nulo, `precoMedioUnitario90d` numérico ou nulo, `compras` e `fornecedoresDistintos` numéricos, e `serie` como lista de pontos `{data, precoUnitario}`. Divergência entre esse contrato e a resposta SHALL falhar de forma visível nos testes de contrato, nunca silenciosamente em runtime.

Quando há histórico, o cartão SHALL mostrar: a última compra (Empresa e Representante, preço unitário, data e quantidade), a variação percentual do preço frente à compra anterior (com indicação visual de alta/baixa, neutra quando não há base de comparação), o menor preço unitário já pago, o preço médio dos últimos 90 dias, o número de compras, o número de fornecedores distintos, e um mini-gráfico da série de preços (desenhado a partir de `precoUnitario` de cada ponto). O cartão SHALL oferecer um atalho para a cotação de origem da última compra.

#### Scenario: Produto com histórico

- **WHEN** o admin passa o mouse sobre um produto cujo insight traz `ultimaCompra` preenchida e série com pontos
- **THEN** o cartão mostra a última compra (Empresa, Representante, preço unitário, data, quantidade), a variação de preço com o sentido correto, o menor preço, a média 90 dias, as contagens de compras e fornecedores, o mini-gráfico da série, e um atalho para a cotação de origem

#### Scenario: Produto do comprador sem compra

- **WHEN** o insight do produto vem com `ultimaCompra` nula e agregados nulos/zerados
- **THEN** o cartão mostra "sem histórico de compra", sem gráfico e sem atalho, e não exibe valores inventados

#### Scenario: Uma requisição para a lista visível

- **WHEN** a tela renderiza vários produtos ao mesmo tempo
- **THEN** o sistema faz uma única requisição a `GET /api/analises/produtos/insight` com os ids visíveis, e passar o mouse sobre cada produto não gera requisição adicional

#### Scenario: Falha do insight não trava a linha do produto

- **WHEN** `GET /api/analises/produtos/insight` responde com erro
- **THEN** o produto continua listado e utilizável (editar item, adicionar à cotação); o cartão apenas informa que o insight está indisponível

#### Scenario: Resposta real do backend valida e renderiza dados

- **WHEN** a API responde um insight com dinheiro em número (ex.: `menorPrecoUnitario: 12.5`) e `serie` como pontos `{data, precoUnitario}`
- **THEN** a validação aceita a resposta e o cartão exibe os valores formatados (sem cair no estado "sem compra anterior" por erro de validação)
