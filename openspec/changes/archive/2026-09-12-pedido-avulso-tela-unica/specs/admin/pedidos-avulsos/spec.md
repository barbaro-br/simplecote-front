## ADDED Requirements

### Requirement: Empresa e Representante do pedido avulso

O sistema SHALL oferecer, no cabeçalho da tela de montagem, um campo de Empresa — combobox com as Empresas do catálogo de fornecedores (`admin/empresas`) — obrigatório antes do primeiro item poder ser confirmado. Ao escolher a Empresa, o sistema SHALL exibir o nome do Representante dela como texto somente leitura (não é um campo pra escolher) — a lógica de qual Representante pertence à Empresa é sempre resolvida pelo backend, o front só exibe o que a API devolve.

#### Scenario: Escolher Empresa mostra o Representante dela

- **WHEN** o lojista escolhe a Empresa "Distribuidora Aurora" no combobox
- **THEN** o nome do Representante dela aparece ao lado, como texto — sem o lojista precisar escolher nada a mais

#### Scenario: Empresa é obrigatória pra confirmar o primeiro item

- **WHEN** o lojista tenta confirmar o primeiro item sem ter escolhido uma Empresa
- **THEN** o botão "Adicionar item" fica desabilitado, com uma indicação de que falta escolher a Empresa

## MODIFIED Requirements

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
