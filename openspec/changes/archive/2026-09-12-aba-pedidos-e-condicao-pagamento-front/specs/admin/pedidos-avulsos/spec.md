## ADDED Requirements

### Requirement: Condição de pagamento e prazo de entrega do pedido avulso

O sistema SHALL oferecer, na tela de montagem do Pedido avulso, um campo de condição de pagamento — combobox com as condições cadastradas no catálogo (`admin/condicoes-pagamento`), com opção de digitar uma nova descrição ad-hoc que não precisa existir no catálogo — e um campo de texto livre para o prazo de entrega estimado. Os dois campos são opcionais e valem para o pedido inteiro, preenchidos a qualquer momento enquanto o pedido está em construção.

#### Scenario: Escolher condição de pagamento do catálogo

- **WHEN** o lojista abre o combobox de condição de pagamento e escolhe "14/21/28" já cadastrada
- **THEN** o pedido fica associado a essa condição de pagamento

#### Scenario: Digitar condição de pagamento ad-hoc

- **WHEN** o lojista digita "10 dias direto", que não existe no catálogo, e confirma
- **THEN** o pedido é criado com essa descrição, sem exigir cadastro prévio no catálogo

#### Scenario: Prazo de entrega em texto livre

- **WHEN** o lojista digita "3 dias úteis" no campo de prazo de entrega
- **THEN** o pedido fica com esse prazo registrado

#### Scenario: Pedido sem os campos preenchidos

- **WHEN** o lojista monta e fecha um pedido avulso sem preencher condição de pagamento nem prazo de entrega
- **THEN** o pedido é criado e fechado normalmente, sem exigir os dois campos — comportamento idêntico ao de antes desta change
