## MODIFIED Requirements

### Requirement: Criar e duplicar Cotação

O sistema SHALL permitir criar uma Cotação informando o título (`POST /api/cotacoes`,
nasce em `RASCUNHO`) e, opcionalmente, uma condição de pagamento preferencial (do
catálogo de `admin/condicoes-pagamento`), e SHALL permitir duplicar uma Cotação
existente (`POST /api/cotacoes/{id}/duplicar`, retorna a nova Cotação e a lista de
itens omitidos).

A ação **"Duplicar"** SHALL estar disponível **só** a partir do formulário de Nova
Cotação (modo "Duplicar existente") — não na lista de Cotações nem na tela de
detalhe de uma Cotação. O formulário de Nova Cotação SHALL apresentar os dois modos
("Em branco" e "Duplicar existente") como uma escolha única dentro de um só
formulário — não dois cards separados por um divisor — mostrando apenas o campo
relevante ao modo selecionado (Título e condição de pagamento preferencial para
"Em branco"; seleção de cotação de origem para "Duplicar existente"), com um único
controle de submit cujo rótulo e ação acompanham o modo escolhido. A seleção da
cotação de origem SHALL usar um combobox com busca (filtra a lista pelo título
digitado), não um `<select>` nativo do navegador. Ao ser acionada, o sistema SHALL
chamar `POST /api/cotacoes/{id}/duplicar` e, no sucesso, navegar para o detalhe da
Cotação recém-criada (que nasce em `RASCUNHO`).

Enquanto a chamada de duplicação está em andamento, o controle acionado SHALL indicar
o progresso ("Duplicando…") e ficar desabilitado, impedindo disparo duplicado.

Quando a resposta traz itens omitidos (`omitidos`, cada um com nome e motivo — ex.:
Produto inativado), a tela da Cotação nova SHALL exibir um aviso **não-bloqueante**
listando cada item omitido com seu motivo. Quando `omitidos` é vazio, nenhum aviso
SHALL ser exibido. Quando a duplicação falha, o sistema SHALL exibir a mensagem
`ProblemDetail` do backend no ponto de origem da ação e **não** navegar.

#### Scenario: Criação com sucesso
- **WHEN** o Comprador informa um título válido e confirma
- **THEN** a Cotação é criada em `RASCUNHO` e o sistema navega para o detalhe dela

#### Scenario: Título vazio é bloqueado localmente
- **WHEN** o Comprador tenta criar sem título
- **THEN** o formulário exibe erro de validação e não envia a requisição

#### Scenario: Duplicar cotação anterior
- **WHEN** o Comprador escolhe duplicar uma Cotação existente
- **THEN** uma nova Cotação em `RASCUNHO` é criada a partir dela e o sistema abre seu detalhe

#### Scenario: Formulário de Nova Cotação alterna entre os dois modos num único card

- **WHEN** o Comprador abre "Nova Cotação" e alterna entre "Em branco" e "Duplicar existente"
- **THEN** o campo relevante ao modo muda (Título e condição de pagamento preferencial, ou a seleção de cotação de origem), dentro do mesmo card, sem navegar pra outra tela nem exibir os dois formulários simultaneamente

#### Scenario: Duplicar a partir da lista e do detalhe

- **WHEN** o Comprador vê uma linha da lista de Cotações, ou está na tela de detalhe de uma Cotação
- **THEN** nenhum controle de "Duplicar" é exibido em nenhum dos dois lugares — a única forma de duplicar é pelo formulário de Nova Cotação (isso substitui o comportamento anterior, em que "Duplicar" também estava disponível nesses dois pontos)

#### Scenario: Itens omitidos são avisados sem bloquear
- **WHEN** a duplicação retorna com sucesso e a lista `omitidos` tem um ou mais itens
- **THEN** a tela da Cotação nova mostra um aviso não-bloqueante com o nome e o motivo de cada item omitido, e o Comprador segue podendo trabalhar na Cotação

