## Context

A nova feature de Produtos baseia-se estritamente na "Fatia de referência" descrita no `spec.md` raiz. Já possuímos a stack inteira configurada (Zod, React Query, shadcn, React Hook Form, Fetch API e MSW). Veja a motivação em `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Implementar a página de Produtos seguindo rigorosamente a arquitetura de referência.
- Manter acoplamento com a rede isolado no `produtos.api.ts`.
- Manter validações isoladas no `produtos.schema.ts`.

**Non-Goals:**
- Consulta externa por GTIN não será conectada ao backend neste momento inicial, focaremos apenas no CRUD padrão da listagem e formulário básico (a consulta GTIN ficará na fatia 2 ou via mock simples se necessário).

## Decisions

- **React Query + Fetch:** Utilizaremos `api-client` (Fetch wrapper) já criado para as operações de CRUD.
- **Formulários:** Validação baseada em Zod refletindo diretamente o DTO que o backend espera (`CriarProdutoRequest`).
- **Testes MSW:** Assim como na fatia de referência, as requisições para a API não ocorrerão de verdade em ambiente de teste, o `msw` interceptará retornando os stubs baseados no modelo do backend.

## Risks / Trade-offs

- **Formulário complexo vs UX Simples:** O DTO possui embalagens estritas e quantidades mínimas. Como mitigação, criaremos os DTOs idênticos no frontend utilizando Zod enumerators para que o catch de erro seja imediato na digitação, poupando a requisição e a tradução do `ProblemDetail` por Bean Validation que só aconteceria na submissão.
