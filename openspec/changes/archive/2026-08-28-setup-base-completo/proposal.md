## Why

O projeto front-end do SimpleCote (React 19 + Vite + TypeScript) acabou de ser criado e precisa das suas fundações para a Fase 1. Precisamos unificar o setup base de roteamento e estilo com as restrições estritas descritas no backend (tratamento de erros RFC 7807, formatações rigorosas de dados e malha de testes com MSW).

## What Changes

- Configuração do alias de paths (`@/*`), React Router para rotas duplas (`/admin` e públicas) e utilitários globais.
- Implementação de um client HTTP (`api-client.ts`) amparado pelo TanStack Query, que consome `ProblemDetail` traduzindo-o de forma previsível.
- Configuração de testes unitários sem dependência da rede através do Mock Service Worker (MSW), integrados ao Vitest e React Testing Library.
- Formatação centralizada para datas ISO-8601 UTC (formatando para `America/Sao_Paulo`) e Dinheiro (BRL) usando `Intl`.
- Criação dos DTOs comuns e enums do backend.

## Capabilities

### New Capabilities
- `core/setup`: Setup das árvores de rota do Admin e Representante e o cliente HTTP base.
- `core/test-infra`: Estabelece a infraestrutura de testes da aplicação via MSW.
- `core/domain-types`: Estabelece formatadores base (`Intl`) e conversores do domínio (erros, enums, DTOs compartilhados) em paridade com o backend.

### Modified Capabilities
*(nenhuma)*

## Impact

Cria uma fundação extremamente sólida, garantindo que componentes criados nas fases seguintes nascerão já suportados por tratamento de erros, cache HTTP com queries e testes de integração front-end de alta fidelidade.
