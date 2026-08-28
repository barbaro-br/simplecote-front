## Context

Veja `proposal.md` para motivação e `specs/` para requisitos. Precisamos estruturar os utilitários de tratamento de dados que o backend (Spring Boot 4, Bean Validation, ProblemDetail, BigDecimal) exporta em seus contratos, de forma centralizada e sem vazar dependências pesadas de bibliotecas de terceiros (usaremos ferramentas nativas sempre que possível). E preparar o vitest com MSW.

## Goals / Non-Goals

**Goals:**
- Configurar MSW (`msw/node` para testes via Vitest).
- Implementar `formatters.ts` que utilizem API nativa do navegador (`Intl`).

**Non-Goals:**
- Criar schemas Zod para *todas* as rotas da API agora (será feito por cada feature nas fases seguintes, seguindo a fatia de referência de Produtos).

## Decisions

- **MSW para Mocking**: O MSW roda intercepções ao nível de rede usando Service Workers em runtime, mas em Node/Vitest intercepta via polyfills no Node. Isso provou ser mais escalável do que injetar Mocks nos hooks do `react-query` manualmente, pois replica mais próximo um browser e incentiva a criação de testes de integração front-end de alta fidelidade.
- **Formatação Nativa `Intl`**: Evitamos `date-fns` e `dayjs` por orientação da spec. Como as manipulações de tempo no SimpleCote front-end são apenas para visualização de prazos da cotação e relatórios simples (não envolverá cáculos matemáticos de fuso complexos), o `Intl` nativo resolve todos os problemas com footprint de bundle zero.

## Risks / Trade-offs

- **Risk**: Testes de MSW podem se tornar lentos se o setup for feito por-teste e não de forma global.
  - **Mitigation**: Setup global do MSW em um arquivo `setupTests.ts` que roda antes dos workers do Vitest e usa `server.resetHandlers()` para resetar o estado.
