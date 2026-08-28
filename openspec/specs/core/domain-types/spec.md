# core/domain-types Specification

## Purpose
Mapeia as restrições estritas do backend para o front-end, garantindo que dinheiro, tempo e erros possuam formatação e tradução padronizadas na origem.

## Requirements

### Requirement: Tradução de erros RFC 7807 (ProblemDetail)
O sistema MUST interceptar todas as respostas de erro `4xx/5xx` e traduzi-las do formato `ProblemDetail` (campo `detail` ou mensagens de Bean Validation) para um `ApiError` cujas mensagens estarão prontas para exibição na UI.

#### Scenario: Erro de Bean Validation
- **WHEN** a API retorna um erro de validação com campos preenchidos incorretamente
- **THEN** o utilitário constrói mensagens de erro em português para os componentes de formulário usarem

### Requirement: Formatação de dados sensíveis (Data e Dinheiro)
O sistema SHALL formatar centralmente tipos base antes da renderização: números financeiros usando padrão local (BRL) e datas ISO-8601 UTC convertidas para `America/Sao_Paulo`.

#### Scenario: Formatação de Preço
- **WHEN** o sistema recebe `128.5` como valor de lance
- **THEN** o formatador central retorna a string `"R$ 128,50"`

#### Scenario: Formatação de Data
- **WHEN** a API envia o prazo `"2026-08-28T18:00:00Z"`
- **THEN** o formatador apresenta o valor traduzido para o timezone do Brasil de acordo com o padrão `pt-BR`

### Requirement: Union types de status espelham os enums do backend
Os `status` de Cotação, Participante, Lance e Pedido chegam da API como string. O front SHALL definir, para cada um, um union type de string literal que corresponde **exatamente** ao conjunto de valores do enum equivalente do backend (`simplecote-back/spec.md` §9 e os enums Java correspondentes) — mesmos nomes, mesma cardinalidade, sem valor a mais nem a menos. Nenhum desses campos SHALL ser tipado como `string` solto. Em particular:

- `StatusCotacao` cobre `RASCUNHO`, `ABERTA`, `ENCERRADA`, `PEDIDOS_GERADOS`, `CANCELADA`;
- o status de Pedido cobre `GERADO`, `ENVIADO`, `CONFIRMADO`.

#### Scenario: StatusCotacao completo e sem valor inexistente
- **WHEN** uma tela ramifica o comportamento pelo status de uma Cotação
- **THEN** os cinco estados do backend (`RASCUNHO`, `ABERTA`, `ENCERRADA`, `PEDIDOS_GERADOS`, `CANCELADA`) são reconhecidos, e um valor fora desse conjunto (ex.: `APURADA`) é rejeitado em tempo de compilação

#### Scenario: Status recebido da API é atribuível ao union type
- **WHEN** a API devolve um objeto com `status: "PEDIDOS_GERADOS"`
- **THEN** o valor é atribuível ao tipo `StatusCotacao` sem cast, e o compilador cobre um `switch`/`if` exaustivo sobre ele
