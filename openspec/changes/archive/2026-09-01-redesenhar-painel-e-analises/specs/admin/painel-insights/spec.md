## MODIFIED Requirements

### Requirement: Cabeçalho de insights no painel

A tela inicial do admin (`/admin`) SHALL exibir, acima da lista de cotações, uma faixa de "monitor" com o resumo de `GET /api/analises/dashboard`. A faixa SHALL mostrar um estado de carregamento (esqueleto) enquanto o dado não chegou e SHALL desaparecer por completo — sem mensagem de erro e sem bloquear a lista de cotações — se a chamada falhar ou o usuário estiver offline.

Quando o dado chega, a faixa SHALL apresentar, lendo os campos reais do `DashboardDTO`:
- um **hero de economia**: a economia estimada dos últimos 90 dias (`economiaEstimada90d`) em destaque, como número principal do monitor;
- um bloco **"precisa de ação"** com o número de cotações encerradas sem apurar (`encerradasSemApurar`) e o de apuradas sem nenhum pedido enviado (`apuradasSemPedidoEnviado`); cada número SHALL ser acionável e levar à lista de cotações já filtrada por aquele status;
- a lista de **próximos prazos** (`proximosPrazos`, cada item com `cotacaoId`, `titulo` e `fechaEm`), mostrando o título e o prazo em linguagem relativa ("vence em 2 dias", "venceu ontem" com destaque de atraso) e levando à cotação correspondente ao ser acionado;
- o **gasto do mês corrente** (`gastoMes`) e o do **mês anterior** (`gastoMesAnterior`), sem variação percentual calculada no front (o backend não a fornece);
- um **pipeline de status** com a contagem por status (`porStatus.rascunho`, `aberta`, `encerrada`, `apurada`, `cancelada`) em barra segmentada com rótulos pt-BR (Rascunho, Aberta, Encerrada, Apurada, Cancelada);
- o **top 5 de produtos** (`topProdutos`) e o **top 5 de empresas** (`topEmpresas`) por gasto, cada entrada com nome e valor (`valor` numérico), exibidos em barras proporcionais.

Valores monetários SHALL ser formatados em pt-BR e algarismos tabulares. Quando o comprador não tem nenhuma cotação (tudo zero e listas vazias), a faixa SHALL exibir um estado vazio que orienta a criar a primeira cotação, sem quebrar a lista.

#### Scenario: Painel com atividade

- **WHEN** o admin abre `/admin` e `GET /api/analises/dashboard` responde com cotações em vários status, itens em "precisa de ação", prazos próximos, gastos e tops
- **THEN** o monitor aparece com o hero de economia, o bloco de "precisa de ação", a lista de próximos prazos, os gastos dos dois meses, o pipeline de status e os dois top 5 em barras

#### Scenario: Comprador sem histórico

- **WHEN** `GET /api/analises/dashboard` responde com todas as contagens em zero e as listas vazias
- **THEN** o monitor mostra um estado vazio orientando a criar a primeira cotação, sem quebrar, e a lista de cotações é exibida normalmente

#### Scenario: Análise indisponível não derruba o painel

- **WHEN** `GET /api/analises/dashboard` responde com erro (por exemplo 500) ou a rede está indisponível
- **THEN** o monitor não é renderizado, nenhuma mensagem de erro toma a tela, e a lista de cotações continua funcionando

#### Scenario: Atalho de "precisa de ação" filtra a lista

- **WHEN** o admin aciona o número de "encerradas sem apurar" ou "apuradas sem pedido enviado" no monitor
- **THEN** a lista de cotações passa a exibir apenas as cotações naquele status

#### Scenario: Valores monetários formatados e alinhados

- **WHEN** o monitor exibe economia, gastos e valores dos top 5
- **THEN** todos os valores aparecem em pt-BR (`R$`) com algarismos tabulares alinhados à direita
