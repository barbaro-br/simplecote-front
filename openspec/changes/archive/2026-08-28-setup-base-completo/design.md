## Context

Veja `proposal.md` para motivação e `specs/` para requisitos. Como unimos o setup inicial com as melhorias de domínio que o backend demanda, precisamos montar a arquitetura de pastas, o provedor global do `react-query`, configurar as rotas e, ao mesmo tempo, inserir MSW e formatadores nativos.

## Goals / Non-Goals

**Goals:**
- Configurar TanStack Query com cache padrão (e desativando re-fetch incondicional para focar em testes).
- Estruturar o `api-client.ts` com um interceptor fino usando a Fetch API nativa.
- Configurar MSW (`msw/node` para testes via Vitest).
- Implementar `formatters.ts` que utilizem API nativa do navegador (`Intl`).

**Non-Goals:**
- Criar a UI inteira agora (será montada por feature-slice, como Produtos, depois).
- Criar schemas Zod extensivos agora (apenas infra).

## Decisions

- **Fetch nativo**: Optou-se por usar a Fetch API nativa sobre Axios para manter a aplicação o mais leve possível e alinhada com as diretrizes da especificação (não trazer dependências desnecessárias). O `api-client` encapsula o tratamento.
- **Estrutura de Pastas Feature-Sliced**: Como definido na spec do projeto (e do backend), teremos pacotes isolados por domínio, como `src/admin/produtos`. Neste setup criaremos a pasta `src/shared` (onde fica api e formatadores).
- **MSW para Mocking**: O MSW intercepta chamadas via polyfills no Node/Vitest, incentivando testes mais próximos à realidade sem precisar de um servidor ativo (ou injetar fetchers na mão nos componentes).
- **Formatação Nativa `Intl`**: Evita-se bibliotecas grandes como `date-fns`/`moment` usando as primitivas nativas do navegador (`Intl.NumberFormat` e `Intl.DateTimeFormat`) para converter números puros do backend em visões pt-BR ricas.

## Risks / Trade-offs

- **Risk**: Testes de MSW podem se tornar confusos se cada teste tiver que recriar o servidor mock.
  - **Mitigation**: Setup global do MSW num `setupTests.ts` rodando no Vitest, com reset de handlers ao final de cada teste de forma centralizada.
