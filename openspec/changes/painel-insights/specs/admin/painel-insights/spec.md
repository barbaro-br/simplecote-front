## Purpose

Widgets de leitura no painel do admin que trazem para a tela os dados da API de análise do backend (`/api/analises/**`): um cabeçalho de dashboard em `/admin` e cartões de contexto que aparecem ao passar o mouse sobre um produto ou uma empresa dentro de uma cotação. São somente leitura — não alteram nada no backend — e nunca podem quebrar a tela que os hospeda quando a análise falha ou está vazia.

## ADDED Requirements

### Requirement: Cabeçalho de insights no painel

A tela inicial do admin (`/admin`) SHALL exibir, acima da lista de cotações, uma faixa de cartões com o resumo de `GET /api/analises/dashboard`. A faixa SHALL mostrar um estado de carregamento (esqueleto) enquanto o dado não chegou e SHALL desaparecer por completo — sem mensagem de erro e sem bloquear a lista de cotações — se a chamada falhar ou o usuário estiver offline.

Quando o dado chega, a faixa SHALL apresentar:
- a **contagem de cotações por status** (rascunho, aberta, encerrada, apurada, cancelada);
- um bloco **"precisa de ação"** com o número de cotações encerradas sem apurar e o de apuradas sem nenhum pedido enviado; cada número SHALL ser acionável e levar à lista de cotações já filtrada por aquele status;
- a lista de **próximos prazos** (`proximosPrazos`), cada item mostrando o título e o prazo em linguagem relativa ("vence em 2 dias", "venceu ontem" com destaque de atraso) e levando à cotação correspondente ao ser acionado;
- o **gasto do mês corrente** e o do **mês anterior**, com a variação entre eles;
- a **economia estimada** dos últimos 90 dias;
- o **top 5 de produtos** e o **top 5 de empresas** por gasto, cada entrada com nome e valor.

Valores monetários e datas SHALL ser formatados em pt-BR.

#### Scenario: Painel com atividade

- **WHEN** o admin abre `/admin` e `GET /api/analises/dashboard` responde com cotações em vários status, itens em "precisa de ação", prazos próximos e gastos
- **THEN** a faixa de cartões aparece acima da lista com a contagem por status, os números de "precisa de ação", a lista de próximos prazos, o gasto mês a mês com a variação, a economia estimada e os dois top 5

#### Scenario: Comprador sem histórico

- **WHEN** `GET /api/analises/dashboard` responde com todas as contagens em zero e as listas vazias
- **THEN** a faixa aparece em estado vazio (zeros e "nada por aqui" nas listas), sem quebrar, e a lista de cotações é exibida normalmente

#### Scenario: Análise indisponível não derruba o painel

- **WHEN** `GET /api/analises/dashboard` responde com erro (por exemplo 500) ou a rede está indisponível
- **THEN** a faixa de cartões não é renderizada, nenhuma mensagem de erro toma a tela, e a lista de cotações continua funcionando

#### Scenario: Atalho de "precisa de ação" filtra a lista

- **WHEN** o admin aciona o número de "encerradas sem apurar" no cabeçalho
- **THEN** a lista de cotações passa a exibir apenas as cotações naquele status

### Requirement: Insight de compra ao passar sobre um produto

Ao passar o mouse (ou focar) sobre um produto listado numa cotação — tanto nas linhas de itens da cotação quanto no seletor de "adicionar produto" — o sistema SHALL exibir um cartão flutuante com o insight de compra daquele produto, obtido de `GET /api/analises/produtos/insight`. As chamadas para os produtos visíveis SHALL ser agrupadas: o sistema faz **uma** requisição em lote com os ids em vista, e o cartão de cada produto lê desse resultado sem disparar uma requisição por produto.

Quando há histórico, o cartão SHALL mostrar: a última compra (Empresa e Representante, preço unitário, data e quantidade), a variação percentual do preço frente à compra anterior (com indicação visual de alta/baixa, neutra quando não há base de comparação), o menor preço unitário já pago, o preço médio dos últimos 90 dias, o número de compras, o número de fornecedores distintos, e um mini-gráfico da série de preços. O cartão SHALL oferecer um atalho para a cotação de origem da última compra.

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

### Requirement: Insight de relacionamento ao passar sobre uma empresa

Ao passar o mouse (ou focar) sobre o nome de uma Empresa na lista de participantes de uma cotação, o sistema SHALL exibir um cartão com o resumo de relacionamento daquela Empresa, obtido de `GET /api/analises/empresas/{id}/insight`. A requisição SHALL ser feita sob demanda (ao interagir com a Empresa), uma por Empresa.

Quando há dados, o cartão SHALL mostrar: a taxa de resposta (respondeu vs. convidada), o número de itens vencidos, o valor comprado (total e últimos 90 dias), a data e o valor da última compra, quantas vezes foi a mais barata e quantas ficou em segundo lugar, o número de produtos distintos fornecidos, e o tempo médio de resposta em linguagem legível (ex.: "~2 h", "~35 min").

#### Scenario: Empresa com relacionamento

- **WHEN** o admin passa o mouse sobre uma Empresa cujo insight traz convites, respostas, itens vencidos e valor comprado
- **THEN** o cartão mostra a taxa de resposta, os itens vencidos, o valor comprado (total e 90 dias), a última compra, os contadores de "mais barata"/"segundo lugar", os produtos fornecidos e o tempo médio de resposta formatado

#### Scenario: Empresa sem histórico ou não encontrada

- **WHEN** o insight da Empresa vem zerado/nulo, ou a chamada responde 422 (Empresa fora do escopo do comprador), ou responde com outro erro
- **THEN** o cartão mostra "sem dados de relacionamento" e a lista de participantes continua funcionando normalmente