#### Scenario: Duplicação sem itens omitidos
- **WHEN** a duplicação retorna com sucesso e `omitidos` é vazio
- **THEN** a tela da Cotação nova não exibe nenhum aviso de itens omitidos

#### Scenario: Falha na duplicação
- **WHEN** a API rejeita a duplicação (`ProblemDetail`)
- **THEN** a mensagem do backend é exibida no ponto de origem da ação e o sistema não navega

#### Scenario: Duplicação em andamento trava o controle
- **WHEN** o Comprador aciona "Duplicar" e a resposta ainda não chegou
- **THEN** o controle mostra "Duplicando…" e fica desabilitado até a resposta

#### Scenario: Buscar a cotação de origem pelo título

- **WHEN** o Comprador abre o combobox de "Cotação de origem" e digita parte do título de uma cotação anterior
- **THEN** a lista mostra só as cotações cujo título contém o texto digitado, e selecionar uma delas preenche `origemId` como antes

#### Scenario: Criar com condição de pagamento preferencial

- **WHEN** o Comprador, no modo "Em branco", escolhe "14/21/28" no campo de condição de pagamento preferencial e confirma
- **THEN** a Cotação é criada com essa condição de pagamento preferencial associada

#### Scenario: Criar sem condição de pagamento preferencial

- **WHEN** o Comprador cria uma Cotação sem escolher condição de pagamento preferencial
- **THEN** a Cotação é criada normalmente, sem nenhuma condição associada — comportamento idêntico ao de antes desta change

### Requirement: Resultado da apuração e pedidos
O sistema SHALL exibir o resultado de uma Cotação apurada (`GET /api/cotacoes/{id}/resultado`): vencedor por item identificado pelo **nome da Empresa** (não do representante), preço da embalagem e preço unitário derivado que já vêm prontos da API. SHALL listar os pedidos gerados (`GET /api/cotacoes/{id}/pedidos`), permitir enviar um pedido (`POST /api/pedidos/{id}/enviar`), baixar o resultado em XLSX (`GET /api/cotacoes/{id}/resultado.xlsx`) e baixar o PDF de um pedido (`GET /api/pedidos/{id}.pdf`). Quando a API indicar que um item foi `decididoPorDesempate`, a tela SHALL exibir um indicador visual junto ao preço desse item, sem recalcular ou inferir o empate.

A lista de pedidos e o vencedor por item SHALL ser apresentados numa única lista de pedidos (não duas tabelas separadas). Cada linha de pedido (Empresa, status, total, condição de pagamento, prazo de entrega, ações) SHALL ter um controle de expandir/recolher; ao expandir, os itens vencidos daquele pedido (produto, **quantidade comprada**, preço da embalagem, preço unitário — com o indicador de empate quando aplicável — e subtotal) SHALL aparecer inline, abaixo da linha do pedido, sem navegar para outra tela. A quantidade comprada SHALL vir pronta da API (`quantidade` do item do pedido) — o front não recalcula. A condição de pagamento e o prazo de entrega SHALL vir prontos da API (`condicaoPagamento`/`prazoEntregaEstimado` do pedido) e SHALL exibir "—" quando ausentes, sem o front inferir ou calcular nada. Itens sem vencedor (sem lance algum, portanto sem pedido associado) SHALL continuar sendo listados à parte, abaixo da lista de pedidos.

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
- **THEN** os itens vencidos daquele pedido aparecem inline, abaixo da linha, com produto, quantidade comprada, preço da embalagem, preço unitário (com indicador de empate quando aplicável) e subtotal — sem navegar para outra tela

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

#### Scenario: Linha do pedido mostra condição de pagamento e prazo de entrega

- **WHEN** o resultado traz um pedido com `condicaoPagamento` "14/21/28" e `prazoEntregaEstimado` "5 dias úteis"
- **THEN** a linha do pedido (mesmo recolhida) mostra os dois valores

#### Scenario: Pedido sem condição de pagamento ou prazo mostra traço

- **WHEN** um pedido do resultado vem com `condicaoPagamento`/`prazoEntregaEstimado` nulos
- **THEN** a linha mostra "—" nesses campos, sem erro
