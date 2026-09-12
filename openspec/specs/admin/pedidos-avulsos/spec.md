# admin/pedidos-avulsos Specification

## Purpose
Tela do admin onde o lojista monta um Pedido avulso — uma venda fechada por telefone com um Representante, fora do fluxo de Cotação — item a item, em tempo real durante a ligação.

## Requirements

### Requirement: Busca de produto reaproveita a sugestão de cadastro

Ao adicionar um item ao Pedido avulso, o sistema SHALL oferecer a mesma busca de produto (por nome ou por sufixo de código de barras, com scroll infinito no catálogo global) já usada na tela de cadastro de produto (`admin/produtos`), sem duplicar lógica de busca — reaproveitando `useSugestoesCadastro`/`useMaisSugestoesDoCatalogoGlobal`.

#### Scenario: Busca por nome encontra o produto

- **WHEN** o lojista digita "biscoito" no campo de busca de item
- **THEN** a lista de sugestões (do catálogo próprio e do catálogo global) aparece, na mesma ordenação por relevância da tela de cadastro de produto

#### Scenario: Busca pelos últimos dígitos do código de barras

- **WHEN** o lojista digita os últimos 4 dígitos do código de barras que o representante informou por telefone
- **THEN** o produto correspondente aparece na lista de sugestões

### Requirement: Item do pedido deriva preço unitário e total da linha

Ao selecionar um produto, o sistema SHALL pedir o preço da embalagem (informado pelo Representante por telefone) e a quantidade de embalagens desejada, e SHALL calcular e exibir o preço unitário (`preço da embalagem ÷ quantidade por embalagem do produto`) e o total da linha (`preço da embalagem × quantidade de embalagens`) antes de confirmar a adição do item.

#### Scenario: Item com embalagem de mais de uma unidade

- **WHEN** o lojista escolhe um produto cuja embalagem tem 30 unidades, informa preço de embalagem 125,00 e quantidade 2
- **THEN** a tela mostra preço unitário 4,17 e total de linha 250,00 antes de confirmar

#### Scenario: Item de unidade única

- **WHEN** o lojista escolhe um produto de embalagem "Unidade" e informa preço 8,90 e quantidade 3
- **THEN** a tela mostra preço unitário igual ao preço informado (8,90) e total de linha 26,70

### Requirement: Lista de itens acumulados e total geral

Cada item confirmado SHALL entrar numa lista visível na tela, com nome do produto, quantidade, preço unitário e total de linha. A tela SHALL manter, sempre visível, a contagem de itens e o total geral (soma dos totais de linha) atualizados a cada item adicionado.

#### Scenario: Total geral acompanha a lista

- **WHEN** o lojista adiciona um segundo item de total de linha 80,00 a um pedido que já tinha um item de 250,00
- **THEN** a tela mostra 2 itens e total geral 330,00

### Requirement: Fechamento do pedido avulso

O sistema SHALL permitir fechar o Pedido avulso em construção, com uma confirmação explícita nomeando o total geral e a contagem de itens. Fechar SHALL tornar o pedido imutável (spec `pedido/avulso`, `simplecote-back`) e SHALL levar o lojista de volta a um estado onde ele vê a confirmação do pedido fechado (id, total, contagem).

#### Scenario: Fechar exige confirmação

- **WHEN** o lojista clica em "Fechar pedido" com 3 itens somando 400,00
- **THEN** a tela pede confirmação nomeando "3 itens, total R$ 400,00" antes de efetivar

#### Scenario: Pedido fechado não aceita mais itens

- **WHEN** o lojista confirma o fechamento
- **THEN** a tela de montagem não aceita mais adicionar item a esse pedido, e mostra a confirmação do pedido fechado

### Requirement: Condição de pagamento e prazo de entrega do pedido avulso

O sistema SHALL oferecer, na tela de montagem do Pedido avulso, um campo de condição de pagamento — combobox com as condições cadastradas no catálogo (`admin/condicoes-pagamento`), com opção de criar uma nova inline que não precisa existir no catálogo antes — e um campo de texto livre para o prazo de entrega estimado. A condição de pagamento SHALL ser obrigatória antes do primeiro item poder ser confirmado; o prazo de entrega continua opcional. Os dois campos, junto da Empresa, só são enviados ao backend no momento em que o primeiro item é confirmado (é quando o Pedido avulso nasce de fato) — depois disso, os campos viram somente leitura (não há como alterá-los, `pedido/avulso` no back).

#### Scenario: Escolher condição de pagamento do catálogo

- **WHEN** o lojista abre o combobox de condição de pagamento e escolhe "14/21/28" já cadastrada
- **THEN** o pedido fica associado a essa condição de pagamento

#### Scenario: Digitar condição de pagamento ad-hoc

- **WHEN** o lojista digita "10 dias direto", que não existe no catálogo, e escolhe a opção de criar
- **THEN** a condição é cadastrada no catálogo e o pedido fica associado a ela

#### Scenario: Prazo de entrega em texto livre

- **WHEN** o lojista digita "3 dias úteis" no campo de prazo de entrega
- **THEN** o pedido fica com esse prazo registrado

#### Scenario: Pedido sem os campos preenchidos

- **WHEN** o lojista confirma o primeiro item com Empresa e condição de pagamento preenchidas, mas sem prazo de entrega
- **THEN** o pedido é criado normalmente, sem exigir o prazo de entrega — esse campo continua opcional (diferente da condição de pagamento, que agora é obrigatória)

#### Scenario: Condição de pagamento é obrigatória pra confirmar o primeiro item

- **WHEN** o lojista tenta confirmar o primeiro item sem ter escolhido nem criado uma condição de pagamento
- **THEN** o botão "Adicionar item" fica desabilitado, com uma indicação de que falta a condição de pagamento

### Requirement: Empresa e Representante do pedido avulso

O sistema SHALL oferecer, no cabeçalho da tela de montagem, um campo de Empresa — combobox com as Empresas do catálogo de fornecedores (`admin/empresas`) — obrigatório antes do primeiro item poder ser confirmado. Ao escolher a Empresa, o sistema SHALL exibir o nome do Representante dela como texto somente leitura (não é um campo pra escolher) — a lógica de qual Representante pertence à Empresa é sempre resolvida pelo backend, o front só exibe o que a API devolve.

#### Scenario: Escolher Empresa mostra o Representante dela

- **WHEN** o lojista escolhe a Empresa "Distribuidora Aurora" no combobox
- **THEN** o nome do Representante dela aparece ao lado, como texto — sem o lojista precisar escolher nada a mais

#### Scenario: Empresa é obrigatória pra confirmar o primeiro item

- **WHEN** o lojista tenta confirmar o primeiro item sem ter escolhido uma Empresa
- **THEN** o botão "Adicionar item" fica desabilitado, com uma indicação de que falta escolher a Empresa
