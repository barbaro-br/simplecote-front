## MODIFIED Requirements

### Requirement: Cabeçalho de insights no painel

A tela inicial do admin (`/admin`) SHALL exibir, acima da lista de cotações, uma faixa de cartões com o resumo de `GET /api/analises/dashboard`. A faixa SHALL mostrar um estado de carregamento (esqueleto animado) enquanto o dado não chegou e SHALL desaparecer por completo — sem mensagem de erro e sem bloquear a lista de cotações — se a chamada falhar ou o usuário estiver offline.

Quando o dado chega, a faixa SHALL apresentar:
- a **contagem de cotações por status** (rascunho, aberta, encerrada, apurada, cancelada);
- um bloco **"precisa de ação"** com o número de cotações encerradas sem apurar e o de apuradas sem nenhum pedido enviado; cada número SHALL ser acionável e levar à lista de cotações já filtrada por aquele status;
- a lista de **próximos prazos** (`proximosPrazos`), cada item mostrando o título e o prazo em linguagem relativa ("vence em 2 dias", "venceu ontem" com destaque de atraso) e levando à cotação correspondente ao ser acionado;
- o **gasto do mês corrente** e o do **mês anterior**, com a variação entre eles;
- a **economia estimada** dos últimos 90 dias;
- o **top 5 de produtos** e o **top 5 de empresas** por gasto, cada entrada com nome e valor.

Os valores numéricos de estatísticas (contagens, valores monetários formatados) SHALL animar a sua transição (rolling numbers) desde 0 até o valor final ao serem carregados. Valores monetários e datas SHALL ser formatados em pt-BR.

#### Scenario: Painel com atividade e animação
- **WHEN** o admin abre `/admin` e `GET /api/analises/dashboard` responde com cotações em vários status, itens em "precisa de ação", prazos próximos e gastos
- **THEN** a faixa de cartões aparece e os números absolutos rolam (rolling animation) de zero até os valores finais

#### Scenario: Comprador sem histórico
- **WHEN** `GET /api/analises/dashboard` responde com todas as contagens em zero e as listas vazias
- **THEN** a faixa aparece em estado vazio (zeros e "nada por aqui" nas listas), sem quebrar, e a lista de cotações é exibida normalmente

#### Scenario: Análise indisponível não derruba o painel
- **WHEN** `GET /api/analises/dashboard` responde com erro (por exemplo 500) ou a rede está indisponível
- **THEN** a faixa de cartões não é renderizada, nenhuma mensagem de erro toma a tela, e a lista de cotações continua funcionando

#### Scenario: Atalho de "precisa de ação" filtra a lista
- **WHEN** o admin aciona o número de "encerradas sem apurar" no cabeçalho
- **THEN** a lista de cotações passa a exibir apenas as cotações naquele status
