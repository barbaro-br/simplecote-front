## Purpose

Mapeia as restrições estritas do backend para o front-end, garantindo que dinheiro, tempo e erros possuam formatação e tradução padronizadas na origem.

## ADDED Requirements

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
