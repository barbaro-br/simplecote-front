## ADDED Requirements

### Requirement: Condição de pagamento e prazo de entrega da resposta

A tela `/cotacao/:token` SHALL oferecer, numa seção própria (fora dos cards de item — vale pra resposta inteira, não por item), um campo de condição de pagamento — combobox com as opções vindas em `condicoesPagamentoDisponiveis` da API — e um campo de texto livre para o prazo de entrega estimado (ex.: "5 dias úteis"). Os dois campos SHALL vir pré-preenchidos com `condicaoPagamento`/`prazoEntregaEstimado` já salvos, quando existirem. Alterar qualquer um dos dois SHALL disparar `PUT /public/cotacoes/:token/condicoes` com um debounce (mesmo padrão de tempo do autosave de preço), enviando só o campo alterado. Os dois campos SHALL seguir o mesmo indicador `podeEditar` dos itens — desabilitados quando a resposta não pode mais ser editada.

#### Scenario: Escolher condição de pagamento

- **WHEN** o representante escolhe "14/21/28" no campo de condição de pagamento e para de interagir
- **THEN** o sistema chama `PUT /public/cotacoes/:token/condicoes` com essa condição de pagamento

#### Scenario: Digitar prazo de entrega

- **WHEN** o representante digita "5 dias úteis" no campo de prazo de entrega e para de digitar
- **THEN** o sistema chama `PUT /public/cotacoes/:token/condicoes` com esse prazo, sem alterar a condição de pagamento já salva

#### Scenario: Campos pré-preenchidos ao reabrir

- **WHEN** o representante já havia salvo condição de pagamento e prazo de entrega e reabre `/cotacao/:token`
- **THEN** os dois campos aparecem preenchidos com os valores já salvos

#### Scenario: Campos desabilitados quando não pode editar

- **WHEN** a resposta traz `podeEditar` falso
- **THEN** os campos de condição de pagamento e prazo de entrega aparecem desabilitados, assim como os campos de preço

#### Scenario: Campos opcionais não bloqueiam finalizar

- **WHEN** o representante finaliza a resposta sem ter preenchido condição de pagamento nem prazo de entrega
- **THEN** a finalização ocorre normalmente, sem exigir esses dois campos
